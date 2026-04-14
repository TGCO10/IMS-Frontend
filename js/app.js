document.addEventListener('DOMContentLoaded', () => {
    // Only execute on Login/Registration Page
    if(window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('miniproject_group14/') || window.location.pathname.endsWith('frontend/')) {
        
        UI.checkAuth();

        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                const btn = loginForm.querySelector('button');
                btn.disabled = true;

                try {
                    const data = await API.login(email, password);
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email, isAdmin: data.isAdmin }));
                    window.location.href = 'pages/dashboard.html';
                } catch (error) {
                    const errEl = document.getElementById('loginError');
                    errEl.textContent = error.message;
                    errEl.classList.remove('hide');
                } finally {
                    btn.disabled = false;
                }
            });
        }

        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const name = document.getElementById('regName').value;
                const email = document.getElementById('regEmail').value;
                const password = document.getElementById('regPassword').value;
                const btn = registerForm.querySelector('button');
                btn.disabled = true;

                try {
                    const data = await API.register(name, email, password);
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email, isAdmin: data.isAdmin }));
                    window.location.href = 'pages/dashboard.html';
                } catch (error) {
                    const errEl = document.getElementById('regError');
                    errEl.textContent = error.message;
                    errEl.classList.remove('hide');
                } finally {
                    btn.disabled = false;
                }
            });
        }

        // Toggles for forms
        document.getElementById('toggleRegister')?.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.login-container').classList.add('hide');
            document.querySelector('.register-container').classList.remove('hide');
        });

        document.getElementById('toggleLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelector('.register-container').classList.add('hide');
            document.querySelector('.login-container').classList.remove('hide');
        });
    }
});