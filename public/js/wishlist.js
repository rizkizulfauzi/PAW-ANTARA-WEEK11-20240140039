// Wishlist disimpen di localStorage juga, sama kayak cart, biar gak ilang kalo reload
function loadWishlistFromStorage() {
  try {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

const wishlistStore = createStore({
  ids: loadWishlistFromStorage(), // array of product id (string)
  isOpen: false,
});

function isInWishlist(id) {
  return wishlistStore.getState().ids.includes(String(id));
}

// --- action: toggle produk masuk/keluar wishlist ---
function toggleWishlist(id) {
  id = String(id);
  const ids = wishlistStore.getState().ids;
  const updated = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  wishlistStore.setState({ ids: updated });
}

// --- komponen item wishlist (berbasis data), mirip renderCartItem di cart.js ---
function renderWishlistItem(product) {
  return `
    <div class="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-800 dark:text-gray-100">${product.name}</p>
        <p class="text-xs text-gray-400 dark:text-gray-500">Rp${Number(product.price).toLocaleString('id-ID')}</p>
      </div>
      <button class="wishlist-remove text-red-500 hover:text-red-700 text-xs font-semibold" data-id="${product.id}">
        Hapus
      </button>
    </div>
  `;
}

/**
 * Tiap kali wishlistStore berubah (nambah/hapus favorit, buka/tutup drawer),
 * drawer & badge favorit di-render ulang. Kartu produk juga di-render ulang
 * (lewat renderProductList dari products.js) biar ikon hati-nya ikut sinkron.
 */
function renderWishlist(state) {
  const badge = document.getElementById('wishlist-badge');
  const itemsContainer = document.getElementById('wishlist-items');
  const drawer = document.getElementById('wishlist-drawer');
  const overlay = document.getElementById('wishlist-overlay');

  const allProducts = productStore.getState().products;
  const wishlistProducts = allProducts.filter((p) => state.ids.includes(String(p.id)));

  // update badge angka
  if (state.ids.length > 0) {
    badge.textContent = state.ids.length > 99 ? '99+' : state.ids.length;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }

  // render isi drawer
  if (wishlistProducts.length === 0) {
    itemsContainer.innerHTML = '<p class="text-center text-gray-400 dark:text-gray-500 py-8">Belum ada produk favorit</p>';
  } else {
    itemsContainer.innerHTML = wishlistProducts.map(renderWishlistItem).join('');
  }

  // buka/tutup drawer
  if (state.isOpen) {
    drawer.classList.remove('translate-x-full');
    overlay.classList.remove('hidden');
  } else {
    drawer.classList.add('translate-x-full');
    overlay.classList.add('hidden');
  }

  // sinkron ke localStorage tiap kali state berubah
  localStorage.setItem('wishlist', JSON.stringify(state.ids));

  // sinkronkan ikon hati di kartu produk dengan state wishlist terbaru
  renderProductList(productStore.getState());
}

wishlistStore.subscribe(renderWishlist);
renderWishlist(wishlistStore.getState()); // render pertama kali pas halaman dibuka

// --- event listeners ---
document.getElementById('wishlist-toggle').addEventListener('click', () => {
  wishlistStore.setState({ isOpen: true });
});
document.getElementById('wishlist-close').addEventListener('click', () => {
  wishlistStore.setState({ isOpen: false });
});
document.getElementById('wishlist-overlay').addEventListener('click', () => {
  wishlistStore.setState({ isOpen: false });
});

// event delegation buat tombol "Hapus" yang di-render dinamis
document.getElementById('wishlist-items').addEventListener('click', (e) => {
  const removeBtn = e.target.closest('.wishlist-remove');
  if (!removeBtn) return;

  toggleWishlist(removeBtn.dataset.id);
  showToast('Dihapus dari favorit');
});
