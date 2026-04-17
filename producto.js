/* ============================================
   TIENDA BEBITOS - Página de Producto
   Requiere: shared.js
   ============================================ */

let products = loadProducts();
let cart = JSON.parse(localStorage.getItem("bebitos_cart") || "[]");

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener("DOMContentLoaded", async () => {
  products = await loadProductsFromServer();
  if (typeof lucide !== "undefined") lucide.createIcons();

  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get("id"), 10);

  if (!productId) {
    showNotFound();
    return;
  }

  const product = products.find((p) => p.id === productId);
  if (!product) {
    showNotFound();
    return;
  }

  renderProductDetail(product);
  renderRelated(product);
  setupCartUI();
  updateCartUI();
});

function showNotFound() {
  document.getElementById("product-not-found").classList.remove("hidden");
  if (typeof lucide !== "undefined") lucide.createIcons();
}

// ============================================
// RENDER DETALLE
// ============================================
function renderProductDetail(product) {
  document.title = `${product.name} | Tienda Bebitos`;

  // Breadcrumb
  const catNames = {
    ropa: "Ropa",
    calzado: "Calzado",
    juguetes: "Juguetes",
    accesorios: "Accesorios",
  };
  document.getElementById("breadcrumb-cat").textContent =
    catNames[product.category] || product.category;
  document.getElementById("breadcrumb-cat").onclick = () => {
    window.location.href = `index.html#productos`;
  };
  document.getElementById("breadcrumb-name").textContent = product.name;

  // Show detail container
  document.getElementById("product-detail").classList.remove("hidden");

  // Main image
  const mainImg = document.getElementById("main-image");
  if (product.mainImage) {
    mainImg.src = product.mainImage;
    mainImg.alt = product.name;
  } else {
    // Emoji product: replace img with emoji
    const container = document.getElementById("main-image-container");
    mainImg.remove();
    const emojiEl = document.createElement("span");
    emojiEl.className = "text-8xl";
    emojiEl.textContent = product.emoji;
    container.appendChild(emojiEl);
  }

  // Badges
  if (product.badge) {
    const badgeEl = document.getElementById("detail-badge-offer");
    badgeEl.textContent = product.badge;
    badgeEl.classList.remove("hidden");
  }
  if (product.isNew) {
    document.getElementById("detail-badge-new").classList.remove("hidden");
  }

  // Category & Name
  document.getElementById("detail-category").textContent =
    catNames[product.category] || product.category;
  document.getElementById("detail-name").textContent = product.name;

  // Price
  const priceArea = document.getElementById("detail-price-area");
  if (product.price > 0) {
    const discount = product.originalPrice
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0;
    priceArea.innerHTML = `
      <span class="font-display font-extrabold text-3xl text-gray-900">RD$${product.price.toLocaleString()}</span>
      ${product.originalPrice ? `<span class="text-lg text-gray-400 line-through">RD$${product.originalPrice.toLocaleString()}</span>` : ""}
      ${discount > 0 ? `<span class="text-sm text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full">-${discount}%</span>` : ""}
    `;
  } else {
    priceArea.innerHTML = `<span class="font-display font-bold text-2xl text-accent-dark">Consultar precio</span>`;
  }

  // Build all images list for thumbnails
  const allImages = getProductImages(product);

  // Thumbnails
  if (allImages.length > 1) {
    const thumbContainer = document.getElementById("thumbnails");
    thumbContainer.innerHTML = allImages
      .map(
        (img, i) => `
      <button onclick="selectImage(${i})" class="thumb-btn flex-shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden transition-all ${i === 0 ? "border-primary" : "border-gray-200 hover:border-gray-300"}" data-index="${i}">
        <img src="${escapeAttr(img.image)}" alt="${escapeAttr(img.label)}" class="w-full h-full object-cover" loading="lazy" />
      </button>
    `,
      )
      .join("");
  }

  // Variants section
  if (product.variants && product.variants.length > 0) {
    const variantsSection = document.getElementById("detail-variants");
    variantsSection.classList.remove("hidden");
    document.getElementById("variant-label").textContent = "Principal";
    const btnsContainer = document.getElementById("variant-buttons");
    btnsContainer.innerHTML = [
      `<button onclick="selectVariant(-1, this)" class="variant-select-btn active px-3 py-1.5 rounded-lg text-xs font-semibold border-2 border-primary bg-primary/10 text-primary transition-all">Principal</button>`,
      ...product.variants.map(
        (v, i) =>
          `<button onclick="selectVariant(${i}, this)" class="variant-select-btn px-3 py-1.5 rounded-lg text-xs font-semibold border-2 border-gray-200 text-gray-600 hover:border-gray-300 transition-all">${escapeHtml(v.color)}</button>`,
      ),
    ].join("");
  }

  // Gallery section
  if (product.gallery && product.gallery.length > 0) {
    const gallerySection = document.getElementById("detail-gallery");
    gallerySection.classList.remove("hidden");
    const btnsContainer = document.getElementById("gallery-buttons");
    btnsContainer.innerHTML = [
      `<button onclick="selectGallery(-1, this)" class="gallery-select-btn active px-3 py-1.5 rounded-lg text-xs font-semibold border-2 border-primary bg-primary/10 text-primary transition-all">Principal</button>`,
      ...product.gallery.map(
        (g, i) =>
          `<button onclick="selectGallery(${i}, this)" class="gallery-select-btn px-3 py-1.5 rounded-lg text-xs font-semibold border-2 border-gray-200 text-gray-600 hover:border-gray-300 transition-all">${escapeHtml(g.label)}</button>`,
      ),
    ].join("");
  }

  // Add to cart button
  const addBtn = document.getElementById("add-to-cart-btn");
  if (product.inStock === false) {
    addBtn.disabled = true;
    addBtn.textContent = "Agotado";
    addBtn.className =
      "w-full py-4 bg-gray-200 text-gray-400 rounded-2xl font-bold text-base cursor-not-allowed";
  } else {
    addBtn.onclick = () => {
      addToCart(product.id);
    };
  }

  // WhatsApp button
  const priceText =
    product.price > 0
      ? `RD$${product.price.toLocaleString()}`
      : "consultar precio";
  const waMsg = encodeURIComponent(
    `Hola, estoy interesado/a en: ${product.name} (${priceText}). ¿Está disponible?`,
  );
  document.getElementById("whatsapp-product-btn").href =
    `https://wa.me/18095289181?text=${waMsg}`;

  if (typeof lucide !== "undefined") lucide.createIcons();
}

// ============================================
// SELECCIÓN DE IMÁGENES
// ============================================
let currentProduct = null;

function getCurrentProduct() {
  if (currentProduct) return currentProduct;
  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get("id"), 10);
  currentProduct = products.find((p) => p.id === productId);
  return currentProduct;
}

function selectImage(index) {
  const product = getCurrentProduct();
  if (!product) return;
  const allImages = getProductImages(product);
  if (index < 0 || index >= allImages.length) return;

  const mainImg = document.getElementById("main-image");
  if (mainImg) mainImg.src = allImages[index].image;

  document.querySelectorAll(".thumb-btn").forEach((btn, i) => {
    btn.classList.toggle("border-primary", i === index);
    btn.classList.toggle("border-gray-200", i !== index);
  });
}

function selectVariant(variantIndex, btn) {
  const product = getCurrentProduct();
  if (!product) return;

  // Update main image
  const mainImg = document.getElementById("main-image");
  if (variantIndex === -1) {
    if (mainImg) mainImg.src = product.mainImage;
    document.getElementById("variant-label").textContent = "Principal";
  } else {
    if (mainImg) mainImg.src = product.variants[variantIndex].image;
    document.getElementById("variant-label").textContent =
      product.variants[variantIndex].color;
  }

  // Update active button
  document.querySelectorAll(".variant-select-btn").forEach((b) => {
    b.classList.remove(
      "active",
      "border-primary",
      "bg-primary/10",
      "text-primary",
    );
    b.classList.add("border-gray-200", "text-gray-600");
  });
  btn.classList.add(
    "active",
    "border-primary",
    "bg-primary/10",
    "text-primary",
  );
  btn.classList.remove("border-gray-200", "text-gray-600");

  // Sync thumbnails
  const thumbIndex = variantIndex + 1; // +1 because main image is index 0
  document.querySelectorAll(".thumb-btn").forEach((tb, i) => {
    tb.classList.toggle("border-primary", i === thumbIndex);
    tb.classList.toggle("border-gray-200", i !== thumbIndex);
  });
}

function selectGallery(galleryIndex, btn) {
  const product = getCurrentProduct();
  if (!product) return;

  const mainImg = document.getElementById("main-image");
  if (galleryIndex === -1) {
    if (mainImg) mainImg.src = product.mainImage;
  } else {
    if (mainImg) mainImg.src = product.gallery[galleryIndex].image;
  }

  document.querySelectorAll(".gallery-select-btn").forEach((b) => {
    b.classList.remove(
      "active",
      "border-primary",
      "bg-primary/10",
      "text-primary",
    );
    b.classList.add("border-gray-200", "text-gray-600");
  });
  btn.classList.add(
    "active",
    "border-primary",
    "bg-primary/10",
    "text-primary",
  );
  btn.classList.remove("border-gray-200", "text-gray-600");

  const thumbIndex = galleryIndex + 1;
  document.querySelectorAll(".thumb-btn").forEach((tb, i) => {
    tb.classList.toggle("border-primary", i === thumbIndex);
    tb.classList.toggle("border-gray-200", i !== thumbIndex);
  });
}

// ============================================
// PRODUCTOS RELACIONADOS
// ============================================
function renderRelated(product) {
  const related = products
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 5);
  if (related.length === 0) return;

  document.getElementById("related-section").classList.remove("hidden");
  const grid = document.getElementById("related-grid");

  grid.innerHTML = related
    .map((p) => {
      const hasImage = !!p.mainImage;
      const imageArea = hasImage
        ? `<img src="${escapeAttr(p.mainImage)}" alt="${escapeAttr(p.name)}" class="w-full h-full object-contain p-2" loading="lazy" />`
        : `<span class="text-5xl">${p.emoji}</span>`;

      const priceDisplay =
        p.price > 0
          ? `<span class="font-bold text-base text-gray-900">RD$${p.price.toLocaleString()}</span>`
          : `<span class="text-sm text-accent-dark font-semibold">Consultar precio</span>`;

      return `
    <a href="producto.html?id=${p.id}" class="product-card block">
      <div class="relative aspect-square bg-white flex items-center justify-center overflow-hidden">
        ${p.badge ? `<span class="badge-offer">${p.badge}</span>` : ""}
        ${p.isNew ? '<span class="badge-new">Nuevo</span>' : ""}
        ${imageArea}
      </div>
      <div class="p-3">
        <p class="text-[11px] text-gray-400 uppercase tracking-wide">${p.category}</p>
        <h3 class="font-semibold text-gray-800 text-sm leading-snug mt-0.5 line-clamp-2">${escapeHtml(p.name)}</h3>
        <div class="flex items-baseline gap-1.5 mt-2">${priceDisplay}</div>
      </div>
    </a>`;
    })
    .join("");
}
