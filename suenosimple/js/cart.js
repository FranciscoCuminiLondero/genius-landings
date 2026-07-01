window.cart = window.cart || [];

function addToCart(id, name, price, before, color) {
  const existing = window.cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    window.cart.push({ id, name, price, before, color, qty: 1 });
  }
  renderCart();
  openCart();
  showToast(name + ' agregado al carrito');
}

function removeFromCart(id) {
  window.cart = window.cart.filter(i => i.id !== id);
  renderCart();
}

function changeQty(id, delta) {
  const item = window.cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else renderCart();
}

function renderCart() {
  const body   = document.getElementById('cart-body');
  const footer = document.getElementById('cart-footer');
  const empty  = document.getElementById('cart-empty');
  if (!body || !footer) return;

  const count   = window.cart.reduce((a, i) => a + i.qty, 0);
  const countEl = document.getElementById('sticky-count');
  if (countEl) {
    countEl.textContent = count;
    countEl.classList.toggle('visible', count > 0);
  }

  body.innerHTML = '';

  if (window.cart.length === 0) {
    if (empty) empty.style.display = 'block';
    footer.style.display = 'none';
    return;
  }

  if (empty) empty.style.display = 'none';
  footer.style.display = 'block';

  let total = 0, totalSaved = 0;

  window.cart.forEach(item => {
    total      += item.price * item.qty;
    totalSaved += (item.before - item.price) * item.qty;

    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <div class="cart-item-img" style="background:${item.color}20;">
        <div style="width:100%;height:30px;background:${item.color};border-radius:4px;
                    display:flex;align-items:center;justify-content:center;">
          <span style="font-size:9px;font-weight:700;color:white;letter-spacing:0.05em;">
            ${item.name.split(' ')[0].toUpperCase()}
          </span>
        </div>
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${(item.price * item.qty).toLocaleString('es-AR')}</div>
      </div>
      <div class="cart-qty">
        <button onclick="changeQty(${item.id}, -1)">−</button>
        <span>${item.qty}</span>
        <button onclick="changeQty(${item.id}, +1)">+</button>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${item.id})">✕</button>
    `;
    body.appendChild(el);
  });

  document.getElementById('cart-total-price').textContent  = '$' + total.toLocaleString('es-AR');
  document.getElementById('cart-savings-info').textContent = 'Ahorrás $' + totalSaved.toLocaleString('es-AR') + ' con el 50% OFF';
}

function openCart() {
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function initCalc() {
  const precioRange = document.getElementById('precio-range');
  const cuotasRange = document.getElementById('cuotas-range');
  if (!precioRange || !cuotasRange) return;

  function updateCalc() {
    const precio = parseInt(precioRange.value);
    const cuotas = parseInt(cuotasRange.value);
    const final  = Math.round(precio * 0.5);
    const cuota  = Math.round(final / cuotas);

    document.getElementById('precio-display').textContent = '$' + precio.toLocaleString('es-AR');
    document.getElementById('cuotas-display').textContent = cuotas === 1 ? '1 pago' : cuotas + ' cuotas';
    document.getElementById('savings-amount').textContent = '$' + final.toLocaleString('es-AR');
    document.getElementById('final-price').textContent    = '$' + final.toLocaleString('es-AR');
    document.getElementById('cuota-price').textContent    = '$' + cuota.toLocaleString('es-AR');
  }

  precioRange.addEventListener('input', updateCalc);
  cuotasRange.addEventListener('input', updateCalc);
  updateCalc();
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  document.getElementById('toast-msg').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  initCalc();
  renderCart();
});