/* ============================================
   TIENDA BEBITOS - Código Compartido
   Datos, utilidades y carrito
   ============================================ */

// ============================================
// DATOS DE PRODUCTOS POR DEFECTO
// ============================================
const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "Andador para Bebé",
    price: 0,
    originalPrice: null,
    category: "accesorios",
    emoji: "🚶",
    mainImage: "Fotos/Andador/Principal.jpg",
    variants: [
      { color: "Azul Celeste", image: "Fotos/Andador/azul celeste.jpg" },
      { color: "Azul Cielo", image: "Fotos/Andador/azul-cielo.jpg" },
      { color: "Rojo", image: "Fotos/Andador/rojo.jpg" },
    ],
    badge: null,
    isNew: true,
    inStock: true,
  },
  {
    id: 2,
    name: "Bañera para Bebé Clásica",
    price: 0,
    originalPrice: null,
    category: "accesorios",
    emoji: "🛁",
    mainImage: "Fotos/Bañera 01/principal.jpg",
    variants: [
      { color: "Azul", image: "Fotos/Bañera 01/azul.jpg" },
      { color: "Beige", image: "Fotos/Bañera 01/beige.jpg" },
      { color: "Rosado", image: "Fotos/Bañera 01/rosado.jpg" },
    ],
    badge: null,
    isNew: true,
    inStock: true,
  },
  {
    id: 3,
    name: "Bañera para Bebé Premium",
    price: 0,
    originalPrice: null,
    category: "accesorios",
    emoji: "🛁",
    mainImage: "Fotos/Bañera 02/principal.jpg",
    variants: [
      { color: "Azul Cielo", image: "Fotos/Bañera 02/azul cielo.jpg" },
      { color: "Blanco", image: "Fotos/Bañera 02/blanco.jpg" },
      { color: "Gris", image: "Fotos/Bañera 02/gris.jpg" },
      { color: "Rosado Oscuro", image: "Fotos/Bañera 02/rosado oscuro.jpg" },
      { color: "Rosado", image: "Fotos/Bañera 02/rosado.jpg" },
    ],
    badge: null,
    isNew: true,
    inStock: true,
  },
  {
    id: 4,
    name: "Set de Biberones",
    price: 0,
    originalPrice: null,
    category: "accesorios",
    emoji: "🍼",
    mainImage:
      "Fotos/biberones/649549773_18386870440081436_6290690589335686914_n..jpg",
    gallery: [
      {
        label: "Vista 2",
        image:
          "Fotos/biberones/650500061_18386870431081436_4087927871747463084_n..jpg",
      },
    ],
    badge: null,
    isNew: true,
    inStock: true,
  },
  {
    id: 5,
    name: "Silla de Alimentación para Bebé",
    price: 0,
    originalPrice: null,
    category: "accesorios",
    emoji: "🪑",
    mainImage:
      "Fotos/Sillas Para Alimentar bebe/670451003_18392102683081436_9077563751792878795_n. (1).jpg",
    variants: [],
    badge: null,
    isNew: true,
    inStock: true,
  },
  {
    id: 6,
    name: "Traje de Spiderman Niño",
    price: 0,
    originalPrice: null,
    category: "ropa",
    emoji: "🕷️",
    mainImage: "Fotos/Traje de Spiderman - niño/Principal.jpg",
    gallery: [
      { label: "Gorra", image: "Fotos/Traje de Spiderman - niño/gorra.jpg" },
      {
        label: "Pantalón",
        image: "Fotos/Traje de Spiderman - niño/pantalon.jpg",
      },
      { label: "Suéter", image: "Fotos/Traje de Spiderman - niño/suetel.jpg" },
    ],
    badge: null,
    isNew: true,
    inStock: true,
  },
];

// ============================================
// CARGA DE PRODUCTOS DESDE LOCALSTORAGE
// ============================================
function loadProducts() {
  const stored = localStorage.getItem("bebitos_products");
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p) => ({ inStock: true, ...p }));
      }
    } catch (e) {
      return [...DEFAULT_PRODUCTS];
    }
  }
  return [...DEFAULT_PRODUCTS];
}

// ============================================
// UTILIDADES
// ============================================
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function escapeAttr(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ============================================
// HELPERS DE IMÁGENES
// ============================================
function getProductImages(product) {
  const images = [];
  if (product.mainImage)
    images.push({ label: "Principal", image: product.mainImage });
  if (product.variants && product.variants.length > 0) {
    product.variants.forEach((v) =>
      images.push({ label: v.color, image: v.image }),
    );
  }
  if (product.gallery && product.gallery.length > 0) {
    product.gallery.forEach((g) =>
      images.push({ label: g.label, image: g.image }),
    );
  }
  return images;
}

// ============================================
// CARRITO (usado por index.html y producto.html)
// ============================================
function setupCartUI() {
  const cartBtn = document.getElementById("cart-btn");
  const closeCart = document.getElementById("close-cart");
  const cartOverlay = document.getElementById("cart-overlay");
  const clearCartBtn = document.getElementById("clear-cart");

  if (cartBtn) cartBtn.addEventListener("click", openCart);
  if (closeCart) closeCart.addEventListener("click", closeCartSidebar);
  if (cartOverlay) cartOverlay.addEventListener("click", closeCartSidebar);
  if (clearCartBtn) clearCartBtn.addEventListener("click", clearCart);
}

function openCart() {
  const sidebar = document.getElementById("cart-sidebar");
  const overlay = document.getElementById("cart-overlay");
  if (sidebar) sidebar.classList.remove("translate-x-full");
  if (overlay) {
    overlay.classList.remove("hidden");
    setTimeout(() => overlay.classList.remove("opacity-0"), 10);
  }
  document.body.style.overflow = "hidden";
}

function closeCartSidebar() {
  const sidebar = document.getElementById("cart-sidebar");
  const overlay = document.getElementById("cart-overlay");
  if (sidebar) sidebar.classList.add("translate-x-full");
  if (overlay) {
    overlay.classList.add("opacity-0");
    setTimeout(() => overlay.classList.add("hidden"), 300);
  }
  document.body.style.overflow = "";
}

function addToCart(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const existing = cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveCart();
  updateCartUI();
  showToast(`${product.name} agregado al carrito`);

  const cartCount = document.getElementById("cart-count");
  if (cartCount) {
    cartCount.classList.add("animate-cart-bounce");
    setTimeout(() => cartCount.classList.remove("animate-cart-bounce"), 400);
  }
}

function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  saveCart();
  updateCartUI();
}

function updateQuantity(productId, delta) {
  const item = cart.find((i) => i.id === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  saveCart();
  updateCartUI();
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartUI();
  showToast("Carrito vaciado");
}

function saveCart() {
  localStorage.setItem("bebitos_cart", JSON.stringify(cart));
}

function updateCartUI() {
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const cartCount = document.getElementById("cart-count");
  if (cartCount) {
    cartCount.textContent = totalItems;
    cartCount.classList.toggle("hidden", totalItems === 0);
  }

  const sidebarCount = document.getElementById("cart-sidebar-count");
  if (sidebarCount) sidebarCount.textContent = totalItems;

  const cartTotal = document.getElementById("cart-total");
  if (cartTotal) cartTotal.textContent = `RD$${totalPrice.toLocaleString()}`;

  const cartEmpty = document.getElementById("cart-empty");
  const cartItemsList = document.getElementById("cart-items-list");
  const cartFooter = document.getElementById("cart-footer");

  if (cart.length === 0) {
    if (cartEmpty) cartEmpty.classList.remove("hidden");
    if (cartItemsList) cartItemsList.classList.add("hidden");
    if (cartFooter) cartFooter.classList.add("hidden");
  } else {
    if (cartEmpty) cartEmpty.classList.add("hidden");
    if (cartItemsList) {
      cartItemsList.classList.remove("hidden");
      cartItemsList.innerHTML = cart
        .map((item) => {
          const thumb = item.mainImage
            ? `<img src="${escapeAttr(item.mainImage)}" alt="${escapeAttr(item.name)}" class="w-full h-full object-contain rounded-lg p-1" />`
            : `<span class="text-2xl">${item.emoji}</span>`;
          const priceLabel =
            item.price > 0 ? `RD$${item.price.toLocaleString()}` : "Consultar";
          const subtotalLabel =
            item.price > 0
              ? `RD$${(item.price * item.quantity).toLocaleString()}`
              : "Consultar";

          return `
        <div class="cart-item">
          <div class="w-14 h-14 bg-white rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100">
            ${thumb}
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-semibold text-gray-800 text-sm truncate">${escapeHtml(item.name)}</h4>
            <p class="text-primary font-bold text-sm mt-0.5">${priceLabel}</p>
            <div class="flex items-center gap-2 mt-1.5">
              <button onclick="updateQuantity(${item.id}, -1)" class="w-7 h-7 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-sm transition-colors">−</button>
              <span class="text-sm font-semibold text-gray-700 w-6 text-center">${item.quantity}</span>
              <button onclick="updateQuantity(${item.id}, 1)" class="w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary font-bold text-sm transition-colors">+</button>
            </div>
          </div>
          <div class="flex flex-col items-end justify-between">
            <button onclick="removeFromCart(${item.id})" class="text-gray-400 hover:text-red-500 transition-colors p-1" aria-label="Eliminar">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
            <span class="font-bold text-gray-800 text-sm">${subtotalLabel}</span>
          </div>
        </div>`;
        })
        .join("");
    }
    if (cartFooter) cartFooter.classList.remove("hidden");
  }

  updateWhatsAppCheckout(totalPrice);
}

function updateWhatsAppCheckout(totalPrice) {
  const checkoutBtn = document.getElementById("checkout-whatsapp");
  if (!checkoutBtn || cart.length === 0) return;

  const itemsList = cart
    .map((item) => {
      const priceText =
        item.price > 0
          ? `RD$${(item.price * item.quantity).toLocaleString()}`
          : "(Consultar precio)";
      return `• ${item.name} x${item.quantity} - ${priceText}`;
    })
    .join("\n");

  const totalText =
    totalPrice > 0
      ? `*Total: RD$${totalPrice.toLocaleString()}*`
      : "*Consultar precios*";

  const message = encodeURIComponent(
    `¡Hola! Quiero hacer un pedido:\n\n${itemsList}\n\n${totalText}\n\n¿Está disponible?`,
  );

  checkoutBtn.href = `https://wa.me/18095289181?text=${message}`;
}

// ============================================
// TOAST
// ============================================
function showToast(message) {
  const existing = document.querySelector(".toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<span>✅</span> ${escapeHtml(message)}`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 2500);
}
