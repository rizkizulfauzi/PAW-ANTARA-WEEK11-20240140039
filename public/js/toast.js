/**
 * Komponen notifikasi toast - berbasis data & state, sama pola-nya
 * kayak cart/wishlist: satu store (toastStore), tiap berubah otomatis
 * di-render ulang lewat subscribe().
 */
const toastStore = createStore({
  items: [], // [{ id, message }]
});

// --- komponen toast item (berbasis data) ---
function renderToastItem(toast) {
  return `
    <div class="toast-item bg-gray-800 dark:bg-gray-700 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
      ${toast.message}
    </div>
  `;
}

function renderToasts(state) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  container.innerHTML = state.items.map(renderToastItem).join('');
}

toastStore.subscribe(renderToasts);

/**
 * Helper buat munculin toast dari mana aja (cart.js, wishlist.js, products.js).
 * Toast otomatis ilang sendiri setelah beberapa detik.
 */
function showToast(message, duration = 2200) {
  const id = Date.now() + Math.random();
  const items = toastStore.getState().items;
  toastStore.setState({ items: [...items, { id, message }] });

  setTimeout(() => {
    const current = toastStore.getState().items;
    toastStore.setState({ items: current.filter((t) => t.id !== id) });
  }, duration);
}
