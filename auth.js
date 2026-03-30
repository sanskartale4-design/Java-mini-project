document.addEventListener('DOMContentLoaded', () => {
    // Helper to get from LocalStorage
    const getStorage = (key) => JSON.parse(localStorage.getItem(key)) || [];
    const setStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));

    // Handle Registration
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const role = document.getElementById('reg-role').value;

            const users = getStorage('users');
            if (users.some(u => u.email === email)) {
                alert('Email already registered!');
                return;
            }

            const newUser = {
                id: Date.now(),
                name,
                email,
                password,
                role
            };

            users.push(newUser);
            setStorage('users', users);
            alert('Registration successful! Please login.');
            window.location.href = 'login.html';
        });
    }

    // Handle Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            // Initial Admin Setup if not exists
            const users = getStorage('users');
            if (email === 'admin@gmail.com' && password === '1234') {
                let admin = users.find(u => u.email === email);
                if (!admin) {
                   admin = { id: 1, name: 'Admin', email: 'admin@gmail.com', password: '1234', role: 'admin' };
                   users.push(admin);
                   setStorage('users', users);
                }
                sessionStorage.setItem('currentUser', JSON.stringify(admin));
                window.location.href = 'admin-dashboard.html';
                return;
            }

            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                window.location.href = (user.role === 'admin') ? 'admin-dashboard.html' : 'user-dashboard.html';
            } else {
                alert('Invalid credentials!');
            }
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }

    // Display Current User Name
    const userDisplay = document.getElementById('userNameDisplay');
    if (userDisplay) {
        const user = JSON.parse(sessionStorage.getItem('currentUser'));
        if (user) userDisplay.textContent = user.name + ` (${user.role})`;
    }
});
