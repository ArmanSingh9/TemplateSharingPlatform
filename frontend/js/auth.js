import api from './api.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    // LOGIN FORM
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = loginForm.querySelector('button[type="submit"]');
            const originalHtml = btn.innerHTML;
            btn.innerHTML = '<div style="width:18px;height:18px;border:2.5px solid rgba(255,255,255,0.4);border-top-color:white;border-radius:50%;animation:spin 0.7s linear infinite;margin:0 auto;"></div>';
            btn.disabled = true;

            const formData = Object.fromEntries(new FormData(e.target));

            try {
                const data = await api.login(formData.email, formData.password);

                // Store token + full user object
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify({
                    _id: data._id,
                    name: data.name,
                    email: data.email,
                    role: data.role
                }));

                window.showToast(`Welcome back, ${data.name}! 👋`, 'success');
                setTimeout(() => window.location.href = '/index.html', 900);

            } catch (err) {
                window.showToast(err.message || 'Invalid email or password', 'error');
            } finally {
                btn.innerHTML = originalHtml;
                btn.disabled = false;
            }
        });
    }

    // REGISTER FORM
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = registerForm.querySelector('button[type="submit"]');
            const originalHtml = btn.innerHTML;
            btn.innerHTML = '<div style="width:18px;height:18px;border:2.5px solid rgba(255,255,255,0.4);border-top-color:white;border-radius:50%;animation:spin 0.7s linear infinite;margin:0 auto;"></div>';
            btn.disabled = true;

            const formData = Object.fromEntries(new FormData(e.target));

            if (!formData.name || !formData.email || !formData.password) {
                window.showToast('Please fill all fields', 'error');
                btn.innerHTML = originalHtml;
                btn.disabled = false;
                return;
            }

            if (formData.password.length < 6) {
                window.showToast('Password must be at least 6 characters', 'error');
                btn.innerHTML = originalHtml;
                btn.disabled = false;
                return;
            }

            try {
                await api.register(formData.name, formData.email, formData.password);
                window.showToast('Account created! Please sign in.', 'success');
                setTimeout(() => window.location.href = '/login.html', 1200);
            } catch (err) {
                window.showToast(err.message || 'Registration failed', 'error');
            } finally {
                btn.innerHTML = originalHtml;
                btn.disabled = false;
            }
        });
    }
});
