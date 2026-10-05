
/* GearFish Guide — checkout.js
   Demonstration payment gateway. No real charge is processed.
   Test card: 4242 4242 4242 4242, any future expiry, any 3-digit CVC. */
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("checkout-form");
  if(!form) return;

  const cardInput  = document.getElementById("cc-number");
  const expInput   = document.getElementById("cc-expiry");
  const cvcInput   = document.getElementById("cc-cvc");

  cardInput.addEventListener("input", () => {
    let v = cardInput.value.replace(/\D/g,"").slice(0,16);
    cardInput.value = v.replace(/(.{4})/g,"$1 ").trim();
  });
  expInput.addEventListener("input", () => {
    let v = expInput.value.replace(/\D/g,"").slice(0,4);
    expInput.value = v.length > 2 ? v.slice(0,2) + "/" + v.slice(2) : v;
  });
  cvcInput.addEventListener("input", () => {
    cvcInput.value = cvcInput.value.replace(/\D/g,"").slice(0,4);
  });

  function luhn(num){
    let sum = 0, alt = false;
    for(let i = num.length - 1; i >= 0; i--){
      let d = parseInt(num[i],10);
      if(alt){ d *= 2; if(d > 9) d -= 9; }
      sum += d; alt = !alt;
    }
    return sum % 10 === 0;
  }
  function setErr(id, msg){
    const el = document.getElementById(id + "-error");
    if(!el) return;
    if(msg){ el.textContent = msg; el.classList.add("show"); }
    else el.classList.remove("show");
    return !msg;
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    const email  = document.getElementById("email").value.trim();
    const name   = document.getElementById("name").value.trim();
    const addr   = document.getElementById("address").value.trim();
    const city   = document.getElementById("city").value.trim();
    const state  = document.getElementById("state").value;
    const pcode  = document.getElementById("postcode").value.trim();
    const card   = cardInput.value.replace(/\s/g,"");
    const exp    = expInput.value;
    const cvc    = cvcInput.value;

    let ok = true;
    ok = setErr("email",   /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? "" : "Please enter a valid email address.") && ok;
    ok = setErr("name",    name.length >= 2 ? "" : "Please enter the cardholder name.") && ok;
    ok = setErr("address", addr.length >= 5 ? "" : "Please enter your street address.") && ok;
    ok = setErr("city",    city.length >= 2 ? "" : "Please enter your suburb or town.") && ok;
    ok = setErr("state",   state ? "" : "Please choose your state or territory.") && ok;
    ok = setErr("postcode",/^\d{4}$/.test(pcode) ? "" : "Australian postcodes have 4 digits.") && ok;
    ok = setErr("cc-number", (card.length === 16 && luhn(card)) ? "" : "Please enter a valid 16-digit card number.") && ok;

    let expOk = false;
    const m = exp.match(/^(\d{2})\/(\d{2})$/);
    if(m){
      const mo = +m[1], yr = 2000 + +m[2];
      const now = new Date();
      expOk = mo >= 1 && mo <= 12 && (yr > now.getFullYear() || (yr === now.getFullYear() && mo >= now.getMonth()+1));
    }
    ok = setErr("cc-expiry", expOk ? "" : "Use MM/YY with a future date.") && ok;
    ok = setErr("cc-cvc",    /^\d{3,4}$/.test(cvc) ? "" : "Enter the 3–4 digit security code.") && ok;

    if(!ok){
      const firstErr = document.querySelector(".field-error.show");
      if(firstErr) firstErr.scrollIntoView({behavior:"smooth", block:"center"});
      return;
    }

    const btn = document.getElementById("pay-btn");
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" aria-hidden="true"></span>Processing payment…';

    setTimeout(() => {
      const orderNo = "GFG-" + Math.floor(100000 + Math.random()*900000);
      const t = (function(){ const c = JSON.parse(localStorage.getItem("gfg_cart")||"{}"); let s=0;
        const P = {"combo":139,"reel":95,"starterkit":99,"tacklebox":64,"backpack":89,"softplastics":24,"lurepack":29,"sunglasses":59};
        for(const k in c) if(P[k]) s += P[k]*c[k];
        const sh = s===0?0:(s>=99?0:9.95); return {sub:s, ship:sh, total:s+sh}; })();
      document.getElementById("checkout-area").innerHTML =
        '<div class="panel" style="text-align:center;padding:3rem 2rem">' +
        '<div style="font-size:3rem" aria-hidden="true">🎣</div>' +
        '<h2>Thank you, ' + name.split(" ")[0] + '! Your order is confirmed.</h2>' +
        '<p class="lead">Order number: <strong>' + orderNo + '</strong></p>' +
        '<div class="success-box" style="text-align:left;max-width:520px;margin:1.5rem auto">' +
        '<p style="margin-bottom:.3rem"><strong>Confirmation sent to:</strong> ' + email + '</p>' +
        '<p style="margin-bottom:.3rem"><strong>Deliver to:</strong> ' + addr + ', ' + city + ' ' + state + ' ' + pcode + '</p>' +
        '<p style="margin-bottom:.3rem"><strong>Amount charged (demo):</strong> A$' + t.total.toFixed(2) + ' — incl. 10% GST</p>' +
        '<p style="margin-bottom:0"><strong>Estimated delivery:</strong> 3–7 business days, Australia Post.</p>' +
        '</div>' +
        '<p class="meta">This is a demonstration checkout. No real payment was processed and no card was charged.</p>' +
        '<p style="margin-top:1.5rem"><a class="btn btn-primary" href="index.html">Back to Home</a> <a class="btn btn-secondary" style="color:var(--navy);border-color:var(--navy)" href="blog.html">Read Fishing Guides</a></p>' +
        '</div>';
      localStorage.removeItem("gfg_cart");
      document.querySelectorAll(".cart-count").forEach(el => el.textContent = "0");
      window.scrollTo({top:0, behavior:"smooth"});
    }, 1800);
  });
});
