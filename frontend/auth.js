const API = 'http://localhost:3000/api';
let currentUser = null;
let currentToken = null;

const _fetch = window.fetch.bind(window);
window.fetch = (url, opts = {}) => {
  if (currentToken && !url.includes('/api/auth/login')) {
    opts.headers = Object.assign({}, opts.headers, { 'Authorization': 'Bearer ' + currentToken });
  }
  return _fetch(url, opts);
};

document.addEventListener('DOMContentLoaded', () => {
  const storedToken = localStorage.getItem('wfh_token');
  const storedUser = localStorage.getItem('wfh_user');
  if (storedToken && storedUser) {
    currentToken = storedToken;
    currentUser = JSON.parse(storedUser);
    bootApp();
  } else {
    showLogin();
  }
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('logoutBtn').addEventListener('click', logout);
});

function showLogin() {
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('appShell').style.display = 'none';
}

function bootApp() {
  document.getElementById('loginPage').style.display = 'none';
  document.getElementById('appShell').style.display = 'flex';
  updateUserUI();
  if (typeof initApp === 'function') initApp();
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  const errEl = document.getElementById('loginError');
  errEl.style.display = 'none';
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Signing in...';
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;
  try {
    const res = await _fetch(API + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      currentToken = data.token;
      currentUser = data.user;
      localStorage.setItem('wfh_token', currentToken);
      localStorage.setItem('wfh_user', JSON.stringify(currentUser));
      bootApp();
    } else {
      errEl.textContent = data.message || 'Login failed';
      errEl.style.display = 'block';
    }
  } catch {
    errEl.textContent = 'Cannot connect to server. Is it running?';
    errEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
}

function logout() {
  currentUser = null; currentToken = null;
  localStorage.removeItem('wfh_token');
  localStorage.removeItem('wfh_user');
  showLogin();
}

function updateUserUI() {
  if (!currentUser) return;
  const initials = currentUser.username.slice(0, 2).toUpperCase();
  document.getElementById('userAvatar').textContent = initials;
  document.getElementById('sidebarUsername').textContent = currentUser.username;
  document.getElementById('sidebarRole').textContent = currentUser.role;
}

function isAdmin() { return currentUser && currentUser.role === 'admin'; }
function isManagerOrAdmin() { return currentUser && (currentUser.role === 'admin' || currentUser.role === 'manager'); }
