/**
 * Fitur admin di halaman toko (storefront): login/logout + toggle status
 * "sedang login sebagai admin". Kelola produk (tambah/edit/hapus) sekarang
 * ada di halaman terpisah /admin (lihat views/admin.ejs + admin-dashboard.js),
 * jadi file ini cuma fokus ke sisi login/logout aja.
 *
 * Backend-nya (session auth) udah ada duluan di:
 *   - POST /api/admin/login, POST /api/admin/logout
 *
 * Status login (window.__IS_ADMIN__) dikirim dari server saat render halaman
 * (lihat controllers/page.controller.js), jadi begitu load, UI langsung
 * tau apakah user ini admin atau bukan.
 */

function applyAdminVisibility(isAdmin) {
  document.getElementById('admin-login-btn').classList.toggle('hidden', isAdmin);

  const status = document.getElementById('admin-status');
  status.classList.toggle('hidden', !isAdmin);
  status.classList.toggle('flex', isAdmin);
}

applyAdminVisibility(window.__IS_ADMIN__);

// --- modal login: buka/tutup ---
function openAdminLogin() {
  document.getElementById('admin-login-overlay').classList.remove('hidden');
  document.getElementById('admin-login-overlay').classList.add('flex');
  document.getElementById('admin-login-error').classList.add('hidden');
}

function closeAdminLogin() {
  document.getElementById('admin-login-overlay').classList.add('hidden');
  document.getElementById('admin-login-overlay').classList.remove('flex');
  document.getElementById('admin-login-form').reset();
}

document.getElementById('admin-login-btn').addEventListener('click', openAdminLogin);
document.getElementById('admin-login-close').addEventListener('click', closeAdminLogin);
document.getElementById('admin-login-backdrop').addEventListener('click', closeAdminLogin);

// --- submit form login ---
document.getElementById('admin-login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = document.getElementById('admin-username').value.trim();
  const password = document.getElementById('admin-password').value;
  const errorEl = document.getElementById('admin-login-error');

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (!res.ok || data.success === false) {
      errorEl.textContent = data.message || 'Login gagal';
      errorEl.classList.remove('hidden');
      return;
    }

    closeAdminLogin();
    showToast('Login admin berhasil');
    // reload biar server render ulang halaman dengan isAdmin = true
    setTimeout(() => window.location.reload(), 600);
  } catch (err) {
    errorEl.textContent = 'Gagal menghubungi server';
    errorEl.classList.remove('hidden');
  }
});

// --- logout ---
document.getElementById('admin-logout-btn').addEventListener('click', async () => {
  try {
    await fetch('/api/admin/logout', { method: 'POST' });
    showToast('Berhasil logout');
    setTimeout(() => window.location.reload(), 400);
  } catch (err) {
    showToast('Gagal logout, coba lagi');
  }
});
