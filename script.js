const WHATSAPP_NUMBER = "966558683193";

const PRODUCTS = [
  {
    id: 1,
    category: "فواصل كتب",
    name: "فاصل زهرة صوفية",
    description: "فاصل كتاب صوفي",
    price: null,
    image: "https://raw.githubusercontent.com/Snoma4/nasj-store/main/product-1.jpg",
    detailImage: "https://raw.githubusercontent.com/Snoma4/nasj-store/main/product-1-detail.jpg"
  }
];

const state = {
  cart: JSON.parse(localStorage.getItem("nasj-cart") || "[]")
};

const $ = (selector) => document.querySelector(selector);

function money(value) {
  return value == null ? "يُحدد" : `${value} ريال`;
}

function productById(id) {
  return PRODUCTS.find(p => p.id === id);
}

function saveCart() {
  localStorage.setItem("nasj-cart", JSON.stringify(state.cart));
}

function whatsappLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

let activeCategory = "الكل";

function renderCategoryButtons() {
  const categories = [
    "الكل",
    "فواصل كتب",
    "تعليقات حقائب ومفاتيح",
    "منسوجات أخرى"
  ];

  const holder = $("#categoryFilters");
  if (!holder) return;

  holder.innerHTML = categories.map(category => `
    <button
      class="category-filter ${category === activeCategory ? "active" : ""}"
      onclick="setCategory('${category}')">
      ${category}
    </button>
  `).join("");
}

function setCategory(category) {
  activeCategory = category;
  renderCategoryButtons();
  renderProducts();
}

function renderProducts() {
  const grid = $("#productsGrid");
  if (!grid) return;

  const visible = activeCategory === "الكل"
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === activeCategory);

  grid.innerHTML = visible.map(p => `
    <article class="product-card">
      <div class="product-image">
        <img src="${p.image}" alt="${p.name}">
      </div>

      <div class="product-info">
        <span class="product-category">${p.category}</span>
        <h3>${p.name}</h3>
        <p>${p.description}</p>

        <div class="product-bottom">
          <span class="price">${money(p.price)}</span>
          <button class="add-btn" onclick="addToCart(${p.id})">
            أضيفي للسلة 🛒
          </button>
        </div>
      </div>
    </article>
  `).join("");
}

function addToCart(id) {
  const item = state.cart.find(x => x.id === id);

  if (item) item.qty++;
  else state.cart.push({ id, qty: 1 });

  saveCart();
  renderCart();
  openCart();
}

function changeQty(id, amount) {
  const item = state.cart.find(x => x.id === id);
  if (!item) return;

  item.qty += amount;

  if (item.qty <= 0) {
    state.cart = state.cart.filter(x => x.id !== id);
  }

  saveCart();
  renderCart();
}

function removeItem(id) {
  state.cart = state.cart.filter(x => x.id !== id);
  saveCart();
  renderCart();
}

function renderCart() {
  const count = state.cart.reduce((sum, item) => sum + item.qty, 0);

  if ($("#cartCount")) {
    $("#cartCount").textContent = count;
  }

  const container = $("#cartItems");
  if (!container) return;

  if (!state.cart.length) {
    container.innerHTML = `
      <div class="empty-cart">
        <div>🧶</div>
        <strong>السلة فاضية حاليًا</strong>
        <p>اختاري قطعة وبتظهر هنا ♡</p>
      </div>
    `;
  } else {
    container.innerHTML = state.cart.map(item => {
      const p = productById(item.id);

      return `
        <div class="cart-item">
          <img src="${p.image}" alt="${p.name}">

          <div>
            <h4>${p.name}</h4>
            <div class="item-price">${money(p.price)}</div>

            <div class="qty">
              <button onclick="changeQty(${p.id}, 1)">+</button>
              <span>${item.qty}</span>
              <button onclick="changeQty(${p.id}, -1)">−</button>
            </div>
          </div>

          <button class="remove" onclick="removeItem(${p.id})">
            حذف
          </button>
        </div>
      `;
    }).join("");
  }

  const total = state.cart.reduce((sum, item) => {
    const p = productById(item.id);
    return sum + (p.price || 0) * item.qty;
  }, 0);

  if ($("#cartTotal")) {
    $("#cartTotal").textContent = "يُحدد";
  }

  const lines = state.cart.map(item => {
    const p = productById(item.id);
    return `• ${p.name} × ${item.qty} — ${money(p.price)}`;
  });

  const message = state.cart.length
    ? `مرحبًا نَسْج 🧶
أرغب بطلب:
${lines.join("\n")}

الإجمالي: يُحدد
الاستلام: من المدرسة`
    : "مرحبًا نَسْج 🧶 أرغب بالاستفسار عن المنتجات.";

  if ($("#cartWhatsapp")) {
    $("#cartWhatsapp").href = whatsappLink(message);
  }

  if ($("#heroWhatsapp")) {
    $("#heroWhatsapp").href = whatsappLink(
      "مرحبًا نَسْج 🧶 أرغب بالاستفسار عن المنتجات."
    );
  }

  if ($("#customWhatsapp")) {
    $("#customWhatsapp").href = whatsappLink(
      "مرحبًا نَسْج 🧶 أرغب بطلب تصميم خاص."
    );
  }
}

function openCart() {
  $("#cartDrawer")?.classList.add("open");

  if ($("#overlay")) {
    $("#overlay").hidden = false;
  }
}

function closeCart() {
  $("#cartDrawer")?.classList.remove("open");

  if ($("#overlay")) {
    $("#overlay").hidden = true;
  }
}

$("#openCart")?.addEventListener("click", openCart);
$("#closeCart")?.addEventListener("click", closeCart);
$("#overlay")?.addEventListener("click", closeCart);

$("#clearCart")?.addEventListener("click", () => {
  state.cart = [];
  saveCart();
  renderCart();
});

renderCategoryButtons();
renderProducts();
renderCart();
