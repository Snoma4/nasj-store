const WHATSAPP_NUMBER = "966558683193";

const PRODUCTS = [
  {
    id: 1,
    category: "فواصل كتب",
    name: "فاصل زهرة صوفية",
    description: "فاصل كتاب صوفي",
    price: null,
    image: "product-1.jpg",
    detailImage: "product-1-detail.jpg"
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

  const visible =
    activeCategory === "الكل"
      ? PRODUCTS
      : PRODUCTS.filter(p => p.category === activeCategory);

  if (!visible.length) {
    grid.innerHTML = `
      <div class="empty-cart">
        لا توجد منتجات في هذا القسم حاليًا 🧶
      </div>
    `;
    return;
  }

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

          <button
            class="add-btn"
            onclick="addToCart(${p.id})">
            أضيفي للسلة 🛒
          </button>
        </div>
      </div>
    </article>
  `).join("");
}

function addToCart(id) {
  const item = state.cart.find(x => x.id === id);

  if (item) {
    item.qty++;
  } else {
    state.cart.push({
      id: id,
      qty: 1
    });
  }

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
  const count = state.cart.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  const cartCount = $("#cartCount");

  if (cartCount) {
    cartCount.textContent = count;
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

            <div class="item-price">
              ${money(p.price)}
            </div>

            <div class="qty">
              <button onclick="changeQty(${p.id}, 1)">+</button>
              <span>${item.qty}</span>
              <button onclick="changeQty(${p.id}, -1)">−</button>
            </div>
          </div>

          <button
            class="remove"
            onclick="removeItem(${p.id})">
            حذف
          </button>
        </div>
      `;
    }).join("");
  }

  const allPriced =
    state.cart.length > 0 &&
    state.cart.every(item => {
      const p = productById(item.id);
      return p && p.price != null;
    });

  const total = state.cart.reduce((sum, item) => {
    const p = productById(item.id);
    return sum + (p.price || 0) * item.qty;
  }, 0);

  const totalElement = $("#cartTotal");

  if (totalElement) {
    totalElement.textContent =
      allPriced ? `${total} ريال` : "يُحدد";
  }

  const lines = state.cart.map(item => {
    const p = productById(item.id);
    return `• ${p.name} × ${item.qty} — ${money(p.price)}`;
  });

  const message = state.cart.length
    ? `مرحبًا نَسْج 🧶
أرغب بطلب:
${lines.join("\n")}

الإجمالي: ${allPriced ? total + " ريال" : "يُحدد"}
الاستلام: من المدرسة`
    : "مرحبًا نَسْج 🧶 أرغب بالاستفسار عن المنتجات.";

  const cartWhatsapp = $("#cartWhatsapp");

  if (cartWhatsapp) {
    cartWhatsapp.href = whatsappLink(message);
  }

  const heroWhatsapp = $("#heroWhatsapp");

  if (heroWhatsapp) {
    heroWhatsapp.href = whatsappLink(
      "مرحبًا نَسْج 🧶 أرغب بالاستفسار عن المنتجات."
    );
  }

  const customWhatsapp = $("#customWhatsapp");

  if (customWhatsapp) {
    customWhatsapp.href = whatsappLink(
      "مرحبًا نَسْج 🧶 أرغب بطلب تصميم خاص. فكرتي هي: "
    );
  }
}

function openCart() {
  const drawer = $("#cartDrawer");
  const overlay = $("#overlay");

  if (drawer) {
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
  }

  if (overlay) {
    overlay.hidden = false;
  }

  document.body.style.overflow = "hidden";
}

function closeCart() {
  const drawer = $("#cartDrawer");
  const overlay = $("#overlay");

  if (drawer) {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
  }

  if (overlay) {
    overlay.hidden = true;
  }

  document.body.style.overflow = "";
}

const openCartButton = $("#openCart");
const closeCartButton = $("#closeCart");
const overlay = $("#overlay");
const clearCartButton = $("#clearCart");

if (openCartButton) {
  openCartButton.addEventListener("click", openCart);
}

if (closeCartButton) {
  closeCartButton.addEventListener("click", closeCart);
}

if (overlay) {
  overlay.addEventListener("click", closeCart);
}

if (clearCartButton) {
  clearCartButton.addEventListener("click", () => {
    state.cart = [];
    saveCart();
    renderCart();
  });
}

renderCategoryButtons();
renderProducts();
renderCart();
