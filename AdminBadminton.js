// Fungsi untuk debug status booking
function debugBookingStatus() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    
    console.log('🔍 DEBUG BOOKING STATUS:');
    console.log('Waktu sekarang:', now.toLocaleString('id-ID'));
    console.log('Tanggal hari ini:', today);
    
    reservations.forEach((reservation, index) => {
        if (reservation.sportType === 'badminton') {
            const timeInfo = parseBookingTime(reservation.date, reservation.time);
            const isPast = timeInfo.end < now;
            
            console.log(`Booking ${index + 1}:`, {
                customer: reservation.customerName,
                date: reservation.date,
                time: reservation.time,
                endTime: timeInfo.end.toLocaleString('id-ID'),
                isPast: isPast,
                status: getBookingStatus(reservation.date, reservation.time, true)
            });
        }
    });
}

// PROTEKSI ADMIN - Cek apakah user sudah login sebagai admin yang sesuai
function checkAdminAuth() {
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    const loginTime = sessionStorage.getItem('loginTime');
    const adminType = sessionStorage.getItem('adminType');
    const currentPage = window.location.pathname;
    
    // Jika belum login atau session expired (8 jam)
    if (!isLoggedIn || !loginTime || (new Date().getTime() - parseInt(loginTime)) > 8 * 60 * 60 * 1000) {
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('loginTime');
        sessionStorage.removeItem('adminType');
        sessionStorage.removeItem('adminUsername');
        window.location.href = 'Login.html';
        return false;
    }
    
    // Cek apakah admin mengakses halaman yang sesuai
    if (currentPage.includes('AdminBadminton.html') && adminType !== 'badminton') {
        redirectToCorrectAdmin(adminType);
        return false;
    }
    
    if (currentPage.includes('AdminMiniSoccer.html') && adminType !== 'minisoccer') {
        redirectToCorrectAdmin(adminType);
        return false;
    }
    
    return true;
}

function redirectToCorrectAdmin(adminType) {
    if (adminType === 'badminton') {
        window.location.href = 'AdminBadminton.html';
    } else if (adminType === 'minisoccer') {
        window.location.href = 'AdminMiniSoccer.html';
    } else {
        window.location.href = 'admin.html';
    }
}

// Data lapangan badminton untuk schedule view
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

// Data lapangan dan jadwal khusus BADMINTON - HARGA DIPERBAIKI SESUAI REVISI
const facilities = {
    badminton: {
        name: "Badminton",
        fields: [
            { id: 1, name: "Lapangan Badminton 1", basePrice: 45000 },
            { id: 2, name: "Lapangan Badminton 2", basePrice: 45000 },
            { id: 3, name: "Lapangan Badminton 3", basePrice: 45000 },
            { id: 4, name: "Lapangan Badminton 4", basePrice: 45000 }
        ],
        // Time slots khusus badminton
        timeSlots: [
            "07:00 - 08:00", "08:00 - 09:00", "09:00 - 10:00", 
            "10:00 - 11:00", "11:00 - 12:00", "12:00 - 13:00",
            "13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00",
            "16:00 - 17:00", "17:00 - 18:00", "18:00 - 19:00",
            "19:00 - 20:00", "20:00 - 21:00", "21:00 - 22:00",
            "22:00 - 23:00", "23:00 - 00:00"
        ],
        // Harga khusus badminton untuk umum - DIPERBAIKI
        timePrices: {
            "07:00 - 08:00": 45000,
            "08:00 - 09:00": 45000,
            "09:00 - 10:00": 45000,
            "10:00 - 11:00": 45000,
            "11:00 - 12:00": 45000,
            "12:00 - 13:00": 45000,
            "13:00 - 14:00": 45000,
            "14:00 - 15:00": 45000,
            "15:00 - 16:00": 45000,
            "16:00 - 17:00": 50000,
            "17:00 - 18:00": 50000,
            "18:00 - 19:00": 50000,
            "19:00 - 20:00": 50000,
            "20:00 - 21:00": 50000,
            "21:00 - 22:00": 50000,
            "22:00 - 23:00": 50000,
            "23:00 - 00:00": 50000
        },
        // HARGA PAKET MEMBER BADMINTON SESUAI REVISI - DIPERBAIKI: 4 MINGGU BERTURUT-TURUT
        memberPackage: {
            // Senin-Jumat 07:00-16:00: Rp 400.000
            weekdayMorning: 400000,
            // Senin-Jumat 16:00-00:00: Rp 425.000
            weekdayEvening: 425000,
            // Sabtu-Ahad 07:00-00:00: Rp 425.000
            weekend: 425000,
            sessionsPerMonth: 4,
            hoursPerSession: 3, // 3 jam per sesi
            totalHours: 12 // total 12 jam per bulan
        }
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

function validateBookingTime(bookingDate, bookingTime) {
    const now = new Date();
    const timeInfo = parseBookingTime(bookingDate, bookingTime);
    const bookingStart = timeInfo.start;
    
    return bookingStart >= now;
}

function checkFieldAvailability(fieldNumber, bookingDate, bookingTime) {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    
    return !reservations.some(reservation => {
        if (reservation.sportType === 'badminton' && 
            reservation.fieldNumber == fieldNumber && 
            reservation.date === bookingDate) {
            
            // Gunakan parsing yang sama untuk konsistensi
            const reservedTimeInfo = parseBookingTime(reservation.date, reservation.time);
            const newTimeInfo = parseBookingTime(bookingDate, bookingTime);
            
            // Cek apakah ada overlap waktu
            return (newTimeInfo.start < reservedTimeInfo.end && 
                   newTimeInfo.end > reservedTimeInfo.start);
        }
        return false;
    });
}

// ==================== FUNGSI BARU: CEK KETERSEDIAAN 3 JAM DI HARI YANG SAMA ====================
function checkMemberSessionAvailability(fieldNumber, bookingDate, bookingTime) {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const timeSlots = facilities.badminton.timeSlots;
    const currentTimeIndex = timeSlots.indexOf(bookingTime);
    
    // Cari 2 slot berikutnya untuk total 3 jam (3 sesi) di hari yang sama
    const nextSlots = timeSlots.slice(currentTimeIndex + 1, currentTimeIndex + 3);
    
    // Jika tidak cukup slot tersedia untuk 3 jam
    if (nextSlots.length < 2) {
        return {
            available: false,
            reason: 'Tidak cukup waktu tersedia untuk 3 jam berturut-turut di hari yang sama'
        };
    }
    
    // Cek ketersediaan untuk semua 3 slot (slot awal + 2 berikutnya)
    const allSlots = [bookingTime, ...nextSlots];
    const unavailableSlots = [];
    
    for (const slot of allSlots) {
        const isAvailable = !reservations.some(reservation => {
            if (reservation.sportType === 'badminton' && 
                reservation.fieldNumber == fieldNumber && 
                reservation.date === bookingDate &&
                reservation.time === slot) {
                return true;
            }
            return false;
        });
        
        if (!isAvailable) {
            unavailableSlots.push(slot);
        }
    }
    
    if (unavailableSlots.length > 0) {
        return {
            available: false,
            reason: `Waktu berikut sudah terbooking: ${unavailableSlots.join(', ')}`
        };
    }
    
    return {
        available: true,
        slots: allSlots
    };
}

// ==================== FUNGSI BARU: CEK KETERSEDIAAN 4 MINGGU BERTURUT-TURUT ====================
function checkMemberMonthlyAvailability(fieldNumber, startDate, bookingTime) {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const unavailableWeeks = [];
    
    // Cek ketersediaan untuk 4 minggu berturut-turut
    for (let week = 0; week < 4; week++) {
        const currentWeekDate = new Date(startDate);
        currentWeekDate.setDate(currentWeekDate.getDate() + (week * 7));
        const currentWeekDateStr = currentWeekDate.toISOString().split('T')[0];
        
        // Cek ketersediaan 3 jam di minggu ini
        const weekAvailability = checkMemberSessionAvailability(fieldNumber, currentWeekDateStr, bookingTime);
        
        if (!weekAvailability.available) {
            unavailableWeeks.push({
                week: week + 1,
                date: currentWeekDateStr,
                reason: weekAvailability.reason
            });
        }
    }
    
    if (unavailableWeeks.length > 0) {
        return {
            available: false,
            reason: `Tidak tersedia di minggu ke-${unavailableWeeks.map(w => w.week).join(', ')}`
        };
    }
    
    return {
        available: true
    };
}

// ==================== FUNGSI BARU: HITUNG HARGA MEMBER SESUAI REVISI ====================
function calculateMemberPrice(bookingDate, bookingTime) {
    const date = new Date(bookingDate);
    const dayOfWeek = date.getDay(); // 0 = Minggu, 1 = Senin, ..., 6 = Sabtu
    const [startTime] = bookingTime.split(' - ');
    const hour = parseInt(startTime.split(':')[0]);
    
    // Sabtu (6) atau Minggu (0) - weekend
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        return facilities.badminton.memberPackage.weekend; // Rp 425.000
    } 
    // Senin-Jumat (1-5)
    else {
        // 07:00 - 16:00
        if (hour >= 7 && hour < 16) {
            return facilities.badminton.memberPackage.weekdayMorning; // Rp 400.000
        } 
        // 16:00 - 00:00
        else {
            return facilities.badminton.memberPackage.weekdayEvening; // Rp 425.000
        }
    }
}

// DOM Elements - Disesuaikan dengan HTML yang ada
const customerTypeSelect = document.getElementById('customer-type');
const fieldNumberSelect = document.getElementById('field-number');
const bookingDateInput = document.getElementById('booking-date');
const bookingTimeSelect = document.getElementById('booking-time');
const bookingForm = document.getElementById('booking-form');
const totalAmountInput = document.getElementById('total-amount');
const paidAmountInput = document.getElementById('paid-amount');
const remainingAmountInput = document.getElementById('remaining-amount');
const managementList = document.getElementById('management-list');
const searchInput = document.getElementById('search-booking');
const searchBtn = document.getElementById('search-btn');
const filterPayment = document.getElementById('filter-payment');
const filterCustomerType = document.getElementById('filter-customer-type');
const filterField = document.getElementById('filter-field');
const filterDate = document.getElementById('filter-management-date');
const resetManagement = document.getElementById('reset-management');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const closeModal = document.querySelector('.close');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

// Stats elements - Disesuaikan dengan HTML yang ada
const todayBookingsEl = document.getElementById('today-bookings');
const bookedFieldsEl = document.getElementById('booked-fields');
const dailyRevenueEl = document.getElementById('daily-revenue');
const memberBookingsEl = document.getElementById('member-bookings');

// VARIABLE UNTUK TOTAL BOOKING HARI INI
let dailyBookingStats = JSON.parse(localStorage.getItem('dailyBookingStats')) || {};

// Set minimum date to today
const today = new Date().toISOString().split('T')[0];
bookingDateInput.setAttribute('min', today);
filterDate.setAttribute('min', today);

// FUNGSI UNTUK UPDATE STATISTIK HARIAN BADMINTON - DIPERBAIKI DENGAN MEMBER COUNT
function updateDailyStats() {
    const today = new Date().toISOString().split('T')[0];
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const revenueHistory = JSON.parse(localStorage.getItem('revenueHistory')) || [];
    
    // Inisialisasi data hari ini jika belum ada - KHUSUS BADMINTON
    if (!dailyBookingStats[today]) {
        dailyBookingStats[today] = {
            badminton: { totalBookings: 0, bookedFields: 0, dailyRevenue: 0, memberBookings: 0 },
            minisoccer: { totalBookings: 0, bookedFields: 0, dailyRevenue: 0, memberBookings: 0 },
            lastUpdated: new Date().toISOString()
        };
    }
    
    // Pastikan struktur untuk badminton ada
    if (!dailyBookingStats[today].badminton) {
        dailyBookingStats[today].badminton = { totalBookings: 0, bookedFields: 0, dailyRevenue: 0, memberBookings: 0 };
    }
    
    // Hitung booking aktif untuk hari ini - HANYA BADMINTON
    const activeTodayBookings = reservations.filter(r => 
        r.sportType === 'badminton' && r.date === today
    );
    
    // Hitung booking member aktif hari ini
    const activeMemberBookings = activeTodayBookings.filter(r => r.customerType === 'member').length;
    
    // Hitung booking yang sudah selesai (auto cleanup) hari ini - HANYA BADMINTON
    const completedTodayBookings = revenueHistory.filter(r => 
        r.sportType === 'badminton' && r.date === today && r.movedToRevenue
    );
    
    // Hitung booking member yang sudah selesai hari ini
    const completedMemberBookings = completedTodayBookings.filter(r => r.customerType === 'member').length;
    
    // Total booking hari ini = aktif + selesai (auto cleanup)
    const totalTodayBookings = activeTodayBookings.length + completedTodayBookings.length;
    
    // Total booking member hari ini = aktif + selesai
    const totalMemberBookings = activeMemberBookings + completedMemberBookings;
    
    // Hitung pendapatan hari ini - HANYA DARI PELANGGAN UMUM
    const activeRevenue = activeTodayBookings
        .filter(r => r.customerType !== 'member')
        .reduce((sum, r) => sum + (parseInt(r.paidAmount) || 0), 0);
        
    const completedRevenue = completedTodayBookings
        .filter(r => r.customerType !== 'member')
        .reduce((sum, r) => sum + (parseInt(r.paidAmount) || 0), 0);
    
    const totalDailyRevenue = activeRevenue + completedRevenue;
    
    // Update statistik
    dailyBookingStats[today].badminton.totalBookings = totalTodayBookings;
    dailyBookingStats[today].badminton.bookedFields = activeTodayBookings.length;
    dailyBookingStats[today].badminton.dailyRevenue = totalDailyRevenue;
    dailyBookingStats[today].badminton.memberBookings = totalMemberBookings;
    dailyBookingStats[today].lastUpdated = new Date().toISOString();
    
    // Simpan ke localStorage
    localStorage.setItem('dailyBookingStats', JSON.stringify(dailyBookingStats));
    
    console.log('📈 Daily stats updated for Badminton:', {
        totalBookings: dailyBookingStats[today].badminton.totalBookings,
        bookedFields: dailyBookingStats[today].badminton.bookedFields,
        dailyRevenue: dailyBookingStats[today].badminton.dailyRevenue,
        memberBookings: dailyBookingStats[today].badminton.memberBookings
    });
}

// FUNGSI AUTO CLEANUP - Menghapus booking yang sudah lewat dan menambah ke revenue - DIPERBAIKI
function autoCleanupPastBookings() {
    const now = new Date();
    const today = new Date().toISOString().split('T')[0];
    let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    let revenueHistory = JSON.parse(localStorage.getItem('revenueHistory')) || [];
    
    const activeReservations = [];
    let movedToRevenue = 0;
    let memberMovedToRevenue = 0;
    
    reservations.forEach(reservation => {
        if (reservation.sportType === 'badminton') {
            // Gunakan parsing waktu yang benar untuk handle 23:00-00:00
            const timeInfo = parseBookingTime(reservation.date, reservation.time);
            const bookingEnd = timeInfo.end;
            
            // Jika waktu booking sudah lewat
            if (bookingEnd < now) {
                // Cek apakah sudah ada di revenue history
                const existingInRevenue = revenueHistory.find(r => r.id === reservation.id);
                
                if (!existingInRevenue && reservation.paidAmount > 0) {
                    // Hanya pindahkan ke revenue history jika BUKAN member
                    if (reservation.customerType !== 'member') {
                        revenueHistory.push({
                            ...reservation,
                            status: 'completed',
                            completedAt: new Date().toISOString(),
                            movedToRevenue: true
                        });
                        movedToRevenue++;
                        console.log(`💰 Moved completed booking to revenue: ${reservation.customerName} - ${reservation.paidAmount}`);
                    } else {
                        // Untuk member, hanya catat tapi jangan pindahkan ke revenue
                        memberMovedToRevenue++;
                        console.log(`💎 Member booking completed (not moved to revenue): ${reservation.customerName}`);
                    }
                }
                // Tidak dimasukkan ke activeReservations (artinya dihapus)
            } else {
                // Masih aktif, pertahankan
                activeReservations.push(reservation);
            }
        } else {
            // Bukan badminton, pertahankan
            activeReservations.push(reservation);
        }
    });
    
    // Simpan perubahan
    if (activeReservations.length !== reservations.length) {
        localStorage.setItem('reservations', JSON.stringify(activeReservations));
        localStorage.setItem('revenueHistory', JSON.stringify(revenueHistory));
        console.log(`🧹 Auto cleanup: Removed ${reservations.length - activeReservations.length} past bookings, moved ${movedToRevenue} to revenue, ${memberMovedToRevenue} member bookings completed`);
        
        // UPDATE STATISTIK SETELAH CLEANUP
        updateDailyStats();
        updateDashboardStats();
        
        // NOTIFY DATA CHANGE SETELAH CLEANUP
        notifyDataChange();
    }
    
    return movedToRevenue;
}

// Update dashboard statistics khusus BADMINTON - DIPERBAIKI DENGAN MEMBER COUNT
function updateDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    
    // Update daily stats terlebih dahulu
    updateDailyStats();
    
    // Today's bookings - ambil dari daily stats BADMINTON saja
    const todayStats = dailyBookingStats[today] || { 
        badminton: { totalBookings: 0, bookedFields: 0, dailyRevenue: 0, memberBookings: 0 } 
    };
    
    const badmintonStats = todayStats.badminton || { totalBookings: 0, bookedFields: 0, dailyRevenue: 0, memberBookings: 0 };
    
    // Update UI langsung
    todayBookingsEl.textContent = badmintonStats.totalBookings;
    bookedFieldsEl.textContent = badmintonStats.bookedFields;
    dailyRevenueEl.textContent = `Rp ${badmintonStats.dailyRevenue.toLocaleString()}`;
    
    // PERBAIKAN: Update kolom Booking Member Hari Ini
    if (memberBookingsEl) {
        memberBookingsEl.textContent = badmintonStats.memberBookings;
    }
    
    console.log('📊 Dashboard Stats Updated for Badminton:', {
        todayBookings: badmintonStats.totalBookings,
        bookedFields: badmintonStats.bookedFields,
        dailyRevenue: badmintonStats.dailyRevenue,
        memberBookings: badmintonStats.memberBookings
    });
}

// ==================== FUNGSI BARU: NOTIFIKASI ====================
function showNotification(message, type = 'success') {
    // Hapus notifikasi sebelumnya
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Buat notifikasi baru
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Hapus otomatis setelah 5 detik
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Handle booking form submission - DIPERBAIKI UNTUK MEMBER 4 MINGGU BERTURUT-TURUT
function handleBooking(e) {
    e.preventDefault();
    
    const customerType = customerTypeSelect.value;
    const fieldNumber = fieldNumberSelect.value;
    const bookingDate = bookingDateInput.value;
    const bookingTime = bookingTimeSelect.value;
    const customerName = document.getElementById('customer-name').value;
    const customerPhone = document.getElementById('customer-phone').value;
    const customerEmail = document.getElementById('customer-email').value;
    const bookingNotes = document.getElementById('booking-notes').value;
    const paymentStatus = document.getElementById('payment-status').value;
    const totalAmount = parseInt(totalAmountInput.value);
    const paidAmount = parseInt(paidAmountInput.value);
    const now = new Date();
    
    // Validasi jumlah pembayaran
    if (paidAmount < 0) {
        showNotification('❌ Jumlah pembayaran tidak boleh negatif!', 'error');
        return;
    }
    
    if (paidAmount > totalAmount) {
        showNotification('❌ Jumlah pembayaran tidak boleh lebih dari total biaya!', 'error');
        return;
    }
    
    // Validasi waktu dengan handling khusus untuk 23:00-00:00
    const timeInfo = parseBookingTime(bookingDate, bookingTime);
    const bookingStart = timeInfo.start;
    
    if (bookingStart < now) {
        showNotification('❌ Tidak bisa booking di waktu yang sudah lewat! Silakan pilih waktu yang akan datang.', 'error');
        return;
    }
    
    // Validasi lapangan sudah dipesan dengan handling waktu yang benar
    const isAvailable = checkFieldAvailability(fieldNumber, bookingDate, bookingTime);
    
    if (!isAvailable) {
        showNotification('❌ Lapangan sudah dipesan pada waktu tersebut! Silakan pilih waktu lain.', 'error');
        return;
    }
    
    // ==================== LOGIKA BARU: BOOKING 4 MINGGU BERTURUT-TURUT UNTUK MEMBER ====================
    let reservationsToCreate = [];
    
    if (customerType === 'member') {
        // Cek ketersediaan 3 jam di hari yang sama
        const sessionAvailability = checkMemberSessionAvailability(fieldNumber, bookingDate, bookingTime);
        
        if (!sessionAvailability.available) {
            showNotification(`❌ Tidak bisa booking member: ${sessionAvailability.reason}`, 'error');
            return;
        }
        
        // Cek ketersediaan untuk 4 minggu berturut-turut
        const monthlyAvailability = checkMemberMonthlyAvailability(fieldNumber, bookingDate, bookingTime);
        
        if (!monthlyAvailability.available) {
            showNotification(`❌ Tidak bisa booking member: ${monthlyAvailability.reason}`, 'error');
            return;
        }
        
        // Buat booking untuk 4 minggu berturut-turut
        for (let week = 0; week < 4; week++) {
            const currentWeekDate = new Date(bookingDate);
            currentWeekDate.setDate(currentWeekDate.getDate() + (week * 7));
            const currentWeekDateStr = currentWeekDate.toISOString().split('T')[0];
            
            // Buat 3 booking untuk 3 jam di setiap minggu
            sessionAvailability.slots.forEach((slot, hourIndex) => {
                const reservation = {
                    id: Date.now() + (week * 10) + hourIndex, // ID unik untuk setiap booking
                    sportType: 'badminton',
                    customerType: customerType,
                    fieldNumber: fieldNumber,
                    date: currentWeekDateStr,
                    time: slot,
                    customerName: customerName,
                    customerPhone: customerPhone,
                    customerEmail: customerEmail,
                    notes: `${bookingNotes} | Minggu ${week + 1}/4 - Jam ${hourIndex + 1}/3 Member`,
                    paymentStatus: paymentStatus,
                    totalAmount: totalAmount, // Total untuk paket 4 minggu
                    paidAmount: paidAmount,
                    remainingAmount: totalAmount - paidAmount,
                    timestamp: new Date().toISOString(),
                    adminCreated: true,
                    memberSession: `M${week + 1}-J${hourIndex + 1}` // Tandai sebagai sesi member
                };
                reservationsToCreate.push(reservation);
            });
        }
        
        const startDate = new Date(bookingDate);
        const endDate = new Date(bookingDate);
        endDate.setDate(endDate.getDate() + 21); // 3 minggu setelah tanggal mulai
        
        showNotification(`✅ Booking member 4 minggu berhasil! Setiap ${startDate.toLocaleDateString('id-ID', {weekday: 'long'})} pukul ${bookingTime} selama 4 minggu`, 'success');
    } else {
        // Booking biasa untuk umum
        const reservation = {
            id: Date.now(),
            sportType: 'badminton',
            customerType: customerType,
            fieldNumber: fieldNumber,
            date: bookingDate,
            time: bookingTime,
            customerName: customerName,
            customerPhone: customerPhone,
            customerEmail: customerEmail,
            notes: bookingNotes,
            paymentStatus: paymentStatus,
            totalAmount: totalAmount,
            paidAmount: paidAmount,
            remainingAmount: totalAmount - paidAmount,
            timestamp: new Date().toISOString(),
            adminCreated: true
        };
        reservationsToCreate.push(reservation);
        
        showNotification('✅ Booking badminton berhasil disimpan!', 'success');
    }
    
    // Add to reservations array
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    reservations.push(...reservationsToCreate);
    
    // Save to localStorage
    localStorage.setItem('reservations', JSON.stringify(reservations));
    
    // Update stats langsung
    updateDailyStats();
    
    // NOTIFY DATA CHANGE
    notifyDataChange();
    
    // Reset form
    bookingForm.reset();
    updateTimeSlots();
    
    // Update dashboard and management list
    updateDashboardStats();
    displayManagementList();
}

// FUNGSI REAL-TIME NOTIFICATION - BARU DITAMBAHKAN
function notifyDataChange() {
    // Update timestamp untuk sync dengan halaman pelanggan
    localStorage.setItem('lastDataUpdate', new Date().toISOString());
    
    // Dispatch custom event untuk real-time update dalam tab yang sama
    const event = new CustomEvent('reservationDataChanged', {
        detail: { 
            timestamp: new Date().toISOString(),
            source: 'admin'
        }
    });
    window.dispatchEvent(event);
    
    console.log('📢 Notifying data change to other pages');
}

// FUNGSI UNTUK MEMBERSIHKAN STATS LAMA (lebih dari 1 hari)
function cleanupOldStats() {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // Hapus stats yang lebih dari 2 hari
    Object.keys(dailyBookingStats).forEach(date => {
        if (date < yesterdayStr) {
            delete dailyBookingStats[date];
        }
    });
    
    localStorage.setItem('dailyBookingStats', JSON.stringify(dailyBookingStats));
}

// Fungsi untuk mendapatkan harga berdasarkan waktu, hari, dan tipe pelanggan untuk BADMINTON - DIPERBAIKI
function getDynamicPrice(timeSlot, bookingDate, customerType = 'umum') {
    const basePrice = facilities.badminton.timePrices[timeSlot] || facilities.badminton.fields[0].basePrice;
    
    const date = new Date(bookingDate);
    const dayOfWeek = date.getDay();
    const [startTime] = timeSlot.split(' - ');
    const hour = parseInt(startTime.split(':')[0]);
    
    let price = basePrice;
    
    // Harga untuk umum
    if (customerType === 'umum') {
        // Senin-Jumat 07:00-17:00: Rp 45.000
        if (dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 7 && hour < 17) {
            price = 45000;
        } else {
            price = 50000;
        }
    } 
    // Harga untuk member - PAKET BULANAN
    else if (customerType === 'member') {
        // Untuk member, harga per jam tidak berlaku, tapi tetap tampilkan harga normal
        if (dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 7 && hour < 17) {
            price = 45000;
        } else {
            price = 50000;
        }
    }
    
    return price;
}

// Fungsi untuk menghitung total biaya berdasarkan tipe pelanggan - DIPERBAIKI SESUAI REVISI
function calculateTotalAmount(customerType, bookingTime = null, bookingDate = null) {
    if (customerType === 'member') {
        // Member: hitung berdasarkan waktu dan hari sesuai revisi
        if (bookingTime && bookingDate) {
            return calculateMemberPrice(bookingDate, bookingTime);
        } else {
            // Default harga member
            return facilities.badminton.memberPackage.weekdayMorning; // Rp 400.000
        }
    } else {
        // Umum: harga normal per jam
        if (bookingTime && bookingDate) {
            return getDynamicPrice(bookingTime, bookingDate, 'umum');
        } else {
            return getDynamicPrice("07:00 - 08:00", new Date().toISOString().split('T')[0], 'umum');
        }
    }
}

// Update remaining amount
function updateRemainingAmount() {
    const totalAmount = parseInt(totalAmountInput.value) || 0;
    const paidAmount = parseInt(paidAmountInput.value) || 0;
    const remainingAmount = totalAmount - paidAmount;
    
    remainingAmountInput.value = remainingAmount > 0 ? remainingAmount : 0;
    
    // Auto update payment status based on amounts
    const paymentStatusSelect = document.getElementById('payment-status');
    if (paidAmount === 0) {
        paymentStatusSelect.value = 'pending';
    } else if (paidAmount > 0 && paidAmount < totalAmount) {
        paymentStatusSelect.value = 'partial';
    } else if (paidAmount >= totalAmount) {
        paymentStatusSelect.value = 'paid';
    }
}

// Update remaining amount for edit form
function updateEditRemainingAmount() {
    const totalAmount = parseInt(document.getElementById('edit-total-amount').value) || 0;
    const paidAmount = parseInt(document.getElementById('edit-paid-amount').value) || 0;
    const remainingAmount = totalAmount - paidAmount;
    
    document.getElementById('edit-remaining-amount').value = remainingAmount > 0 ? remainingAmount : 0;
    
    // Auto update payment status based on amounts
    const paymentStatusSelect = document.getElementById('edit-payment-status');
    if (paidAmount === 0) {
        paymentStatusSelect.value = 'pending';
    } else if (paidAmount > 0 && paidAmount < totalAmount) {
        paymentStatusSelect.value = 'partial';
    } else if (paidAmount >= totalAmount) {
        paymentStatusSelect.value = 'paid';
    }
}

// ==================== FUNGSI UNTUK SCHEDULE VIEW DENGAN FORMAT BARU ====================

// Fungsi untuk menampilkan/menyembunyikan section
function showScheduleSection() {
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('schedule').style.display = 'block';
    document.getElementById('booking').style.display = 'none';
    document.getElementById('manage').style.display = 'none';
    generateScheduleTable();
    updateAdminQuickStats();
}

function showBookingSection() {
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('schedule').style.display = 'none';
    document.getElementById('booking').style.display = 'block';
    document.getElementById('manage').style.display = 'none';
    
    // Reset dan update form booking
    bookingForm.reset();
    updateTimeSlots();
}

function showDashboardSection() {
    document.getElementById('dashboard').style.display = 'block';
    document.getElementById('schedule').style.display = 'none';
    document.getElementById('booking').style.display = 'none';
    document.getElementById('manage').style.display = 'block';
}

// ==================== FUNGSI STATUS BOOKING YANG DIPERBAIKI ====================
function getBookingStatus(bookingDate, bookingTime, hasBooking = false) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Parse waktu booking dengan handling khusus untuk 00:00
    const timeInfo = parseBookingTime(bookingDate, bookingTime);
    const bookingStart = timeInfo.start;
    const bookingEnd = timeInfo.end;
    
    if (bookingDate < today) {
        // Waktu lewat - bedakan antara yang ada booking dan tidak
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
            // Waktu lewat di hari yang sama - bedakan antara yang ada booking dan tidak
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

// Fungsi untuk generate tabel jadwal dengan FORMAT BARU (seperti halaman pelanggan)
function generateScheduleTable() {
    try {
        const startDate = document.getElementById('schedule-start-date').value;
        const endDate = document.getElementById('schedule-end-date').value;
        const fieldFilter = document.getElementById('schedule-field').value;
        
        // Get fresh data from localStorage
        let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
        const revenueHistory = JSON.parse(localStorage.getItem('revenueHistory')) || [];
        
        console.log(`📊 Generating schedule table for ${reservations.length} reservations`);
        
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
        if (!startDate) document.getElementById('schedule-start-date').value = defaultStartDate;
        if (!endDate) document.getElementById('schedule-end-date').value = defaultEndDate;
        
        const dateRange = getDateRange(defaultStartDate, defaultEndDate);
        const timeSlots = badmintonFacilities.badminton.timeSlots;
        const fields = badmintonFacilities.badminton.fields;
        
        // Render tabel dengan layout baru (seperti halaman pelanggan)
        renderScheduleTableNewLayout(dateRange, timeSlots, fields, filteredReservations, revenueHistory, fieldFilter);
        
    } catch (error) {
        console.error('Error generating schedule table:', error);
        const container = document.getElementById('schedule-table-container');
        container.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Error memuat data jadwal. Silakan refresh halaman.</p>
            </div>
        `;
    }
}

// Fungsi untuk render tabel jadwal dengan LAYOUT BARU - Setiap lapangan terpisah dengan scroll horizontal
function renderScheduleTableNewLayout(dateRange, timeSlots, fields, filteredReservations, revenueHistory, fieldFilter) {
    const container = document.getElementById('schedule-table-container');
    
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
                    <table class="excel-table field-table">
                        <thead>
                            <tr>
                                <th class="time-column">Waktu / Tanggal</th>
        `;
        
        // Header tanggal
        dateRange.forEach(date => {
            html += `<th>${formatScheduleDate(date)}</th>`;
        });
        
        html += `</tr></thead><tbody>`;
        
        // Data untuk setiap time slot
        timeSlots.forEach(timeSlot => {
            html += `<tr>`;
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
                    html += `<td class="${status.cellClass}">`;
                    html += `<span class="status-badge ${status.class}">${status.text}</span>`;
                    
                    if (currentBooking.customerName) {
                        html += `<br><small>${currentBooking.customerName}</small>`;
                        const customerType = currentBooking.customerType || 'umum';
                        const customerTypeClass = customerType === 'member' ? 'customer-member' : 'customer-umum';
                        const customerTypeText = customerType === 'member' ? 'Member' : 'Umum';
                        html += `<br><span class="customer-type-badge ${customerTypeClass}">${customerTypeText}</span>`;
                        
                        // Tampilkan info sesi member jika ada
                        if (currentBooking.memberSession) {
                            html += `<br><small style="color: #1e40af; font-weight: 500;">${currentBooking.memberSession}</small>`;
                        }
                    }
                    
                    html += `</td>`;
                } else {
                    const status = getBookingStatus(date, timeSlot, false);
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

// Fungsi untuk setup scroll horizontal
function setupHorizontalScroll() {
    const tableWrappers = document.querySelectorAll('.field-table-wrapper');
    
    tableWrappers.forEach(wrapper => {
        // Check if table is wider than container
        const table = wrapper.querySelector('.field-table');
        if (table.scrollWidth > wrapper.clientWidth) {
            wrapper.style.overflowX = 'auto';
        }
    });
}

// Helper functions untuk schedule
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

function formatScheduleDate(dateString) {
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', options);
}

// Fungsi untuk update quick stats di halaman admin
function updateAdminQuickStats() {
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
        document.getElementById('admin-booked-fields').textContent = activeTodayBookings;
        document.getElementById('admin-total-bookings').textContent = totalActiveBookings;
        document.getElementById('admin-completed-today').textContent = completedToday;
        
        // Update last update time
        const lastUpdateElement = document.getElementById('admin-last-update');
        if (lastUpdateElement) {
            const lastUpdate = localStorage.getItem('lastDataUpdate');
            if (lastUpdate) {
                const date = new Date(lastUpdate);
                lastUpdateElement.textContent = date.toLocaleTimeString('id-ID');
            } else {
                lastUpdateElement.textContent = '-';
            }
        }
        
        console.log('📊 Admin Quick Stats Updated:', {
            activeTodayBookings,
            totalActiveBookings,
            completedToday
        });
        
    } catch (error) {
        console.error('Error updating admin quick stats:', error);
    }
}

// ==================== EVENT LISTENERS ====================

document.addEventListener('DOMContentLoaded', function() {
    // Cek autentikasi sebelum mengizinkan akses
    if (!checkAdminAuth()) {
        return;
    }
    
    // Load daily stats
    dailyBookingStats = JSON.parse(localStorage.getItem('dailyBookingStats')) || {};
    
    // Jalankan auto cleanup saat halaman dimuat
    autoCleanupPastBookings();
    
    // Update daily stats
    updateDailyStats();
    cleanupOldStats();
    
    // Initialize the page
    updateTimeSlots();
    updateDashboardStats();
    displayManagementList();
    
    // Event listeners for form changes
    fieldNumberSelect.addEventListener('change', function() {
        updateDefaultAmount();
        updateTimeSlots();
    });
    
    bookingDateInput.addEventListener('change', function() {
        // Validasi tanggal tidak boleh di masa lalu
        const selectedDate = new Date(this.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showNotification('❌ Tidak bisa memilih tanggal yang sudah lewat!', 'error');
            this.value = today.toISOString().split('T')[0];
        }
        
        updateTimeSlots();
        updateDefaultAmount();
    });
    
    // Event listener untuk customer type (update harga otomatis)
    customerTypeSelect.addEventListener('change', function() {
        updateDefaultAmount();
        updateTimeSlots(); // Perbarui waktu yang tersedia
    });
    
    // Event listener untuk paid amount
    paidAmountInput.addEventListener('input', updateRemainingAmount);
    document.getElementById('edit-paid-amount').addEventListener('input', updateEditRemainingAmount);
    document.getElementById('edit-total-amount').addEventListener('input', updateEditRemainingAmount);
    
    // Event listener untuk payment status (manual change)
    document.getElementById('payment-status').addEventListener('change', function() {
        const totalAmount = parseInt(totalAmountInput.value) || 0;
        
        if (this.value === 'paid') {
            paidAmountInput.value = totalAmount;
        } else if (this.value === 'pending') {
            paidAmountInput.value = 0;
        }
        updateRemainingAmount();
    });
    
    document.getElementById('edit-payment-status').addEventListener('change', function() {
        const totalAmount = parseInt(document.getElementById('edit-total-amount').value) || 0;
        const paidAmountInput = document.getElementById('edit-paid-amount');
        
        if (this.value === 'paid') {
            paidAmountInput.value = totalAmount;
        } else if (this.value === 'pending') {
            paidAmountInput.value = 0;
        }
        updateEditRemainingAmount();
    });
    
    // Event listener untuk waktu booking (update harga otomatis)
    bookingTimeSelect.addEventListener('change', function() {
        updateDefaultAmount();
    });
    
    // Form submission
    bookingForm.addEventListener('submit', handleBooking);
    
    // Management controls
    searchBtn.addEventListener('click', displayManagementList);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') displayManagementList();
    });
    
    filterPayment.addEventListener('change', displayManagementList);
    filterCustomerType.addEventListener('change', displayManagementList);
    filterField.addEventListener('change', displayManagementList);
    filterDate.addEventListener('change', displayManagementList);
    resetManagement.addEventListener('click', resetManagementFilters);
    
    // Edit modal
    editForm.addEventListener('submit', handleEdit);
    closeModal.addEventListener('click', function() {
        editModal.style.display = 'none';
    });
    
    // Event listener untuk tombol simpan bawah
    document.getElementById('edit-save-bottom-btn').addEventListener('click', function() {
        handleEdit(new Event('submit'));
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === editModal) {
            editModal.style.display = 'none';
        }
    });
    
    // Mobile menu toggle
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Schedule controls
    document.getElementById('schedule-start-date').addEventListener('change', generateScheduleTable);
    document.getElementById('schedule-end-date').addEventListener('change', generateScheduleTable);
    document.getElementById('schedule-field').addEventListener('change', generateScheduleTable);
    document.getElementById('schedule-refresh').addEventListener('click', generateScheduleTable);
    document.getElementById('schedule-reset-filter').addEventListener('click', resetScheduleFilters);
    
    // Set default dates untuk schedule
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(new Date().setDate(new Date().getDate() + 6)).toISOString().split('T')[0];
    
    document.getElementById('schedule-start-date').value = today;
    document.getElementById('schedule-start-date').setAttribute('min', today);
    document.getElementById('schedule-end-date').value = nextWeek;
    document.getElementById('schedule-end-date').setAttribute('min', today);
    
    // Setup navbar admin
    setupAdminNavbar();
    setupSessionTimeout();
    
    // Setup auto cleanup setiap 1 menit
    setInterval(() => {
        console.log('🔄 Auto cleanup running...');
        const movedCount = autoCleanupPastBookings();
        if (movedCount > 0) {
            console.log(`💰 ${movedCount} bookings moved to revenue`);
        }
        // Selalu update stats untuk memastikan keakuratan
        updateDailyStats();
        updateDashboardStats();
        displayManagementList();
    }, 60 * 1000);
});

// Fungsi untuk reset filter schedule
function resetScheduleFilters() {
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(new Date().setDate(new Date().getDate() + 6)).toISOString().split('T')[0];
    
    document.getElementById('schedule-start-date').value = today;
    document.getElementById('schedule-end-date').value = nextWeek;
    document.getElementById('schedule-field').value = 'all';
    
    generateScheduleTable();
    updateAdminQuickStats();
}

// Tambahkan fungsi logout di navbar admin
function setupAdminNavbar() {
    const adminUsername = sessionStorage.getItem('adminUsername');
    const adminType = sessionStorage.getItem('adminType');
    
    // Update logo untuk menampilkan jenis admin
    const logo = document.querySelector('.logo');
    if (logo) {
        if (adminUsername) {
            logo.innerHTML = `Sport Arena - Admin Badminton<br><small>${adminUsername}</small>`;
        } else {
            logo.textContent = 'Sport Arena - Admin Badminton';
        }
    }
    
    // Ganti link "Kembali ke Pelanggan" dengan logout
    const customerLink = document.querySelector('.customer-link');
    if (customerLink) {
        customerLink.textContent = 'Logout';
        customerLink.href = '#';
        customerLink.onclick = function(e) {
            e.preventDefault();
            logout();
        };
    }
}

// Fungsi logout
function logout() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        sessionStorage.removeItem('adminLoggedIn');
        sessionStorage.removeItem('loginTime');
        sessionStorage.removeItem('adminType');
        sessionStorage.removeItem('adminUsername');
        window.location.href = 'Login.html';
    }
}

// Auto logout setelah 8 jam (session timeout)
function setupSessionTimeout() {
    setInterval(function() {
        const loginTime = sessionStorage.getItem('loginTime');
        if (loginTime && (new Date().getTime() - parseInt(loginTime)) > 8 * 60 * 60 * 1000) {
            alert('Session telah expired. Silakan login kembali.');
            logout();
        }
    }, 60 * 1000);
}

// Update default amount based on selected field, waktu, tanggal, dan tipe pelanggan - DIPERBAIKI
function updateDefaultAmount() {
    const fieldId = fieldNumberSelect.value;
    const bookingTime = bookingTimeSelect.value;
    const customerType = customerTypeSelect.value;
    const bookingDate = bookingDateInput.value || new Date().toISOString().split('T')[0];
    
    if (fieldId) {
        // Gunakan fungsi calculateTotalAmount untuk harga yang sesuai
        const price = calculateTotalAmount(customerType, bookingTime, bookingDate);
        
        totalAmountInput.value = price;
        updateRemainingAmount();
        
        // Tampilkan info khusus untuk member
        if (customerType === 'member') {
            // Tambahkan info tentang paket member
            const memberInfo = document.getElementById('member-info') || createMemberInfo();
            memberInfo.style.display = 'block';
            
            // Update info harga member berdasarkan waktu yang dipilih
            updateMemberInfo(bookingDate, bookingTime);
        } else {
            // Sembunyikan info member jika tidak dipilih
            const memberInfo = document.getElementById('member-info');
            if (memberInfo) {
                memberInfo.style.display = 'none';
            }
        }
    }
}

// ==================== FUNGSI BARU: UPDATE INFO MEMBER BERDASARKAN WAKTU ====================
function updateMemberInfo(bookingDate, bookingTime) {
    const memberInfo = document.getElementById('member-info');
    if (!memberInfo) return;
    
    const price = calculateMemberPrice(bookingDate, bookingTime);
    const date = new Date(bookingDate);
    const dayOfWeek = date.getDay();
    const dayName = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][dayOfWeek];
    
    let priceInfo = '';
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        priceInfo = `💰 Weekend (Sabtu/Ahad): Rp ${price.toLocaleString()}`;
    } else {
        if (bookingTime) {
            const [startTime] = bookingTime.split(' - ');
            const hour = parseInt(startTime.split(':')[0]);
            if (hour >= 7 && hour < 16) {
                priceInfo = `💰 Weekday Pagi (07:00-16:00): Rp ${price.toLocaleString()}`;
            } else {
                priceInfo = `💰 Weekday Sore/Malam (16:00-00:00): Rp ${price.toLocaleString()}`;
            }
        } else {
            priceInfo = `💰 Paket Member: Rp ${price.toLocaleString()}`;
        }
    }
    
    memberInfo.innerHTML = `
        <strong>💎 Paket Member Badminton</strong><br>
        • ${priceInfo}<br>
        • 4x sesi per bulan (1 sesi per minggu)<br>
        • 3 jam per sesi<br>
        • Total 12 jam per bulan<br>
        <small style="color: #ef4444; font-weight: 500;">⚠️ Akan booking otomatis untuk 4 minggu berturut-turut!</small>
    `;
}

// Fungsi untuk membuat info member
function createMemberInfo() {
    const memberInfo = document.createElement('div');
    memberInfo.id = 'member-info';
    memberInfo.style.cssText = `
        background: #dbeafe;
        border: 1px solid #93c5fd;
        border-radius: 8px;
        padding: 15px;
        margin: 10px 0;
        font-size: 14px;
    `;
    memberInfo.innerHTML = `
        <strong>💎 Paket Member Badminton</strong><br>
        • Pilih waktu untuk melihat harga<br>
        • 4x sesi per bulan (1 sesi per minggu)<br>
        • 3 jam per sesi<br>
        • Total 12 jam per bulan<br>
        <small style="color: #ef4444; font-weight: 500;">⚠️ Akan booking otomatis untuk 4 minggu berturut-turut!</small>
    `;
    
    // Sisipkan setelah total amount input
    const totalAmountGroup = totalAmountInput.closest('.form-group');
    totalAmountGroup.parentNode.insertBefore(memberInfo, totalAmountGroup.nextSibling);
    
    return memberInfo;
}

// Update available time slots based on selected date - DIPERBAIKI UNTUK MEMBER
function updateTimeSlots() {
    const bookingDate = bookingDateInput.value;
    const fieldId = fieldNumberSelect.value;
    const customerType = customerTypeSelect.value;
    bookingTimeSelect.innerHTML = '<option value="">Pilih Waktu</option>';
    
    if (bookingDate && fieldId) {
        const now = new Date();
        const selectedDate = new Date(bookingDate);
        const today = new Date().toISOString().split('T')[0];
        const isToday = bookingDate === today;
        
        // Filter out already booked time slots
        const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
        const bookedSlots = reservations.filter(reservation => 
            reservation.sportType === 'badminton' && 
            reservation.date === bookingDate &&
            reservation.fieldNumber == fieldId
        ).map(reservation => reservation.time);
        
        let availableSlots = 0;
        let availableMemberSlots = 0;
        
        facilities.badminton.timeSlots.forEach(slot => {
            const [startTime] = slot.split(' - ');
            const timeInfo = parseBookingTime(bookingDate, slot);
            const slotDateTime = timeInfo.start;
            
            // Validasi waktu
            const isPastTime = isToday && slotDateTime < now;
            const isBooked = bookedSlots.includes(slot);
            
            if (!isPastTime && !isBooked) {
                const option = document.createElement('option');
                option.value = slot;
                
                // Untuk member, cek apakah bisa booking 4 minggu
                if (customerType === 'member') {
                    const sessionAvailability = checkMemberSessionAvailability(fieldId, bookingDate, slot);
                    const monthlyAvailability = checkMemberMonthlyAvailability(fieldId, bookingDate, slot);
                    const canBookMember = sessionAvailability.available && monthlyAvailability.available;
                    
                    if (canBookMember) {
                        const price = calculateMemberPrice(bookingDate, slot);
                        option.textContent = `${slot} - Paket Member: Rp ${price.toLocaleString()} (4 minggu)`;
                        option.style.color = '#059669';
                        option.style.fontWeight = '600';
                        availableMemberSlots++;
                    } else {
                        let reason = '';
                        if (!sessionAvailability.available) {
                            reason = sessionAvailability.reason;
                        } else {
                            reason = monthlyAvailability.reason;
                        }
                        option.textContent = `${slot} - ❌ ${reason}`;
                        option.disabled = true;
                        option.style.color = '#ef4444';
                    }
                } else {
                    // Umum: tampilkan harga normal
                    const price = getDynamicPrice(slot, bookingDate, 'umum');
                    option.textContent = `${slot} - Rp ${price.toLocaleString()}`;
                    availableSlots++;
                }
                
                // Tampilkan info tambahan untuk waktu dekat
                if (isToday && !option.disabled) {
                    const timeUntilBooking = slotDateTime - now;
                    const hoursUntil = Math.floor(timeUntilBooking / (1000 * 60 * 60));
                    
                    if (hoursUntil < 2) {
                        option.textContent += ' ⚠️ Segera';
                    }
                }
                
                bookingTimeSelect.appendChild(option);
            }
        });
        
        // Tampilkan info tentang slot yang tidak tersedia
        if (customerType === 'member') {
            if (availableMemberSlots === 0) {
                const option = document.createElement('option');
                option.value = "";
                option.textContent = "❌ Tidak ada waktu yang bisa digunakan untuk paket member 4 minggu";
                option.disabled = true;
                bookingTimeSelect.appendChild(option);
            } else {
                const infoOption = document.createElement('option');
                infoOption.value = "";
                infoOption.textContent = `✅ ${availableMemberSlots} waktu tersedia untuk paket member 4 minggu`;
                infoOption.disabled = true;
                infoOption.style.fontStyle = 'italic';
                infoOption.style.color = '#059669';
                bookingTimeSelect.appendChild(infoOption);
            }
        } else {
            if (availableSlots === 0) {
                const option = document.createElement('option');
                option.value = "";
                
                if (isToday) {
                    option.textContent = "❌ Semua waktu hari ini sudah lewat atau terbooking";
                } else {
                    option.textContent = "❌ Tidak ada waktu tersedia untuk tanggal ini";
                }
                
                option.disabled = true;
                bookingTimeSelect.appendChild(option);
            } else {
                const infoOption = document.createElement('option');
                infoOption.value = "";
                infoOption.textContent = `✅ ${availableSlots} waktu tersedia - Pilih waktu di atas`;
                infoOption.disabled = true;
                infoOption.style.fontStyle = 'italic';
                infoOption.style.color = '#27ae60';
                bookingTimeSelect.appendChild(infoOption);
            }
        }
        
        // Auto update harga jika waktu sudah dipilih
        if (bookingTimeSelect.value) {
            updateDefaultAmount();
        }
    }
}

// Display management list with filters - HANYA BADMINTON
function displayManagementList() {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    
    const searchTerm = searchInput.value.toLowerCase();
    const paymentFilter = filterPayment.value;
    const customerTypeFilter = filterCustomerType.value;
    const fieldFilter = filterField.value;
    const dateFilter = filterDate.value;
    
    // Filter hanya reservations badminton
    let filteredReservations = reservations.filter(reservation => reservation.sportType === 'badminton');
    
    // Search filter
    if (searchTerm) {
        filteredReservations = filteredReservations.filter(r =>
            r.customerName.toLowerCase().includes(searchTerm) ||
            r.customerPhone.includes(searchTerm)
        );
    }
    
    // Payment status filter
    if (paymentFilter !== 'all') {
        filteredReservations = filteredReservations.filter(r => r.paymentStatus === paymentFilter);
    }
    
    // Customer type filter
    if (customerTypeFilter !== 'all') {
        filteredReservations = filteredReservations.filter(r => r.customerType === customerTypeFilter);
    }
    
    // Field filter
    if (fieldFilter !== 'all') {
        filteredReservations = filteredReservations.filter(r => r.fieldNumber == fieldFilter);
    }
    
    // Date filter
    if (dateFilter) {
        filteredReservations = filteredReservations.filter(r => r.date === dateFilter);
    }
    
    // Sort by date and time (soonest first)
    filteredReservations.sort((a, b) => {
        const dateA = parseBookingTime(a.date, a.time).start;
        const dateB = parseBookingTime(b.date, b.time).start;
        return dateA - dateB;
    });
    
    // Display reservations
    if (filteredReservations.length === 0) {
        managementList.innerHTML = '<p class="no-reservations">Tidak ada booking badminton yang ditemukan.</p>';
        return;
    }
    
    managementList.innerHTML = filteredReservations.map(reservation => {
        const sportName = facilities.badminton.name;
        const fieldName = facilities.badminton.fields.find(
            field => field.id == reservation.fieldNumber
        ).name;
        
        // Tampilkan status waktu booking
        const bookingStatus = getBookingTimeStatus(reservation.date, reservation.time);
        
        // Info sesi member
        const memberSessionInfo = reservation.memberSession ? 
            `<span class="customer-type-badge customer-member" style="margin-left: 8px;">${reservation.memberSession}</span>` : '';
        
        return `
            <div class="management-card badminton">
                <div class="management-header">
                    <h3>${sportName} - ${fieldName}</h3>
                    <div class="management-actions">
                        <span class="time-status ${bookingStatus.status}">${bookingStatus.text}</span>
                        <span class="customer-type-badge ${reservation.customerType === 'member' ? 'customer-member' : 'customer-umum'}">
                            ${reservation.customerType === 'member' ? 'Member' : 'Umum'}
                        </span>
                        ${memberSessionInfo}
                        <button class="action-btn edit-btn" onclick="openEditModal(${reservation.id})">Edit</button>
                        <button class="action-btn delete-btn" onclick="deleteBooking(${reservation.id})">Hapus</button>
                    </div>
                </div>
                <div class="management-details">
                    <p><strong>Tanggal:</strong> ${formatDate(reservation.date)}</p>
                    <p><strong>Waktu:</strong> ${reservation.time}</p>
                    <p><strong>Nama:</strong> ${reservation.customerName}</p>
                    <p><strong>Telepon:</strong> ${reservation.customerPhone}</p>
                    <p><strong>Status:</strong> <span class="payment-status status-${reservation.paymentStatus}">${getPaymentStatusText(reservation.paymentStatus)}</span></p>
                    
                    <div class="payment-info">
                        <div class="payment-item">
                            <span class="payment-label">Total Biaya</span>
                            <span class="payment-value">Rp ${(reservation.totalAmount || reservation.amount || 0).toLocaleString()}</span>
                        </div>
                        <div class="payment-item">
                            <span class="payment-label">Dibayar</span>
                            <span class="payment-value">Rp ${(reservation.paidAmount || 0).toLocaleString()}</span>
                        </div>
                        <div class="payment-item">
                            <span class="payment-label">Sisa</span>
                            <span class="payment-value">Rp ${(reservation.remainingAmount || 0).toLocaleString()}</span>
                        </div>
                    </div>
                    
                    ${reservation.notes ? `<p><strong>Catatan:</strong> ${reservation.notes}</p>` : ''}
                    ${reservation.customerEmail ? `<p><strong>Email:</strong> ${reservation.customerEmail}</p>` : ''}
                    
                    ${reservation.customerType === 'member' ? `
                        <div style="background: #dbeafe; padding: 8px; border-radius: 5px; margin-top: 10px; font-size: 0.9rem;">
                            <strong>💎 Paket Member:</strong> 4x sesi per bulan, 3 jam per sesi (total 12 jam)
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Reset management filters
function resetManagementFilters() {
    searchInput.value = '';
    filterPayment.value = 'all';
    filterCustomerType.value = 'all';
    filterField.value = 'all';
    filterDate.value = '';
    displayManagementList();
}

// Open edit modal - DIPERBAIKI DENGAN TOMBOL SIMPAN BAWAH
function openEditModal(bookingId) {
    const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const reservation = reservations.find(r => r.id === bookingId);
    
    if (reservation) {
        document.getElementById('edit-id').value = reservation.id;
        document.getElementById('edit-customer-type').value = reservation.customerType || 'umum';
        document.getElementById('edit-payment-status').value = reservation.paymentStatus;
        document.getElementById('edit-total-amount').value = reservation.totalAmount || reservation.amount || '';
        document.getElementById('edit-paid-amount').value = reservation.paidAmount || 0;
        document.getElementById('edit-notes').value = reservation.notes || '';
        
        // Update remaining amount
        updateEditRemainingAmount();
        
        editModal.style.display = 'block';
    }
}

// Handle edit form submission - DIPERBAIKI DENGAN NOTIFY
function handleEdit(e) {
    e.preventDefault();
    
    const bookingId = parseInt(document.getElementById('edit-id').value);
    const customerType = document.getElementById('edit-customer-type').value;
    const paymentStatus = document.getElementById('edit-payment-status').value;
    const totalAmount = parseInt(document.getElementById('edit-total-amount').value);
    const paidAmount = parseInt(document.getElementById('edit-paid-amount').value);
    const notes = document.getElementById('edit-notes').value;
    
    // Validasi jumlah pembayaran
    if (paidAmount < 0) {
        showNotification('❌ Jumlah pembayaran tidak boleh negatif!', 'error');
        return;
    }
    
    if (paidAmount > totalAmount) {
        showNotification('❌ Jumlah pembayaran tidak boleh lebih dari total biaya!', 'error');
        return;
    }
    
    // Update reservation in localStorage
    let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
    const reservationIndex = reservations.findIndex(r => r.id === bookingId);
    
    if (reservationIndex !== -1) {
        reservations[reservationIndex].customerType = customerType;
        reservations[reservationIndex].paymentStatus = paymentStatus;
        reservations[reservationIndex].totalAmount = totalAmount;
        reservations[reservationIndex].paidAmount = paidAmount;
        reservations[reservationIndex].remainingAmount = totalAmount - paidAmount;
        reservations[reservationIndex].notes = notes;
        
        localStorage.setItem('reservations', JSON.stringify(reservations));
        
        // Update revenue history jika sudah ada di sana
        const revenueHistory = JSON.parse(localStorage.getItem('revenueHistory')) || [];
        const historyIndex = revenueHistory.findIndex(r => r.id === bookingId);
        
        if (historyIndex !== -1) {
            revenueHistory[historyIndex].customerType = customerType;
            revenueHistory[historyIndex].paymentStatus = paymentStatus;
            revenueHistory[historyIndex].totalAmount = totalAmount;
            revenueHistory[historyIndex].paidAmount = paidAmount;
            revenueHistory[historyIndex].remainingAmount = totalAmount - paidAmount;
            revenueHistory[historyIndex].updatedAt = new Date().toISOString();
            localStorage.setItem('revenueHistory', JSON.stringify(revenueHistory));
        }
        
        // NOTIFY DATA CHANGE - BARU DITAMBAHKAN
        notifyDataChange();
        
        // Close modal and refresh
        editModal.style.display = 'none';
        updateDashboardStats();
        displayManagementList();
        
        showNotification('✅ Booking badminton berhasil diperbarui!', 'success');
    }
}

// Delete booking - DIPERBAIKI DENGAN NOTIFY
function deleteBooking(bookingId) {
    if (confirm('Apakah Anda yakin ingin menghapus booking badminton ini?')) {
        let reservations = JSON.parse(localStorage.getItem('reservations')) || [];
        let revenueHistory = JSON.parse(localStorage.getItem('revenueHistory')) || [];
        
        // Hapus dari reservations
        reservations = reservations.filter(r => r.id !== bookingId);
        
        // Hapus dari revenue history juga
        revenueHistory = revenueHistory.filter(r => r.id !== bookingId);
        
        localStorage.setItem('reservations', JSON.stringify(reservations));
        localStorage.setItem('revenueHistory', JSON.stringify(revenueHistory));
        
        // UPDATE STATISTIK LANGSUNG SETELAH DELETE
        updateDailyStats();
        updateDashboardStats();
        displayManagementList();
        
        // NOTIFY DATA CHANGE - BARU DITAMBAHKAN
        notifyDataChange();
        
        showNotification('✅ Booking badminton berhasil dihapus!', 'success');
    }
}

// Format date to Indonesian format
function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Get payment status text
function getPaymentStatusText(status) {
    const statusMap = {
        'pending': 'Belum Bayar',
        'paid': 'Lunas',
        'partial': 'DP'
    };
    return statusMap[status] || status;
}

// Get booking time status
function getBookingTimeStatus(bookingDate, bookingTime) {
    const now = new Date();
    const timeInfo = parseBookingTime(bookingDate, bookingTime);
    const bookingStart = timeInfo.start;
    const bookingEnd = timeInfo.end;
    
    if (now < bookingStart) {
        return { status: 'upcoming', text: 'Akan Datang' };
    } else if (now >= bookingStart && now <= bookingEnd) {
        return { status: 'ongoing', text: 'Sedang Berlangsung' };
    } else {
        return { status: 'completed', text: 'Selesai' };
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70,
                behavior: 'smooth'
            });
        }
    });
});

console.log('✅ Admin Badminton loaded successfully with 4-week member package features!');