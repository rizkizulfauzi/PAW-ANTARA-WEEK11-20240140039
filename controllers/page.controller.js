const { Product } = require('../models');

async function renderHome(req, res) {
  try {
    const products = await Product.findAll({ order: [['createdAt', 'DESC']] });
    const storeName = process.env.STORE_NAME || 'Toko Kita';
    const isAdmin = !!(req.session && req.session.adminId);

    res.render('index', {
      products: products.map((p) => p.toJSON()),
      storeName,
      isAdmin,
    });
  } catch (err) {
    res.status(500).send('Gagal memuat halaman: ' + err.message);
  }
}

// halaman dashboard admin - cuma bisa diakses kalo udah login (session.adminId ada)
async function renderAdminDashboard(req, res) {
  try {
    const isAdmin = !!(req.session && req.session.adminId);
    if (!isAdmin) {
      return res.redirect('/');
    }

    const products = await Product.findAll({ order: [['createdAt', 'DESC']] });
    const storeName = process.env.STORE_NAME || 'Toko Kita';

    // statistik ringkas, dihitung dari data produk yang sama (bukan hardcode)
    const stats = {
      total: products.length,
      available: products.filter((p) => p.stock > 5).length,
      lowStock: products.filter((p) => p.stock > 0 && p.stock <= 5).length,
      outOfStock: products.filter((p) => p.stock === 0).length,
    };

    res.render('admin', {
      products: products.map((p) => p.toJSON()),
      storeName,
      stats,
    });
  } catch (err) {
    res.status(500).send('Gagal memuat dashboard: ' + err.message);
  }
}

module.exports = { renderHome, renderAdminDashboard };
