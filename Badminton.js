// Data lapangan badminton
const badmintonFacilities = {
    badminton: {
        name: "Badminton",
        fields: [
            { id: 1, name: "Lapangan 1", price: 45000 },
            { id: 2, name: "Lapangan 2", price: 45000 },
            { id: 3, name: "Lapangan 3", price: 45000 },
            { id: 4, name: "Lapangan 4", price: 45000 }
        ],
        timeSlots: [
            "07:00 - 08:00", "08:00 - 09:00", "09:00 - 10:00", 
            "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00",
            "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00",
            "16:00 - 17:00", "17:00 - 18:00", "18:00 - 19:00",
            "19:00 - 20:00", "20:00 - 21:00", "21:00 - 22:00",
            "22:00 - 23:00", "23:00 - 00:00"
        ]
    }
};

// ==================== FUNGSI UNTUK MEMPERBAIKI MASALAH WAKTU 23:00 - 00:00 ====================
function parseBookingTime(bookingDate, timeSlot) {
    const [startTime, endTime] = timeSlot.split(' - ');
    
    // Handle special case for 23:00 - 00:00
    if (endTime === '00:00' || endTime === '24:00') {
        const nextDay = new Date(bookingDate);
        nextDay.setDate(nextDay.getDate() + 1);
        const nextDayStr = nextDay.toISOString().split('T')[0];
        
        return {
            start: new Date(`${bookingDate}T${startTime}`),
            end: new Date(`${nextDayStr}T00:00`),
            originalTimeSlot: timeSlot
        };
    }
    
    return {
        start: new Date(`${bookingDate}T${startTime}`),
        end: new Date(`${bookingDate}T${endTime}`),
        originalTimeSlot: timeSlot
    };
}

// ==================== AUTO CLEANUP SYSTEM - DIPERBAIKI UNTUK WAKTU 23:00-00:00 ====================
const AutoCleanupSystem = {
    isRunning: false,
    cleanupInterval: null,
    
    init() {
        if (this.isRunning) return;
        
        console.log('🔄 Auto Cleanup System initialized for Badminton');
        
        // Jalankan cleanup pertama kali
        this.performAutoCleanup();
        
        // Setup interval untuk cleanup otomatis setiap 30 detik
        this.cleanupInterval = setInterval(() => {
            this.performAutoCleanup();
        }, 30000);
        
        this.isRunning = true;
    },
    
    performAutoCleanup() {
        try {
            const now = new Date();
            const today = now.toISOString().split('T')[0];
            let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
            let revenueHistory = JSON.parse(localStorage.getItem('revenueHistory')) || [];
            
            const activeReservations = [];
            let completedCount = 0;
            let changesMade = false;
            
            reservations.forEach(reservation => {
                if (reservation.sportType === 'badminton') {
                    // Gunakan parsing waktu yang benar untuk handle 23:00-00:00
                    const timeInfo = parseBookingTime(reservation.date, reservation.time);
                    const bookingEnd = timeInfo.end;
                    
                    // Jika waktu booking sudah lewat
                    if (bookingEnd < now) {
                        // Booking sudah selesai, pindahkan ke revenue history jika ada pembayaran
                        if (reservation.paidAmount > 0) {
                            // Cek apakah sudah ada di revenue history
                            const existingInRevenue = revenueHistory.find(r => r.id === reservation.id);
                            
                            if (!existingInRevenue) {
                                revenueHistory.push({
                                    ...reservation,
                                    status: 'completed',
                                    completedAt: new Date().toISOString(),
                                    movedToRevenue: true,
                                    autoCleaned: true
                                });
                                console.log(`💰 Auto-moved completed booking to revenue: ${reservation.customerName}`);
                            }
                        }
                        completedCount++;
                        changesMade = true;
                        // Tidak dimasukkan ke activeReservations (artinya dihapus dari booking aktif)
                    } else {
                        // Masih aktif, pertahankan
                        activeReservations.push(reservation);
                    }
                } else {
                    // Bukan badminton, pertahankan
                    activeReservations.push(reservation);
                }
            });
            
            // Simpan perubahan jika ada yang di-cleanup
            if (changesMade) {
                localStorage.setItem('reservations', JSON.stringify(activeReservations));
                localStorage.setItem('revenueHistory', JSON.stringify(revenueHistory));
                
                console.log(`🧹 Auto cleanup: ${completedCount} badminton bookings marked as completed`);
                
                // Update stats dan tampilan
                updateQuickStats();
                generateExcelTable();
                
                // Notify perubahan data
                DataSyncManager.handleDataChange('auto-cleanup');
                
                // Tampilkan notifikasi jika ada perubahan
                if (completedCount > 0) {
                    this.showCleanupNotification(completedCount);
                }
            }
            
            return completedCount;
            
        } catch (error) {
            console.error('Error in auto cleanup:', error);
            return 0;
        }
    },
    
    showCleanupNotification(count) {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.style.background = '#f59e0b';
        notification.innerHTML = `
            <span>⏰</span>
            <span>${count} booking selesai otomatis</span>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    },
    
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.isRunning = false;
        console.log('🔄 Auto Cleanup System stopped');
    }
};

// Real-time Data Sync Manager
const DataSyncManager = {
    lastUpdate: null,
    isInitialized: false,
    
    init() {
        if (this.isInitialized) return;
        
        this.setupEventListeners();
        this.checkInitialUpdate();
        this.isInitialized = true;
        
        console.log('🔄 Real-time Data Sync Manager initialized for Badminton');
    },
    
    setupEventListeners() {
        // Listen for storage changes from other tabs/windows
        window.addEventListener('storage', (e) => {
            if (e.key === 'reservations' || e.key === 'lastDataUpdate') {
                console.log('💾 Storage change detected:', e.key);
                this.handleDataChange('storage');
            }
        });
        
        // Listen for custom events from admin (same tab)
        window.addEventListener('reservationDataChanged', (e) => {
            console.log('📢 Custom event received:', e.detail);
            this.handleDataChange('event');
        });
        
        // Check when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                console.log('👀 Page visible, checking for updates...');
                this.checkForUpdates();
                // Jalankan cleanup ketika halaman aktif kembali
                AutoCleanupSystem.performAutoCleanup();
            }
        });
    },
    
    checkInitialUpdate() {
        this.lastUpdate = localStorage.getItem('lastDataUpdate');
        sessionStorage.setItem('myLastUpdate', this.lastUpdate || '');
        this.updateLastUpdateDisplay();
    },
    
    checkForUpdates() {
        const currentUpdate = localStorage.getItem('lastDataUpdate');
        if (currentUpdate !== this.lastUpdate) {
            console.log('🔄 Data update detected via polling');
            this.handleDataChange('polling');
            this.lastUpdate = currentUpdate;
            sessionStorage.setItem('myLastUpdate', currentUpdate || '');
        }
    },
    
    handleDataChange(source) {
        console.log(`🔄 Data change handled from: ${source}`);
        
        // Refresh displays
        generateExcelTable();
        updateQuickStats();
        this.updateLastUpdateDisplay();
        
        // Show notification
        this.showUpdateNotification();
    },
    
    showUpdateNotification() {
        // Remove existing notification if any
        const existingNotification = document.querySelector('.update-notification');
        if (existingNotification) {
            existingNotification.remove();
        }
        
        // Create new notification
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <span>✅</span>
            <span>Jadwal berhasil diperbarui</span>
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    },
    
    updateLastUpdateDisplay() {
        const lastUpdateElement = document.getElementById('last-update');
        if (lastUpdateElement) {
            const lastUpdate = localStorage.getItem('lastDataUpdate');
            if (lastUpdate) {
                const date = new Date(lastUpdate);
                lastUpdateElement.textContent = date.toLocaleTimeString('id-ID');
            } else {
                lastUpdateElement.textContent = '-';
            }
        }
    },
    
    manualRefresh() {
        console.log('🔄 Manual refresh triggered');
        // Jalankan cleanup sebelum refresh
        AutoCleanupSystem.performAutoCleanup();
        this.handleDataChange('manual');
        this.showUpdateNotification();
    }
};

// ==================== FUNGSI STATUS BOOKING YANG DIPERBAIKI ====================
function getBookingStatus(bookingDate, bookingTime, hasBooking = false) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Parse waktu booking dengan handling khusus untuk 00:00
    const timeInfo = parseBookingTime(bookingDate, bookingTime);
    const bookingStart = timeInfo.start;
    const bookingEnd = timeInfo.end;
    
    // PERBAIKAN: Cek apakah waktu booking sudah lewat (baik tanggal atau waktu)
    const isPastTime = bookingEnd < now;
    
    if (isPastTime) {
        // Waktu sudah lewat - bedakan antara yang ada booking dan tidak
        if (hasBooking) {
            return { 
                status: 'past-booked', 
                text: 'Selesai', 
                class: 'status-past-booked',
                cellClass: 'past-booked-cell'
            };
        } else {
            return { 
                status: 'past-available', 
                text: 'Waktu Lewat', 
                class: 'status-past-available',
                cellClass: 'past-available-cell'
            };
        }
    } else if (bookingDate > today) {
        // Booking di masa depan
        if (hasBooking) {
            return { 
                status: 'booked', 
                text: 'Terbooking', 
                class: 'status-booked',
                cellClass: 'booked-cell'
            };
        } else {
            return { 
                status: 'available', 
                text: 'Tersedia', 
                class: 'status-available',
                cellClass: 'available-cell'
            };
        }
    } else {
        // Hari yang sama
        if (now < bookingStart) {
            // Belum mulai
            if (hasBooking) {
                return { 
                    status: 'booked', 
                    text: 'Terbooking', 
                    class: 'status-booked',
                    cellClass: 'booked-cell'
                };
            } else {
                return { 
                    status: 'available', 
                    text: 'Tersedia', 
                    class: 'status-available',
                    cellClass: 'available-cell'
                };
            }
        } else if (now >= bookingStart && now <= bookingEnd) {
            // Sedang berlangsung
            return { 
                status: 'ongoing', 
                text: 'Berlangsung', 
                class: 'status-ongoing',
                cellClass: 'ongoing-cell'
            };
        } else {
            // PERBAIKAN: Seharusnya tidak terjadi karena sudah dicek di atas
            // Fallback untuk safety
            if (hasBooking) {
                return { 
                    status: 'past-booked', 
                    text: 'Selesai', 
                    class: 'status-past-booked',
                    cellClass: 'past-booked-cell'
                };
            } else {
                return { 
                    status: 'past-available', 
                    text: 'Waktu Lewat', 
                    class: 'status-past-available',
                    cellClass: 'past-available-cell'
                };
            }
        }
    }
}

// Fungsi untuk memformat tanggal
function formatDate(dateString) {
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', options);
}

// Fungsi untuk mendapatkan daftar tanggal dalam rentang
function getDateRange(startDate, endDate) {
    const dates = [];
    const currentDate = new Date(startDate);
    const end = new Date(endDate);
    
    while (currentDate <= end) {
        dates.push(new Date(currentDate).toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
}

// ==================== FUNGSI GENERATE TABEL BARU - SETIAP LAPANGAN TERPISAH DENGAN SCROLL HORIZONTAL ====================

// Fungsi untuk generate tabel Excel - DIPERBAIKI DENGAN LAYOUT BARU
function generateExcelTable() {
    try {
        const startDate = document.getElementById('filter-start-date').value;
        const endDate = document.getElementById('filter-end-date').value;
        const fieldFilter = document.getElementById('filter-field').value;
        
        // Get fresh data from localStorage
        let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
        const revenueHistory = JSON.parse(localStorage.getItem('revenueHistory')) || [];
        
        console.log(`📊 Generating Excel table for ${reservations.length} reservations`);
        
        // Filter hanya badminton reservations
        let filteredReservations = reservations.filter(reservation => reservation.sportType === 'badminton');
        
        // Field filter
        if (fieldFilter !== 'all') {
            filteredReservations = filteredReservations.filter(
                reservation => reservation.fieldNumber == fieldFilter
            );
        }
        
        // Tentukan rentang tanggal
        const today = new Date().toISOString().split('T')[0];
        const defaultStartDate = startDate || today;
        const defaultEndDate = endDate || new Date(new Date().setDate(new Date().getDate() + 6)).toISOString().split('T')[0];
        
        // Update filter inputs
        if (!startDate) document.getElementById('filter-start-date').value = defaultStartDate;
        if (!endDate) document.getElementById('filter-end-date').value = defaultEndDate;
        
        const dateRange = getDateRange(defaultStartDate, defaultEndDate);
        const timeSlots = badmintonFacilities.badminton.timeSlots;
        const fields = badmintonFacilities.badminton.fields;
        
        // Render tabel dengan layout baru
        renderExcelTableNewLayout(dateRange, timeSlots, fields, filteredReservations, revenueHistory, fieldFilter);
        
    } catch (error) {
        console.error('Error generating Excel table:', error);
        const container = document.getElementById('excel-table-container');
        container.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Error memuat data. Silakan refresh halaman.</p>
            </div>
        `;
    }
}

// Fungsi untuk render tabel Excel dengan LAYOUT BARU - Setiap lapangan terpisah dengan scroll horizontal
function renderExcelTableNewLayout(dateRange, timeSlots, fields, filteredReservations, revenueHistory, fieldFilter) {
    const container = document.getElementById('excel-table-container');
    
    if (fields.length === 0) {
        container.innerHTML = `
            <div class="loading">
                <p>📅 Tidak ada data lapangan untuk ditampilkan.</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    // Buat tabel terpisah untuk setiap lapangan
    fields.forEach(field => {
        // Skip jika filter lapangan aktif dan tidak match
        if (fieldFilter !== 'all' && field.id != fieldFilter) {
            return;
        }
        
        html += `
            <div class="field-table-container">
                <div class="field-header">
                    <h3>${field.name}</h3>
                </div>
                <div class="field-table-wrapper">
                    <table class="field-table">
                        <thead>
                            <tr>
                                <th class="time-column">Waktu / Tanggal</th>
        `;
        
        // Header tanggal
        dateRange.forEach(date => {
            html += `<th>${formatDate(date)}</th>`;
        });
        
        html += `</tr></thead><tbody>`;
        
        // Data untuk setiap time slot
        timeSlots.forEach(timeSlot => {
            html += `<tr>`;
            // PERBAIKAN: Kolom waktu dengan class time-column
            html += `<td class="time-column">${timeSlot}</td>`;
            
            dateRange.forEach(date => {
                // Cek apakah ada booking untuk kombinasi ini
                const booking = filteredReservations.find(r => 
                    r.fieldNumber == field.id && 
                    r.date === date && 
                    r.time === timeSlot
                );
                
                // Cek juga di revenue history untuk booking yang sudah selesai
                const completedBooking = revenueHistory.find(r => 
                    r.sportType === 'badminton' &&
                    r.fieldNumber == field.id && 
                    r.date === date && 
                    r.time === timeSlot
                );
                
                if (booking || completedBooking) {
                    const currentBooking = booking || completedBooking;
                    const status = getBookingStatus(date, timeSlot, true);
                    // PERBAIKAN: Hanya tambahkan class status untuk sel data biasa, bukan kolom waktu
                    html += `<td class="${status.cellClass}">`;
                    html += `<span class="status-badge ${status.class}">${status.text}</span>`;
                    
                    if (currentBooking.customerName) {
                        html += `<br><small>${currentBooking.customerName}</small>`;
                        const customerType = currentBooking.customerType || 'umum';
                        const customerTypeClass = customerType === 'member' ? 'customer-member' : 'customer-umum';
                        const customerTypeText = customerType === 'member' ? 'Member' : 'Umum';
                        html += `<br><span class="customer-type-badge ${customerTypeClass}">${customerTypeText}</span>`;
                    }
                    
                    html += `</td>`;
                } else {
                    const status = getBookingStatus(date, timeSlot, false);
                    // PERBAIKAN: Hanya tambahkan class status untuk sel data biasa, bukan kolom waktu
                    html += `<td class="${status.cellClass}">`;
                    html += `<span class="status-badge ${status.class}">${status.text}</span>`;
                    html += `</td>`;
                }
            });
            
            html += `</tr>`;
        });
        
        html += `</tbody></table></div></div>`;
    });
    
    if (!html) {
        container.innerHTML = `
            <div class="loading">
                <p>📅 Tidak ada data booking untuk rentang tanggal yang dipilih.</p>
                <p class="suggestion">Coba gunakan rentang tanggal yang berbeda.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = html;
    
    // Tambahkan event listener untuk scroll horizontal
    setupHorizontalScroll();
}

// Fungsi untuk setup scroll horizontal - DIPERBAIKI
function setupHorizontalScroll() {
    const tableWrappers = document.querySelectorAll('.field-table-wrapper');
    
    tableWrappers.forEach(wrapper => {
        const table = wrapper.querySelector('.field-table');
        
        // Force reflow untuk memastikan sticky bekerja
        setTimeout(() => {
            if (table.scrollWidth > wrapper.clientWidth) {
                wrapper.style.overflowX = 'auto';
                console.log('📊 Horizontal scroll activated for table');
            } else {
                wrapper.style.overflowX = 'visible';
            }
        }, 100);
    });
}

// Fungsi untuk update quick stats - DIPERBAIKI DENGAN LOGIKA YANG BENAR
function updateQuickStats() {
    try {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date();
        const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
        const revenueHistory = JSON.parse(localStorage.getItem('revenueHistory')) || [];
        
        // Filter hanya badminton
        const badmintonReservations = reservations.filter(r => r.sportType === 'badminton');
        const badmintonRevenue = revenueHistory.filter(r => 
            r.sportType === 'badminton' && 
            r.date === today &&
            r.movedToRevenue
        );
        
        // Hitung booking aktif untuk hari ini (hanya yang belum lewat)
        const activeTodayBookings = badmintonReservations.filter(r => {
            if (r.date !== today) return false;
            
            // Gunakan parsing waktu yang benar untuk handle 23:00-00:00
            const timeInfo = parseBookingTime(r.date, r.time);
            const bookingEnd = timeInfo.end;
            
            // Hanya hitung yang belum lewat waktunya
            return bookingEnd >= now;
        }).length;
        
        // Total booking aktif (semua tanggal yang belum lewat)
        const totalActiveBookings = badmintonReservations.filter(r => {
            // Gunakan parsing waktu yang benar untuk handle 23:00-00:00
            const timeInfo = parseBookingTime(r.date, r.time);
            const bookingEnd = timeInfo.end;
            
            // Hanya hitung yang belum lewat waktunya
            return bookingEnd >= now;
        }).length;
        
        // Booking yang selesai hari ini (dari revenue history)
        const completedToday = badmintonRevenue.length;
        
        // Update UI
        document.getElementById('booked-fields').textContent = activeTodayBookings;
        document.getElementById('total-bookings').textContent = totalActiveBookings;
        document.getElementById('completed-today').textContent = completedToday;
        
        console.log('📊 Quick Stats Updated:', {
            activeTodayBookings,
            totalActiveBookings,
            completedToday,
            totalReservations: badmintonReservations.length
        });
        
    } catch (error) {
        console.error('Error updating quick stats:', error);
    }
}

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-menu a').forEach(item => {
        item.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(new Date().setDate(new Date().getDate() + 6)).toISOString().split('T')[0];
    
    document.getElementById('filter-start-date').value = today;
    document.getElementById('filter-start-date').setAttribute('min', today);
    document.getElementById('filter-end-date').value = nextWeek;
    document.getElementById('filter-end-date').setAttribute('min', today);
    
    // Initialize Systems
    DataSyncManager.init();
    AutoCleanupSystem.init();
    
    // Initial display
    generateExcelTable();
    updateQuickStats();
    
    // Filter functionality
    document.getElementById('filter-start-date').addEventListener('change', generateExcelTable);
    document.getElementById('filter-end-date').addEventListener('change', generateExcelTable);
    document.getElementById('filter-field').addEventListener('change', generateExcelTable);
    document.getElementById('reset-filter').addEventListener('click', resetFilters);
    document.getElementById('refresh-data').addEventListener('click', function() {
        DataSyncManager.manualRefresh();
    });
    
    // Check for updates every 3 seconds
    setInterval(() => DataSyncManager.checkForUpdates(), 3000);
    
    // Setup auto cleanup setiap 1 menit
    setInterval(() => {
        AutoCleanupSystem.performAutoCleanup();
    }, 60000);
    
    console.log('✅ Badminton Booking Page loaded successfully with Auto Cleanup and Horizontal Scroll!');
});

function resetFilters() {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(new Date().setDate(new Date().getDate() + 6)).toISOString().split('T')[0];
    
    document.getElementById('filter-start-date').value = today;
    document.getElementById('filter-end-date').value = nextWeek;
    document.getElementById('filter-field').value = 'all';
    
    generateExcelTable();
    updateQuickStats();
}

// Cleanup ketika halaman ditutup
window.addEventListener('beforeunload', function() {
    AutoCleanupSystem.destroy();
});

// Handle window resize untuk responsive scroll
window.addEventListener('resize', function() {
    // Re-check scroll requirements setelah resize
    setTimeout(() => {
        setupHorizontalScroll();
    }, 100);
});