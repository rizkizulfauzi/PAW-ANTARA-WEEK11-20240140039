const productStore = createStore({
  products: window.__INITIAL_PRODUCTS__ || [],
  filter: 'all', // 'all' | 'available' | 'out'
  search: '', // kata kunci pencarian nama produk
  sort: 'default', // 'default' | 'price-asc' | 'price-desc' | 'name-asc'
});

// komponen badge & card versi JS, paralel sama versi EJS di views/partials
function renderBadge({ label, color }) {
  const colorMap = {
    green: 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300 dark:border-green-700',
    red: 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300 dark:border-red-700',
    yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-700',
    gray: 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600',
  };
  const classes = colorMap[color] || colorMap.gray;
  return `<span class="inline-block px-2 py-1 text-xs font-semibold rounded-full border ${classes}">${label}</span>`;
}

function renderProductCard(product) {
  const isAvailable = product.stock > 0;
  const isLowStock = isAvailable && product.stock <= 5;

  let badgeLabel = 'Tersedia';
  let badgeColor = 'green';
  if (!isAvailable) {
    badgeLabel = 'Habis';
    badgeColor = 'red';
  } else if (isLowStock) {
    badgeLabel = 'Stok Menipis';
    badgeColor = 'yellow';
  }

  const badge = renderBadge({ label: badgeLabel, color: badgeColor });

  // ikon hati disinkronkan sama wishlistStore (public/js/wishlist.js), kalo belum
  // ke-load (misal render pertama sebelum wishlist.js jalan) default-nya kosong
  const inWishlist = typeof isInWishlist === 'function' && isInWishlist(product.id);
  const heartIcon = inWishlist ? '❤️' : '🤍';

  return `
    <div class="product-card bg-white dark:bg-gray-800 border border-navy/10 dark:border-gray-700 rounded-2xl p-4 shadow-sm hover:shadow-lg transition-shadow" data-stock="${product.stock}">
      <div class="flex items-start justify-between mb-2 gap-2">
        <h3 class="font-bold text-navy dark:text-gray-100">${product.name}</h3>
        <div class="flex items-center gap-1 shrink-0">
          ${badge}
          <button class="wishlist-btn text-lg leading-none px-1" data-id="${product.id}" title="Simpan ke favorit">${heartIcon}</button>
        </div>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">${product.description || 'Tanpa deskripsi'}</p>
      <div class="flex items-center justify-between mb-3">
        <span class="text-sunset font-extrabold">Rp${Number(product.price).toLocaleString('id-ID')}</span>
        <span class="text-xs text-gray-400 dark:text-gray-500">Stok: ${product.stock}</span>
      </div>
      <button
        class="add-to-cart-btn w-full ${isAvailable ? 'bg-sunset hover:bg-sunset-dark text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'} text-xs font-bold uppercase tracking-wide py-2.5 rounded-full transition-colors"
        data-id="${product.id}"
        data-name="${product.name}"
        data-price="${product.price}"
        data-stock="${product.stock}"
        ${isAvailable ? '' : 'disabled'}
      >
        ${isAvailable ? '+ Tambah ke Keranjang' : 'Stok Habis'}
      </button>
    </div>
  `;
}

function getFilteredProducts(state) {
  let list = state.products;

  if (state.filter === 'available') list = list.filter((p) => p.stock > 0);
  if (state.filter === 'out') list = list.filter((p) => p.stock === 0);

  if (state.search && state.search.trim() !== '') {
    const query = state.search.trim().toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(query));
  }

  const sorted = [...list];
  if (state.sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
  else if (state.sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
  else if (state.sort === 'name-asc') sorted.sort((a, b) => a.name.localeCompare(b.name));

  return sorted;
}

function renderProductList(state) {
  const container = document.getElementById('product-list');
  const emptyState = document.getElementById('empty-state');
  const filtered = getFilteredProducts(state);

  if (filtered.length === 0) {
    container.innerHTML = '';
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  container.innerHTML = filtered.map(renderProductCard).join('');
}

productStore.subscribe(renderProductList);

// tombol filter
document.getElementById('filter-buttons').addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-btn');
  if (!btn) return;

  productStore.setState({ filter: btn.dataset.filter });

  document.querySelectorAll('.filter-btn').forEach((b) => {
    b.classList.remove('bg-sunset', 'text-white', 'shadow-sm');
    b.classList.add('bg-white', 'dark:bg-gray-700', 'border', 'border-navy/20', 'dark:border-gray-600', 'text-navy', 'dark:text-gray-300');
  });
  btn.classList.remove('bg-white', 'dark:bg-gray-700', 'border', 'border-navy/20', 'dark:border-gray-600', 'text-navy', 'dark:text-gray-300');
  btn.classList.add('bg-sunset', 'text-white', 'shadow-sm');
});

// kotak pencarian, kata kuncinya nyambung langsung ke productStore
document.getElementById('search-input').addEventListener('input', (e) => {
  productStore.setState({ search: e.target.value });
});

// dropdown pengurutan
document.getElementById('sort-select').addEventListener('change', (e) => {
  productStore.setState({ sort: e.target.value });
});

/**
 * event delegation buat tombol "Tambah ke Keranjang" & tombol wishlist (hati) -
 * dipasang di container, bukan per-tombol, soalnya kartu produk di-render ulang
 * tiap kali filter/pencarian/pengurutan berubah.
 */
document.getElementById('product-list').addEventListener('click', (e) => {
  const addBtn = e.target.closest('.add-to-cart-btn');
  const heartBtn = e.target.closest('.wishlist-btn');

  if (addBtn && !addBtn.disabled) {
    addToCart({
      id: addBtn.dataset.id,
      name: addBtn.dataset.name,
      price: Number(addBtn.dataset.price),
    });

    showToast(`${addBtn.dataset.name} ditambahkan ke keranjang`);

    // buka keranjang otomatis biar user liat item baru masuk
    cartStore.setState({ isOpen: true });
    return;
  }

  if (heartBtn) {
    toggleWishlist(heartBtn.dataset.id);
    showToast(isInWishlist(heartBtn.dataset.id) ? 'Ditambahkan ke favorit' : 'Dihapus dari favorit');
  }
});
