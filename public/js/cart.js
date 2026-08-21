// Cart disimpen di localStorage juga, biar gak ilang kalo reload halaman
function loadCartFromStorage() {
  try {
    const saved = localStorage.getItem('cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

const cartStore = createStore({
  items: loadCartFromStorage(), // [{ id, name, price, qty }]
  isOpen: false,
});

// --- helper hitung nilai turunan dari state (derived value) ---
function getTotalQty(items) {
  return items.reduce((sum, item) => sum + item.qty, 0);
}
function getTotalPrice(items) {
  return items.reduce((sum, item) => sum + item.price * item.qty, 0);
}

// --- komponen item keranjang (berbasis data) ---
function renderCartItem(item) {
  return `
    <div class="flex items-center justify-between gap-2 border-b border-gray-100 dark:border-gray-700 pb-3">
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-800 dark:text-gray-100">${item.name}</p>
        <p class="text-xs text-gray-400 dark:text-gray-500">Rp${item.price.toLocaleString('id-ID')} / item</p>
      </div>
      <div class="flex items-center gap-2">
        <button class="cart-decrease w-6 h-6 rounded-full bg-navy/10 dark:bg-gray-700 text-navy dark:text-gray-300 hover:bg-sunset hover:text-white transition-colors" data-id="${item.id}">-</button>
        <span class="text-sm w-5 text-center">${item.qty}</span>
        <button class="cart-increase w-6 h-6 rounded-full bg-navy/10 dark:bg-gray-700 text-navy dark:text-gray-300 hover:bg-sunset hover:text-white transition-colors" data-id="${item.id}">+</button>
      </div>
    </div>
  `;
}

/**
 * INI YANG BIKIN BADGE "DINAMIS": tiap kali cartStore berubah
 * (nambah/kurang/hapus item), fungsi ini otomatis dipanggil ulang
 * lewat subscribe(), badge & drawer selalu sinkron sama state.
 */
function renderCart(state) {
  const badge = document.getElementById('cart-badge');
  const itemsContainer = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-overlay');

  const totalQty = getTotalQty(state.items);
  const totalPrice = getTotalPrice(state.items);

  // update badge angka
  if (totalQty > 0) {
    badge.textContent = totalQty > 99 ? '99+' : totalQty;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }

  // render isi drawer
  if (state.items.length === 0) {
    itemsContainer.innerHTML = '<p class="text-center text-gray-400 dark:text-gray-500 py-8">Keranjang masih kosong</p>';
  } else {
    itemsContainer.innerHTML = state.items.map(renderCartItem).join('');
  }

  totalEl.textContent = 'Rp' + totalPrice.toLocaleString('id-ID');

  // buka/tutup drawer
  if (state.isOpen) {
    drawer.classList.remove('translate-x-full');
    overlay.classList.remove('hidden');
  } else {
    drawer.classList.add('translate-x-full');
    overlay.classList.add('hidden');
  }

  // sinkron ke localStorage tiap kali state berubah
  localStorage.setItem('cart', JSON.stringify(state.items));
}

cartStore.subscribe(renderCart);
renderCart(cartStore.getState()); // render pertama kali pas halaman dibuka

// --- actions: nambah, kurang, hapus item ---
function addToCart({ id, name, price }) {
  const items = cartStore.getState().items;
  const existing = items.find((item) => item.id === id);

  if (existing) {
    cartStore.setState({
      items: items.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item)),
    });
  } else {
    cartStore.setState({ items: [...items, { id, name, price, qty: 1 }] });
  }
}

function changeQty(id, delta) {
  const items = cartStore.getState().items;
  const updated = items
    .map((item) => (item.id === id ? { ...item, qty: item.qty + delta } : item))
    .filter((item) => item.qty > 0); // kalo qty jadi 0, item ilang dari keranjang

  cartStore.setState({ items: updated });
}

// --- event listeners ---
document.getElementById('cart-toggle').addEventListener('click', () => {
  cartStore.setState({ isOpen: true });
});
document.getElementById('cart-close').addEventListener('click', () => {
  cartStore.setState({ isOpen: false });
});
document.getElementById('cart-overlay').addEventListener('click', () => {
  cartStore.setState({ isOpen: false });
});

// event delegation buat tombol +/- yang di-render dinamis
document.getElementById('cart-items').addEventListener('click', (e) => {
  const increaseBtn = e.target.closest('.cart-increase');
  const decreaseBtn = e.target.closest('.cart-decrease');

  if (increaseBtn) changeQty(increaseBtn.dataset.id, 1);
  if (decreaseBtn) changeQty(decreaseBtn.dataset.id, -1);
});
