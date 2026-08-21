/**
 * Fitur checkout - state sederhana (checkoutStore) buat buka/tutup modal
 * "Pesanan Berhasil". Polanya sama kayak toast/wishlist: satu store,
 * subscribe buat render ulang otomatis.
 */
const checkoutStore = createStore({ isOpen: false });

function renderCheckoutModal(state) {
  const modal = document.getElementById('checkout-modal');
  if (!modal) return;

  if (state.isOpen) {
    modal.classList.remove('hidden');
  } else {
    modal.classList.add('hidden');
  }
}

checkoutStore.subscribe(renderCheckoutModal);

// --- action: proses checkout ---
function doCheckout() {
  const items = cartStore.getState().items;

  if (items.length === 0) {
    showToast('Keranjang masih kosong');
    return;
  }

  // "checkout": kosongin keranjang, tutup drawer, munculin modal sukses
  cartStore.setState({ items: [], isOpen: false });
  checkoutStore.setState({ isOpen: true });
}

document.getElementById('checkout-btn').addEventListener('click', doCheckout);
document.getElementById('checkout-modal-close').addEventListener('click', () => {
  checkoutStore.setState({ isOpen: false });
});
document.getElementById('checkout-modal-overlay').addEventListener('click', () => {
  checkoutStore.setState({ isOpen: false });
});
