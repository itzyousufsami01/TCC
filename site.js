const CART_KEY = 'craftedCanopyCart';
const WISHLIST_KEY = 'craftedCanopyWishlist';
const SITE_SETTINGS_URL = 'site-settings.json';
const PRODUCTS_URL = 'products.json';

const FALLBACK_SETTINGS = {
  whatsappNumber: '01410355233',
  whatsappInternational: '8801410355233',
  whatsappMessage: 'Hello The Crafted Canopy, I need some help with my order/product.',
  shippingInsideLabel: 'ময়মনসিংহ সদরের ভেতরে',
  shippingInsideCharge: 80,
  shippingOutsideLabel: 'ময়মনসিংহ সদরের বাইরে',
  shippingOutsideCharge: 130
};

function toBnDigits(value) {
  const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
  return String(value).replace(/[0-9]/g, d => bn[Number(d)]);
}

function formatMoney(value) {
  const num = Number(value || 0);
  return `৳${toBnDigits(Number.isFinite(num) ? num : 0)}`;
}

async function loadJSON(url, fallback) {
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return fallback;
    return await response.json();
  } catch {
    return fallback;
  }
}

async function loadProducts() {
  const products = await loadJSON(PRODUCTS_URL, []);
  return Array.isArray(products) ? products : [];
}

async function loadSiteSettings() {
  const data = await loadJSON(SITE_SETTINGS_URL, {});
  const settings = { ...FALLBACK_SETTINGS };

  if (typeof data.whatsappNumber === 'string' && data.whatsappNumber.trim()) settings.whatsappNumber = data.whatsappNumber.trim();
  if (typeof data.whatsappInternational === 'string' && data.whatsappInternational.trim()) settings.whatsappInternational = data.whatsappInternational.trim();
  if (typeof data.whatsappMessage === 'string' && data.whatsappMessage.trim()) settings.whatsappMessage = data.whatsappMessage.trim();
  if (typeof data.shippingInsideLabel === 'string' && data.shippingInsideLabel.trim()) settings.shippingInsideLabel = data.shippingInsideLabel.trim();
  if (typeof data.shippingOutsideLabel === 'string' && data.shippingOutsideLabel.trim()) settings.shippingOutsideLabel = data.shippingOutsideLabel.trim();

  const inside = Number(data.shippingInsideCharge);
  const outside = Number(data.shippingOutsideCharge);
  if (Number.isFinite(inside) && inside >= 0 && inside < 1000) settings.shippingInsideCharge = inside;
  if (Number.isFinite(outside) && outside >= 0 && outside < 1000) settings.shippingOutsideCharge = outside;

  return settings;
}

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateBadges();
}

function getWishlist() {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || []; } catch { return []; }
}

function saveWishlist(list) {
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
  updateBadges();
}

function normalizeSlug(slug) {
  return String(slug || '').trim().toLowerCase();
}

function ensureSlug(product, index) {
  if (product && typeof product.slug === 'string' && product.slug.trim()) return normalizeSlug(product.slug);
  if (product && typeof product.sku === 'string' && product.sku.trim()) return normalizeSlug(product.sku);
  return `product-${index + 1}`;
}

function productCardId(product, index) {
  return ensureSlug(product, index);
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + Number(item.qty || 0), 0);
}

function getWishlistCount() {
  return getWishlist().length;
}

function updateBadges() {
  const cartBadge = document.getElementById('cartBadge');
  if (cartBadge) {
    const count = getCartCount();
    cartBadge.textContent = toBnDigits(count);
    cartBadge.style.display = count > 0 ? 'inline-flex' : 'none';
  }
  const wishlistBadge = document.getElementById('wishlistBadge');
  if (wishlistBadge) {
    const count = getWishlistCount();
    wishlistBadge.textContent = toBnDigits(count);
    wishlistBadge.style.display = count > 0 ? 'inline-flex' : 'none';
  }
}

function toggleWishlistSlug(slug) {
  const id = normalizeSlug(slug);
  let list = getWishlist();
  if (list.includes(id)) list = list.filter(item => item !== id);
  else list.push(id);
  saveWishlist(list);
  return list.includes(id);
}

function setButtonWishlistState(button, saved) {
  if (!button) return;
  button.classList.toggle('saved', saved);
  button.innerHTML = saved ? '<i class="fa-solid fa-heart"></i> সেভড' : '<i class="fa-regular fa-heart"></i> উইশলিস্ট';
}

function getShippingCharge(settings, mode) {
  return mode === 'outside'
    ? Number(settings.shippingOutsideCharge || 0)
    : Number(settings.shippingInsideCharge || 0);
}

function buildWhatsAppMessage(settings, cart, shippingMode, customerNotes = '') {
  const shippingCharge = getShippingCharge(settings, shippingMode);
  const subtotal = cart.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);
  const grandTotal = subtotal + shippingCharge;

  const lines = [
    settings.whatsappMessage || 'Order request',
    '',
    `Items (${cart.length})`
  ];

  cart.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.name} x ${item.qty} = ${formatMoney(Number(item.price || 0) * Number(item.qty || 0))}`);
  });

  lines.push('');
  lines.push(`Subtotal: ${formatMoney(subtotal)}`);
  lines.push(`${shippingMode === 'outside' ? settings.shippingOutsideLabel : settings.shippingInsideLabel}: ${formatMoney(shippingCharge)}`);
  lines.push(`Total: ${formatMoney(grandTotal)}`);

  if (customerNotes) {
    lines.push('');
    lines.push(`Notes: ${customerNotes}`);
  }

  return lines.join('\n');
}

function openWhatsAppOrder(settings, cart, shippingMode, customerNotes = '') {
  const message = buildWhatsAppMessage(settings, cart, shippingMode, customerNotes);
  const url = `https://wa.me/${settings.whatsappInternational}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function productHasDiscount(product) {
  const price = Number(product.price);
  const original = Number(product.originalPrice);
  return Number.isFinite(original) && original > price;
}

function getProductPrimaryImage(product) {
  return product && typeof product.image === 'string' ? product.image : '';
}

function getProductGallery(product) {
  const gallery = Array.isArray(product?.gallery) ? product.gallery.filter(Boolean) : [];
  const main = getProductPrimaryImage(product);
  return main ? [main, ...gallery.filter(src => src !== main)] : gallery;
}

function buildBadgeHtml(product) {
  const badges = [];
  if (product && product.inStock === false) badges.push('<span class="badge stockout">স্টক নেই</span>');
  if (product && product.featured) badges.push('<span class="badge featured">ফিচার্ড</span>');
  if (product && product.bestSeller) badges.push('<span class="badge">বেস্ট সেলার</span>');
  if (product && product.newArrival) badges.push('<span class="badge new">নতুন এসেছে</span>');
  if (product && product.trending) badges.push('<span class="badge">ট্রেন্ডিং</span>');
  if (productHasDiscount(product)) badges.push('<span class="badge sale">ছাড়</span>');
  if (product && product.limited) badges.push('<span class="badge">লিমিটেড</span>');
  return badges.join('');
}

function setMeta(name, content, isProperty = false) {
  const selector = isProperty ? `meta[property="${name}"]` : `meta[name="${name}"]`;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    if (isProperty) el.setAttribute('property', name);
    else el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}