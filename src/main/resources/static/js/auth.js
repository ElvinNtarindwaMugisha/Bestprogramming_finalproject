document.addEventListener('DOMContentLoaded', () => {
    const authContainer = document.getElementById('auth-container');
    const studentContainer = document.getElementById('student-container');
    const adminContainer = document.getElementById('admin-container');

    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');
    const loginView = document.getElementById('login-form-view');
    const signupView = document.getElementById('signup-form-view');

    /* ---- Switch between Login / Sign Up ---- */
    showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginView.classList.add('hidden');
        signupView.classList.remove('hidden');
        signupView.classList.add('fade-in');
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupView.classList.add('hidden');
        loginView.classList.remove('hidden');
        loginView.classList.add('fade-in');
    });

    /* ---- Login ---- */
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const identifier = document.getElementById('regNumber').value.trim();
        const password = document.getElementById('password').value;

        try {
            const resp = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password })
            });
            const data = await resp.json();

            if (data.success) {
                localStorage.setItem('user', JSON.stringify(data));
                routeToPortal(data);
            } else {
                showAuthError(data.message || 'Invalid credentials. Please try again.');
            }
        } catch (err) {
            console.error('Auth error', err);
            showAuthError('Could not connect to server. Is the app running?');
        }
    });

    /* ---- Sign Up ---- */
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('fullName').value.trim();
        const registrationNumber = document.getElementById('signupRegNumber').value.trim();
        const password = document.getElementById('signupPassword').value;

        try {
            const resp = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, registrationNumber, password })
            });
            const data = await resp.json();

            if (data.success) {
                // Switch back to login
                signupView.classList.add('hidden');
                loginView.classList.remove('hidden');
                loginView.classList.add('fade-in');
                showAuthSuccess('Account created! Please login.');
            } else {
                showAuthError(data.message || 'Registration failed.');
            }
        } catch (err) {
            showAuthError('Could not connect to server.');
        }
    });

    /* ---- Logout buttons ---- */
    document.getElementById('student-logout-btn').addEventListener('click', logout);
    document.getElementById('admin-logout-btn').addEventListener('click', logout);

    function logout() {
        localStorage.removeItem('user');
        studentContainer.classList.add('hidden');
        adminContainer.classList.add('hidden');
        authContainer.classList.remove('hidden');
        authContainer.classList.add('fade-in');
    }

    /* ---- Route to the correct portal ---- */
    function routeToPortal(user) {
        authContainer.classList.add('hidden');

        if (user.role === 'Administrator') {
            // Show Admin Portal
            adminContainer.classList.remove('hidden');
            adminContainer.classList.add('fade-in');

            document.getElementById('admin-avatar').textContent =
                user.name.substring(0, 2).toUpperCase();
            document.getElementById('admin-name').textContent = user.name;

            // Load admin dashboard
            loadAdminPage('dashboard');

        } else {
            // Show Student Portal
            studentContainer.classList.remove('hidden');
            studentContainer.classList.add('fade-in');

            document.getElementById('student-avatar').textContent =
                user.name.substring(0, 2).toUpperCase();
            document.getElementById('student-name').textContent = user.name;
            document.getElementById('student-reg').textContent = user.identifier || '';

            // Load notifications
            if (typeof loadStudentNotifications === 'function') {
                loadStudentNotifications();
            }
        }

        lucide.createIcons();
    }

    /* ---- Restore session on page reload ---- */
    const saved = localStorage.getItem('user');
    if (saved) {
        routeToPortal(JSON.parse(saved));
    }

    /* ---- Auth feedback helpers ---- */
    function showAuthError(msg) {
        clearAuthFeedback();
        const el = document.createElement('p');
        el.className = 'auth-error-msg';
        el.textContent = '⚠ ' + msg;
        loginView.querySelector('form').prepend(el);
    }

    function showAuthSuccess(msg) {
        clearAuthFeedback();
        const el = document.createElement('p');
        el.className = 'auth-success-msg';
        el.textContent = '✓ ' + msg;
        loginView.querySelector('form').prepend(el);
    }

    function clearAuthFeedback() {
        document.querySelectorAll('.auth-error-msg, .auth-success-msg').forEach(e => e.remove());
    }
});
