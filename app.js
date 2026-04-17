/* ============================================
   TIENDA BEBITOS - E-Commerce (Página Principal)
   Requiere: shared.js
   ============================================ */

let products = loadProducts();

// ============================================
// ESTADO
// ============================================
let cart = JSON.parse(localStorage.getItem("bebitos_cart") || "[]");
let currentFilter = "todos";
let currentSearch = "";
let currentSort = "default";

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  initLucideIcons();
  renderProducts();
  setupFilters();
  setupSearch();
  setupSort();
  setupCartUI();
  updateCartUI();
});

function initLucideIcons() {
  if (typeof lucide !== "undefined") lucide.createIcons();
}

// ============================================
// HELPERS DE IMÁGENES
// ============================================
function switchVariant(productId, index) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  const allImages = getProductImages(product);
  if (index < 0 || index >= allImages.length) return;

  const img = document.getElementById(`card-img-${productId}`);
  if (img) img.src = allImages[index].image;

  const card = document.getElementById(`card-${productId}`);
  if (card) {
    card.querySelectorAll(".variant-thumb").forEach((btn, i) => {
      btn.classList.toggle("active", i === index);
    });
  }
}

// ============================================
// PRODUCTOS: FILTRADO, BÚSQUEDA, ORDEN
// ============================================
function getFilteredProducts() {
  let list = [...products];

  if (currentFilter !== "todos") {
    list = list.filter((p) => p.category === currentFilter);
  }

  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q),
    );
  }

  switch (currentSort) {
    case "price-asc":
      list.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      list.sort((a, b) => b.price - a.price);
      break;
    case "name-asc":
      list.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case "newest":
      list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
      break;
  }

  return list;
}

function renderProducts() {
  const grid = document.getElementById("products-grid");
  const noResults = document.getElementById("no-results");
  const countEl = document.getElementById("products-count");
  const titleEl = document.getElementById("products-title");
  if (!grid) return;

  const filtered = getFilteredProducts();

  if (countEl) {
    countEl.textContent = `${filtered.length} resultado${filtered.length !== 1 ? "s" : ""}`;
  }

  if (titleEl) {
    const catNames = {
      todos: "Todos los productos",
      ropa: "Ropa",
      calzado: "Calzado",
      juguetes: "Juguetes",
      accesorios: "Accesorios",
    };
    titleEl.textContent = currentSearch
      ? `Resultados para "${currentSearch}"`
      : catNames[currentFilter] || "Todos los productos";
  }

  if (filtered.length === 0) {
    grid.innerHTML = "";
    if (noResults) noResults.classList.remove("hidden");
    return;
  }
  if (noResults) noResults.classList.add("hidden");

  grid.innerHTML = filtered
    .map((product) => {
      const hasImage = !!product.mainImage;
      const allImages = getProductImages(product);
      const hasMultipleImages = allImages.length > 1;
      const discount = product.originalPrice
        ? Math.round(
            ((product.originalPrice - product.price) / product.originalPrice) *
              100,
          )
        : 0;

      const isOutOfStock = product.inStock === false;

      const imageArea = hasImage
        ? `<img id="card-img-${product.id}" src="${escapeAttr(product.mainImage)}" alt="${escapeAttr(product.name)}" class="w-full h-full object-contain p-2 ${isOutOfStock ? "grayscale opacity-50" : ""}" loading="lazy" />`
        : `<span class="text-5xl sm:text-6xl ${isOutOfStock ? "grayscale opacity-50" : ""}">${product.emoji}</span>`;

      const variantThumbs = hasMultipleImages
        ? `<div class="flex gap-1 mt-2 flex-wrap variant-strip">
          ${allImages
            .map(
              (v, i) => `
            <button type="button" onclick="event.stopPropagation(); switchVariant(${product.id}, ${i})" class="variant-thumb ${i === 0 ? "active" : ""}" title="${escapeAttr(v.label)}">
              <img src="${escapeAttr(v.image)}" alt="${escapeAttr(v.label)}" class="w-7 h-7 rounded object-cover" loading="lazy" />
            </button>
          `,
            )
            .join("")}
        </div>`
        : "";

      const priceDisplay = isOutOfStock
        ? `<span class="text-sm text-red-500 font-semibold">Agotado</span>`
        : product.price > 0
          ? `<span class="font-bold text-base text-gray-900">RD$${product.price.toLocaleString()}</span>
         ${product.originalPrice ? `<span class="text-[11px] text-gray-400 line-through">RD$${product.originalPrice.toLocaleString()}</span>` : ""}
         ${discount > 0 ? `<span class="text-[11px] text-green-600 font-bold">-${discount}%</span>` : ""}`
          : `<span class="text-sm text-accent-dark font-semibold">Consultar precio</span>`;

      const cartButton = isOutOfStock
        ? `<button disabled class="mt-2.5 w-full py-2 bg-gray-100 text-gray-400 rounded-lg text-xs font-semibold cursor-not-allowed">
          Agotado
        </button>`
        : `<button onclick="event.stopPropagation(); addToCart(${product.id})" class="mt-2.5 w-full py-2 bg-primary/10 text-primary rounded-lg text-xs font-semibold hover:bg-primary hover:text-white transition-all duration-200">
          Agregar al carrito
        </button>`;

      return `
    <div class="product-card ${isOutOfStock ? "opacity-75" : ""}" id="card-${product.id}">
      <a href="producto.html?id=${product.id}" class="block relative aspect-square bg-white flex items-center justify-center overflow-hidden">
        ${isOutOfStock ? '<span class="badge-offer" style="background: linear-gradient(135deg, #9ca3af, #6b7280);">Agotado</span>' : product.badge ? `<span class="badge-offer">${product.badge}</span>` : ""}
        ${product.isNew && !isOutOfStock ? '<span class="badge-new">Nuevo</span>' : ""}
        ${imageArea}
      </a>
      <div class="p-3">
        <a href="producto.html?id=${product.id}" class="block">
          <p class="text-[11px] text-gray-400 uppercase tracking-wide">${product.category}</p>
          <h3 class="font-semibold ${isOutOfStock ? "text-gray-400" : "text-gray-800"} text-sm leading-snug mt-0.5 line-clamp-2 hover:text-primary transition-colors">${escapeHtml(product.name)}</h3>
        </a>
        ${variantThumbs}
        <div class="flex items-baseline gap-1.5 mt-2">
          ${priceDisplay}
        </div>
        ${cartButton}
      </div>
    </div>`;
    })
    .join("");
}

// ============================================
// FILTROS
// ============================================
function setupFilters() {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderProducts();
    });
  });
}

// ============================================
// BÚSQUEDA
// ============================================
function setupSearch() {
  const searchBar = document.getElementById("search-bar");
  const searchBtn = document.getElementById("search-btn");
  if (!searchBar) return;

  let debounce;
  searchBar.addEventListener("input", () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      currentSearch = searchBar.value.trim();
      renderProducts();
    }, 300);
  });

  searchBar.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      clearTimeout(debounce);
      currentSearch = searchBar.value.trim();
      renderProducts();
    }
  });

  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      clearTimeout(debounce);
      currentSearch = searchBar.value.trim();
      renderProducts();
    });
  }
}

function clearSearch() {
  const searchBar = document.getElementById("search-bar");
  if (searchBar) searchBar.value = "";
  currentSearch = "";
  currentFilter = "todos";
  document
    .querySelectorAll(".filter-btn")
    .forEach((b) => b.classList.remove("active"));
  const allBtn = document.querySelector('[data-filter="todos"]');
  if (allBtn) allBtn.classList.add("active");
  renderProducts();
}

// ============================================
// ORDENAMIENTO
// ============================================
function setupSort() {
  const sortSelect = document.getElementById("sort-select");
  if (!sortSelect) return;
  sortSelect.addEventListener("change", () => {
    currentSort = sortSelect.value;
    renderProducts();
  });
}
