// Data login admin untuk kedua jenis admin
const ADMIN_CREDENTIALS = {
    adminbadminton: {
        username: "adminbadminton",
        password: "admin123",
        redirect: "AdminBadminton.html",
        type: "badminton"
    },
    adminminisoccer: {
        username: "adminminisoccer", 
        password: "admin123",
        redirect: "AdminMiniSoccer.html",
        type: "minisoccer"
    }
};

// Event listener untuk form login
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const loginBtn = document.querySelector('.login-btn');
    
    // Tampilkan loading state
    loginBtn.classList.add('loading');
    loginBtn.disabled = true;
    
    // Simulasikan proses login dengan delay
    setTimeout(() => {
        // Cek kredensial untuk setiap jenis admin
        let isValid = false;
        let redirectUrl = '';
        let adminType = '';
        
        // Cek admin badminton
        if (username === ADMIN_CREDENTIALS.adminbadminton.username && 
            password === ADMIN_CREDENTIALS.adminbadminton.password) {
            isValid = true;
            redirectUrl = ADMIN_CREDENTIALS.adminbadminton.redirect;
            adminType = ADMIN_CREDENTIALS.adminbadminton.type;
        }
        // Cek admin mini soccer
        else if (username === ADMIN_CREDENTIALS.adminminisoccer.username && 
                 password === ADMIN_CREDENTIALS.adminminisoccer.password) {
            isValid = true;
            redirectUrl = ADMIN_CREDENTIALS.adminminisoccer.redirect;
            adminType = ADMIN_CREDENTIALS.adminminisoccer.type;
        }
        
        if (isValid) {
            // Tampilkan pesan sukses
            showMessage('Login berhasil! Mengarahkan ke dashboard...', 'success');
            
            // Simpan status login di sessionStorage
            sessionStorage.setItem('adminLoggedIn', 'true');
            sessionStorage.setItem('loginTime', new Date().getTime().toString());
            sessionStorage.setItem('adminType', adminType);
            sessionStorage.setItem('adminUsername', username);
            
            // Redirect ke halaman admin yang sesuai setelah delay
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 1500);
            
        } else {
            // Reset loading state
            loginBtn.classList.remove('loading');
            loginBtn.disabled = false;
            
            showMessage('Username atau password salah! Silakan coba lagi.', 'error');
            
            // Clear password field
            document.getElementById('password').value = '';
            document.getElementById('password').focus();
        }
    }, 1000);
});

// Fungsi untuk menampilkan pesan
function showMessage(message, type) {
    // Hapus pesan sebelumnya jika ada
    const existingMessage = document.querySelector('.error-message, .success-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Buat element pesan
    const messageDiv = document.createElement('div');
    messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
    messageDiv.textContent = message;
    
    // Sisipkan sebelum tombol login
    const loginBtn = document.querySelector('.login-btn');
    loginBtn.parentNode.insertBefore(messageDiv, loginBtn);
    
    // Tampilkan dengan animasi
    setTimeout(() => {
        messageDiv.classList.add('show');
    }, 10);
    
    // Auto hide message setelah 5 detik (kecuali success)
    if (type === 'error') {
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.classList.remove('show');
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.remove();
                    }
                }, 300);
            }
        }, 5000);
    }
}

// Cek jika user sudah login, redirect ke halaman yang sesuai
document.addEventListener('DOMContentLoaded', function() {
    // Auto-focus pada username field
    document.getElementById('username').focus();
    
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        const adminType = sessionStorage.getItem('adminType');
        const loginTime = parseInt(sessionStorage.getItem('loginTime'));
        const currentTime = new Date().getTime();
        
        // Cek session timeout (8 jam)
        if (currentTime - loginTime > 8 * 60 * 60 * 1000) {
            // Session expired
            sessionStorage.removeItem('adminLoggedIn');
            sessionStorage.removeItem('loginTime');
            sessionStorage.removeItem('adminType');
            sessionStorage.removeItem('adminUsername');
        } else {
            // Redirect ke halaman yang sesuai berdasarkan admin type
            let redirectUrl = '';
            if (adminType === 'badminton') {
                redirectUrl = 'AdminBadminton.html';
            } else if (adminType === 'minisoccer') {
                redirectUrl = 'AdminMiniSoccer.html';
            }
            
            if (redirectUrl) {
                showMessage('Anda sudah login. Mengarahkan ke dashboard...', 'success');
                setTimeout(() => {
                    window.location.href = redirectUrl;
                }, 1500);
            }
        }
    }
});

// Tambahkan event listener untuk menghilangkan pesan error saat user mulai mengetik
document.getElementById('username').addEventListener('input', hideMessages);
document.getElementById('password').addEventListener('input', hideMessages);

function hideMessages() {
    const messages = document.querySelectorAll('.error-message, .success-message');
    messages.forEach(message => {
        message.classList.remove('show');
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 300);
    });
}

// Enter key untuk submit form
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const activeElement = document.activeElement;
        if (activeElement.tagName === 'INPUT') {
            document.getElementById('login-form').dispatchEvent(new Event('submit'));
        }
    }
});