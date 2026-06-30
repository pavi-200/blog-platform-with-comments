const API_BASE = 'http://localhost:5000/api';

function getToken() {
  return localStorage.getItem('blogToken');
}

function setAuthUI() {
  const token = getToken();
  const loginLink = document.getElementById('loginLink');
  const logoutLink = document.getElementById('logoutLink');

  if (loginLink && logoutLink) {
    if (token) {
      loginLink.classList.add('hidden');
      logoutLink.classList.remove('hidden');
    } else {
      loginLink.classList.remove('hidden');
      logoutLink.classList.add('hidden');
    }
  }
}

function showToast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

function redirectIfLoggedIn() {
  if (getToken()) {
    window.location.href = 'dashboard.html';
  }
}

function logout() {
  localStorage.removeItem('blogToken');
  window.location.href = 'index.html';
}

async function apiFetch(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getToken();

  if (token) headers.Authorization = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${API_BASE}${url}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data;
}

function attachAuthEvents() {
  const logoutLink = document.getElementById('logoutLink');
  if (logoutLink) {
    logoutLink.addEventListener('click', (event) => {
      event.preventDefault();
      logout();
    });
  }

  document.querySelectorAll('.tab-btn').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach((btn) => btn.classList.remove('active'));
      document.querySelectorAll('.auth-panel').forEach((panel) => panel.classList.remove('active'));
      button.classList.add('active');
      document.getElementById(button.dataset.target).classList.add('active');
    });
  });

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const nameInput = document.getElementById('registerName') || document.getElementById('name');
      const emailInput = document.getElementById('registerEmail') || document.getElementById('email');
      const passwordInput = document.getElementById('registerPassword') || document.getElementById('password');

      const payload = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value
      };

      try {
        const data = await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
        localStorage.setItem('blogToken', data.token);
        showToast('Registration successful');
        window.location.href = 'dashboard.html';
      } catch (error) {
        showToast(error.message);
      }
    });
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const emailInput = document.getElementById('loginEmail') || document.getElementById('email');
      const passwordInput = document.getElementById('loginPassword') || document.getElementById('password');

      const payload = {
        email: emailInput.value.trim(),
        password: passwordInput.value
      };

      try {
        const data = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(payload) });
        localStorage.setItem('blogToken', data.token);
        showToast('Login successful');
        window.location.href = 'dashboard.html';
      } catch (error) {
        showToast(error.message);
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  setAuthUI();
  attachAuthEvents();
  redirectIfLoggedIn();
});
