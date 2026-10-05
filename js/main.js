
/* GearFish Guide — main.js (cart, fonts, nav, toast) */
const PRODUCTS = {
  combo:        {name:"CoastMaster Pro 7' Rod & Reel Combo",        price:139.00, img:"assets/img/product-combo.jpg"},
  reel:         {name:"GoldCast 3000 Spinning Reel",                price:95.00,  img:"assets/img/product-reel.jpg"},
  starterkit:   {name:"Weekend Warrior Starter Kit (8 ft)",         price:99.00,  img:"assets/img/product-starterkit.jpg"},
  tacklebox:    {name:"ReelKeeper 3-Tray Tackle Box",               price:64.00,  img:"assets/img/product-tacklebox.jpg"},
  backpack:     {name:"ShoreWalker Tackle Backpack",                price:89.00,  img:"assets/img/product-backpack.jpg"},
  softplastics: {name:"Aussie Wriggler Paddle-Tail Soft Plastics (10 pk)", price:24.00, img:"assets/img/product-softplastics.jpg"},
  lurepack:     {name:"MasterPro Mixed Soft Plastics (100 pk)",     price:29.00,  img:"assets/img/product-lurepack.jpg"},
  sunglasses:   {name:"PolarView Pro Polarized Sunglasses Kit",     price:59.00,  img:"assets/img/product-sunglasses.jpg"}
};
const FREE_SHIP_MIN = 99;
const FLAT_SHIPPING = 9.95;

const money = n => "A$" + n.toFixed(2);
const getCart = () => { try { return JSON.parse(localStorage.getItem("gfg_cart")) || {}; } catch(e){ return {}; } };
const setCart = c => localStorage.setItem("gfg_cart", JSON.stringify(c));

function cartCount(){
  const c = getCart();
  return Object.values(c).reduce((a,b)=>a+b,0);
}
function updateCartBadge(){
  document.querySelectorAll(".cart-count").forEach(el => el.textContent = cartCount());
}
function addToCart(id, qty){
  const c = getCart();
  c[id] = (c[id]||0) + (qty||1);
  setCart(c); updateCartBadge(); toast("Added to your cart: " + PRODUCTS[id].name);
}
function toast(msg){
  let t = document.querySelector(".toast");
  if(!t){ t = document.createElement("div"); t.className="toast"; t.setAttribute("role","status"); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("show");
  clearTimeout(t._h); t._h = setTimeout(()=>t.classList.remove("show"), 2600);
}
function totals(){
  const c = getCart(); let sub = 0;
  for(const id in c){ if(PRODUCTS[id]) sub += PRODUCTS[id].price * c[id]; }
  const ship = sub === 0 ? 0 : (sub >= FREE_SHIP_MIN ? 0 : FLAT_SHIPPING);
  return { sub, ship, total: sub + ship };
}
function renderCheckoutSummary(){
  const box = document.getElementById("checkout-summary");
  if(!box) return;
  const c = getCart();
  const ids = Object.keys(c).filter(id => PRODUCTS[id] && c[id] > 0);
  if(ids.length === 0){
    box.innerHTML = '<div class="empty-cart"><h3>Your cart is empty</h3><p>Browse the shop to add some gear.</p><p><a class="btn btn-primary" href="shop.html">Go to the Shop</a></p></div>';
    const f = document.getElementById("checkout-form-wrap"); if(f) f.style.display = "none";
    return;
  }
  let html = "";
  ids.forEach(id => {
    const p = PRODUCTS[id];
    html += '<div class="order-line"><span>' + p.name + ' &times; ' + c[id] + '</span><span>' + money(p.price*c[id]) + '</span></div>';
  });
  const t = totals();
  html += '<div class="order-line"><span>Subtotal</span><span>' + money(t.sub) + '</span></div>';
  html += '<div class="order-line"><span>Shipping (Australia-wide)</span><span>' + (t.ship === 0 ? "FREE" : money(t.ship)) + '</span></div>';
  html += '<div class="order-total"><span>Total (incl. 10% GST)</span><span>' + money(t.total) + '</span></div>';
  box.innerHTML = html;
  const btn = document.getElementById("pay-amount"); if(btn) btn.textContent = "Pay " + money(t.total) + " securely";
}
function renderCartPage(){
  const box = document.getElementById("cart-page");
  if(!box) return;
  const c = getCart();
  const ids = Object.keys(c).filter(id => PRODUCTS[id] && c[id] > 0);
  if(ids.length === 0){
    box.innerHTML = '<div class="empty-cart"><h2>Your cart is empty</h2><p class="lead">Once you add gear from the shop, it will appear here ready for checkout.</p><p style="margin-top:1.5rem"><a class="btn btn-primary" href="shop.html">Browse the Shop</a></p></div>';
    return;
  }
  let rows = "";
  ids.forEach(id => {
    const p = PRODUCTS[id];
    rows += '<div class="order-line" style="align-items:center"><span><strong>' + p.name + '</strong><br><span class="meta">' + money(p.price) + ' each</span></span>' +
      '<span style="display:flex;align-items:center;gap:.6rem">' +
      '<button class="btn btn-secondary qty-btn" data-id="'+id+'" data-d="-1" style="min-height:44px;padding:.3em .8em;color:var(--navy);border-color:var(--navy)">&minus;</button>' +
      '<strong>' + c[id] + '</strong>' +
      '<button class="btn btn-secondary qty-btn" data-id="'+id+'" data-d="1" style="min-height:44px;padding:.3em .8em;color:var(--navy);border-color:var(--navy)">+</button>' +
      '<span style="min-width:6.5ch;text-align:right;font-weight:700">' + money(p.price*c[id]) + '</span></span></div>';
  });
  const t = totals();
  rows += '<div class="order-line"><span>Shipping</span><span>' + (t.ship===0?"FREE":money(t.ship)) + '</span></div>';
  rows += '<div class="order-total"><span>Total (incl. 10% GST)</span><span>' + money(t.total) + '</span></div>';
  rows += '<p style="margin-top:1.4rem"><a class="btn btn-primary btn-block" href="checkout.html">Proceed to Secure Checkout</a></p>';
  box.innerHTML = rows;
  box.querySelectorAll(".qty-btn").forEach(b => b.addEventListener("click", () => {
    const c2 = getCart(); const id = b.dataset.id;
    c2[id] = (c2[id]||0) + parseInt(b.dataset.d,10);
    if(c2[id] <= 0) delete c2[id];
    setCart(c2); updateCartBadge(); renderCartPage();
  }));
}
document.addEventListener("DOMContentLoaded", () => {
  // font size
  const saved = localStorage.getItem("gfg_font");
  if(saved) document.body.classList.add(saved);
  document.querySelectorAll(".font-controls button").forEach(btn => btn.addEventListener("click", () => {
    document.body.classList.remove("fs-normal","fs-large","fs-xlarge");
    document.body.classList.add(btn.dataset.fs);
    localStorage.setItem("gfg_font", btn.dataset.fs);
  }));
  // mobile nav
  const tgl = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");
  if(tgl) tgl.addEventListener("click", () => nav.classList.toggle("open"));
  // add to cart
  document.querySelectorAll("[data-add]").forEach(btn => btn.addEventListener("click", e => {
    e.preventDefault(); addToCart(btn.dataset.add, 1);
  }));
  updateCartBadge(); renderCheckoutSummary(); renderCartPage();
  document.getElementById("year").textContent = new Date().getFullYear();
});
