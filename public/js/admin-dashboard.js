/**
 * Logic khusus halaman /admin (dashboard). Statistik & tabel produk udah
 * di-render server-side (SSR) pas halaman dibuka - file ini cuma nanganin
 * interaksi: tambah/edit/hapus produk, dan logout. Abis CRUD berhasil,
 * halaman di-reload biar tabel & statistik ke-hitung ulang dari server
 * (single source of truth-nya tetep database, bukan state di client).
 */

// --- logout ---
document.getElementById('admin-logout-btn').addEventListener('click', async () => {
  try {
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/';
  } catch (err) {
    showToast('Gagal logout, coba lagi');
  }
});

// --- toggle panel tambah produk ---
const addProductToggle = document.getElementById('admin-add-product-toggle');
addProductToggle.addEventListener('click', () => {
  document.getElementById('admin-add-product-panel').classList.toggle('hidden');
});

// --- submit form tambah produk ---
document.getElementById('admin-add-product-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    name: document.getElementById('new-product-name').value.trim(),
    description: document.getElementById('new-product-description').value.trim(),
    price: Number(document.getElementById('new-product-price').value),
    stock: Number(document.getElementById('new-product-stock').value),
  };

  try {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok || data.success === false) {
      showToast(data.message || 'Gagal menambahkan produk');
      return;
    }

    showToast('Produk berhasil ditambahkan');
    setTimeout(() => window.location.reload(), 500);
  } catch (err) {
    showToast('Gagal menghubungi server');
  }
});

// --- modal edit produk: buka & isi form dari data row yang diklik ---
function openEditModal(row) {
  document.getElementById('edit-product-id').value = row.dataset.id;
  document.getElementById('edit-product-name').value = row.dataset.name;
  document.getElementById('edit-product-description').value = row.dataset.description;
  document.getElementById('edit-product-price').value = row.dataset.price;
  document.getElementById('edit-product-stock').value = row.dataset.stock;
  document.getElementById('edit-product-error').classList.add('hidden');

  document.getElementById('edit-product-overlay').classList.remove('hidden');
  document.getElementById('edit-product-overlay').classList.add('flex');
}

function closeEditModal() {
  document.getElementById('edit-product-overlay').classList.add('hidden');
  document.getElementById('edit-product-overlay').classList.remove('flex');
}

document.getElementById('edit-product-close').addEventListener('click', closeEditModal);
document.getElementById('edit-product-backdrop').addEventListener('click', closeEditModal);

// --- submit form edit produk ---
document.getElementById('edit-product-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('edit-product-id').value;
  const payload = {
    name: document.getElementById('edit-product-name').value.trim(),
    description: document.getElementById('edit-product-description').value.trim(),
    price: Number(document.getElementById('edit-product-price').value),
    stock: Number(document.getElementById('edit-product-stock').value),
  };
  const errorEl = document.getElementById('edit-product-error');

  try {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (!res.ok || data.success === false) {
      errorEl.textContent = data.message || 'Gagal menyimpan perubahan';
      errorEl.classList.remove('hidden');
      return;
    }

    showToast('Produk berhasil diupdate');
    setTimeout(() => window.location.reload(), 500);
  } catch (err) {
    errorEl.textContent = 'Gagal menghubungi server';
    errorEl.classList.remove('hidden');
  }
});

// --- event delegation buat tombol edit & hapus di tiap baris tabel ---
document.getElementById('admin-product-table-body').addEventListener('click', async (e) => {
  const editBtn = e.target.closest('.admin-edit-btn');
  const deleteBtn = e.target.closest('.admin-delete-btn');

  if (editBtn) {
    const row = editBtn.closest('.admin-product-row');
    openEditModal(row);
    return;
  }

  if (deleteBtn) {
    const confirmDelete = window.confirm('Yakin mau hapus produk ini?');
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/products/${deleteBtn.dataset.id}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok || data.success === false) {
        showToast(data.message || 'Gagal menghapus produk');
        return;
      }

      showToast('Produk berhasil dihapus');
      setTimeout(() => window.location.reload(), 500);
    } catch (err) {
      showToast('Gagal menghubungi server');
    }
  }
});
