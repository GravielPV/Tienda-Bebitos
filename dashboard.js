/* ============================================
   TIENDA BEBITOS - Dashboard de Administración
   CRUD de productos con localStorage
   Requiere: shared.js
   ============================================ */

// ============================================
// ESTADO
// ============================================
let products = [];
let deleteTargetId = null;

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener("DOMContentLoaded", async () => {
  products = await loadProductsFromServer();
  renderTable();
  updateStats();
  setupSearchAndFilter();
  setupLivePreview();
  initIcons();
});

function initIcons() {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

// ============================================
// PERSISTENCIA CON LOCALSTORAGE
// ============================================
function saveProducts() {
  localStorage.setItem("bebitos_products", JSON.stringify(products));
  saveProductsToServer(products);
}

// ============================================
// RENDERIZADO DE TABLA
// ============================================
function renderTable(filteredList) {
  const tbody = document.getElementById("products-table-body");
  const emptyState = document.getElementById("empty-state");
  const countLabel = document.getElementById("product-count-label");
  if (!tbody) return;

  const list = filteredList || products;

  if (list.length === 0) {
    tbody.innerHTML = "";
    emptyState.classList.remove("hidden");
    countLabel.textContent = "0 productos";
    return;
  }

  emptyState.classList.add("hidden");
  countLabel.textContent = `${list.length} producto${list.length !== 1 ? "s" : ""}`;

  const categoryLabels = {
    ropa: { text: "Ropa", bg: "bg-pink-50", color: "text-pink-600" },
    calzado: { text: "Calzado", bg: "bg-blue-50", color: "text-blue-600" },
    juguetes: {
      text: "Juguetes",
      bg: "bg-yellow-50",
      color: "text-yellow-700",
    },
    accesorios: {
      text: "Accesorios",
      bg: "bg-purple-50",
      color: "text-purple-600",
    },
  };

  tbody.innerHTML = list
    .map((product) => {
      const cat = categoryLabels[product.category] || {
        text: product.category,
        bg: "bg-gray-50",
        color: "text-gray-600",
      };
      const discount = product.originalPrice
        ? Math.round(
            ((product.originalPrice - product.price) / product.originalPrice) *
              100,
          )
        : 0;

      return `
      <div class="table-row border-b border-gray-50 last:border-b-0 ${!product.inStock ? "opacity-60" : ""}">
        <!-- Mobile Card -->
        <div class="md:hidden p-4">
          <div class="flex items-start gap-3">
            <div class="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${!product.inStock ? "grayscale" : ""}">${product.emoji}</div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <h3 class="font-semibold text-gray-800 text-sm truncate">${escapeHtml(product.name)}</h3>
                <span class="text-xs text-gray-400">#${product.id}</span>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-xs ${cat.bg} ${cat.color} px-2 py-0.5 rounded-full font-medium">${cat.text}</span>
                ${product.badge ? `<span class="text-xs bg-accent/10 text-accent-dark px-2 py-0.5 rounded-full font-medium">${escapeHtml(product.badge)}</span>` : ""}
                ${product.isNew ? '<span class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Nuevo</span>' : ""}
                ${!product.inStock ? '<span class="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium">Agotado</span>' : '<span class="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">Disponible</span>'}
              </div>
              <div class="flex items-center gap-2 mt-2">
                <span class="font-bold text-gray-800">RD$${product.price.toLocaleString()}</span>
                ${product.originalPrice ? `<span class="text-sm text-gray-400 line-through">RD$${product.originalPrice.toLocaleString()}</span><span class="text-xs text-green-600 font-semibold">-${discount}%</span>` : ""}
              </div>
            </div>
          </div>
          <div class="flex gap-2 mt-3 pt-3 border-t border-gray-100">
            <button onclick="toggleStock(${product.id})" class="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg ${product.inStock ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-green-50 text-green-600 hover:bg-green-100"} text-sm font-medium transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${product.inStock ? "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" : "M5 13l4 4L19 7"}"/></svg>
              ${product.inStock ? "Sin Stock" : "En Stock"}
            </button>
            <button onclick="openEditModal(${product.id})" class="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
              Editar
            </button>
            <button onclick="openDeleteModal(${product.id})" class="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg bg-red-50 text-red-500 text-sm font-medium hover:bg-red-100 transition-colors">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              Eliminar
            </button>
          </div>
        </div>

        <!-- Desktop Row -->
        <div class="hidden md:grid md:grid-cols-12 gap-4 px-6 py-4 items-center">
          <div class="col-span-1 text-sm text-gray-400 font-mono">#${product.id}</div>
          <div class="col-span-1">
            <div class="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-xl ${!product.inStock ? "grayscale" : ""}">${product.emoji}</div>
          </div>
          <div class="col-span-3">
            <p class="font-semibold text-gray-800 text-sm truncate">${escapeHtml(product.name)}</p>
          </div>
          <div class="col-span-1">
            <span class="text-xs ${cat.bg} ${cat.color} px-2.5 py-1 rounded-full font-medium">${cat.text}</span>
          </div>
          <div class="col-span-1 font-bold text-gray-800 text-sm">RD$${product.price.toLocaleString()}</div>
          <div class="col-span-1 text-sm">
            ${product.originalPrice ? `<span class="text-gray-400 line-through">RD$${product.originalPrice.toLocaleString()}</span>` : '<span class="text-gray-300">—</span>'}
          </div>
          <div class="col-span-1">
            <button onclick="toggleStock(${product.id})" class="text-xs px-2.5 py-1 rounded-full font-medium cursor-pointer transition-colors ${product.inStock ? "bg-green-50 text-green-600 hover:bg-green-100" : "bg-red-50 text-red-500 hover:bg-red-100"}" title="${product.inStock ? "Clic para marcar sin stock" : "Clic para marcar disponible"}">
              ${product.inStock ? "✓ Disponible" : "✕ Agotado"}
            </button>
          </div>
          <div class="col-span-1">
            <div class="flex flex-wrap gap-1">
              ${product.badge ? `<span class="text-xs bg-accent/10 text-accent-dark px-2 py-0.5 rounded-full font-medium">${escapeHtml(product.badge)}</span>` : ""}
              ${product.isNew ? '<span class="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Nuevo</span>' : ""}
              ${!product.badge && !product.isNew ? '<span class="text-gray-300 text-xs">—</span>' : ""}
            </div>
          </div>
          <div class="col-span-2 flex items-center justify-end gap-2">
            <button onclick="openEditModal(${product.id})" class="p-2 rounded-lg hover:bg-primary/10 text-gray-400 hover:text-primary transition-colors" title="Editar producto">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            </button>
            <button onclick="openDeleteModal(${product.id})" class="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors" title="Eliminar producto">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

// ============================================
// TOGGLE STOCK
// ============================================
function toggleStock(id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;
  product.inStock = !product.inStock;
  saveProducts();
  renderTable();
  updateStats();
  applyFilters();
  showDashToast(
    `"${product.name}" marcado como ${product.inStock ? "disponible" : "agotado"}`,
    product.inStock ? "success" : "info",
  );
}

// ============================================
// ESTADÍSTICAS
// ============================================
function updateStats() {
  const total = products.length;
  const offers = products.filter((p) => p.badge || p.originalPrice).length;
  const outOfStock = products.filter((p) => !p.inStock).length;
  const categories = new Set(products.map((p) => p.category)).size;

  setText("stat-total", total);
  setText("stat-offers", offers);
  setText("stat-new", outOfStock);
  setText("stat-categories", categories);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

// ============================================
// BÚSQUEDA Y FILTRO
// ============================================
function setupSearchAndFilter() {
  const searchInput = document.getElementById("search-input");
  const filterCategory = document.getElementById("filter-category");

  if (searchInput) searchInput.addEventListener("input", applyFilters);
  if (filterCategory) filterCategory.addEventListener("change", applyFilters);
}

function applyFilters() {
  const search = (document.getElementById("search-input")?.value || "")
    .toLowerCase()
    .trim();
  const category = document.getElementById("filter-category")?.value || "todos";

  let filtered = [...products];

  if (search) {
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(search));
  }
  if (category !== "todos") {
    filtered = filtered.filter((p) => p.category === category);
  }

  renderTable(filtered);
}

// ============================================
// SIDEBAR TOGGLE (MOBILE)
// ============================================
function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  sidebar.classList.toggle("sidebar-open");
  overlay.classList.toggle("hidden");
}

// ============================================
// MODAL: AGREGAR / EDITAR
// ============================================
function openAddModal() {
  resetForm();
  document.getElementById("modal-title").textContent = "Nuevo Producto";
  document.getElementById("modal-subtitle").textContent =
    "Completa los datos del producto";
  document.getElementById("form-submit-btn").textContent = "Guardar Producto";
  openModal("product-modal");
}

function openEditModal(id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;

  resetForm();

  document.getElementById("modal-title").textContent = "Editar Producto";
  document.getElementById("modal-subtitle").textContent =
    `Editando: ${product.name}`;
  document.getElementById("form-submit-btn").textContent =
    "Actualizar Producto";

  // Rellenar formulario
  document.getElementById("form-id").value = product.id;
  document.getElementById("form-name").value = product.name;
  document.getElementById("form-category").value = product.category;
  document.getElementById("form-price").value = product.price;
  document.getElementById("form-original-price").value =
    product.originalPrice || "";
  document.getElementById("form-badge").value = product.badge || "";
  document.getElementById("form-is-new").checked = product.isNew;
  document.getElementById("form-in-stock").checked = product.inStock !== false;
  document.getElementById("emoji-preview").textContent = product.emoji;

  updateLivePreview();
  openModal("product-modal");
}

function resetForm() {
  document.getElementById("product-form").reset();
  document.getElementById("form-id").value = "";
  document.getElementById("emoji-preview").textContent = "👶";
  document.getElementById("emoji-picker").classList.add("hidden");
  updateLivePreview();
}

function handleFormSubmit(event) {
  event.preventDefault();

  const formId = document.getElementById("form-id").value;
  const name = document.getElementById("form-name").value.trim();
  const category = document.getElementById("form-category").value;
  const price = parseInt(document.getElementById("form-price").value, 10);
  const originalPriceVal = document.getElementById("form-original-price").value;
  const originalPrice = originalPriceVal
    ? parseInt(originalPriceVal, 10)
    : null;
  const badge = document.getElementById("form-badge").value || null;
  const isNew = document.getElementById("form-is-new").checked;
  const inStock = document.getElementById("form-in-stock").checked;
  const emoji = document.getElementById("emoji-preview").textContent.trim();

  // Validaciones
  if (!name || !category) {
    showDashToast("Completa todos los campos obligatorios", "error");
    return;
  }
  if (price < 0) {
    showDashToast("El precio no puede ser negativo", "error");
    return;
  }
  if (originalPrice !== null && originalPrice <= price) {
    showDashToast(
      "El precio original debe ser mayor al precio actual",
      "error",
    );
    return;
  }

  if (formId) {
    // EDITAR
    const index = products.findIndex((p) => p.id === parseInt(formId, 10));
    if (index !== -1) {
      products[index] = {
        ...products[index],
        name,
        category,
        price,
        originalPrice,
        badge,
        isNew,
        inStock,
        emoji,
      };
      showDashToast(`"${name}" actualizado correctamente`, "success");
    }
  } else {
    // CREAR
    const newId =
      products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
    products.push({
      id: newId,
      name,
      category,
      price,
      originalPrice,
      badge,
      isNew,
      inStock,
      emoji,
    });
    showDashToast(`"${name}" creado correctamente`, "success");
  }

  saveProducts();
  renderTable();
  updateStats();
  applyFilters();
  closeModal();
}

// ============================================
// MODAL: ELIMINAR
// ============================================
function openDeleteModal(id) {
  const product = products.find((p) => p.id === id);
  if (!product) return;

  deleteTargetId = id;
  document.getElementById("delete-product-name").textContent =
    `"${product.name}" será eliminado permanentemente.`;

  const confirmBtn = document.getElementById("confirm-delete-btn");
  // Quitar listener anterior clonando el botón
  const newBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
  newBtn.addEventListener("click", () => {
    confirmDelete();
  });

  openModal("delete-modal");
}

function confirmDelete() {
  if (deleteTargetId === null) return;

  const product = products.find((p) => p.id === deleteTargetId);
  const name = product ? product.name : "";

  products = products.filter((p) => p.id !== deleteTargetId);
  deleteTargetId = null;

  saveProducts();
  renderTable();
  updateStats();
  applyFilters();
  closeDeleteModal();
  showDashToast(`"${name}" eliminado`, "info");
}

function closeDeleteModal() {
  closeModal("delete-modal");
  deleteTargetId = null;
}

// ============================================
// MODAL HELPERS
// ============================================
function openModal(id) {
  const modal = document.getElementById(id || "product-modal");
  if (!modal) return;
  requestAnimationFrame(() => {
    modal.classList.add("active");
  });
  document.body.style.overflow = "hidden";
}

function closeModal(id) {
  const modal = document.getElementById(id || "product-modal");
  if (!modal) return;
  modal.classList.remove("active");
  document.body.style.overflow = "";
}

// ============================================
// EMOJI PICKER
// ============================================
function toggleEmojiPicker() {
  document.getElementById("emoji-picker").classList.toggle("hidden");
}

function selectEmoji(emoji) {
  document.getElementById("emoji-preview").textContent = emoji;
  document.getElementById("emoji-picker").classList.add("hidden");
  updateLivePreview();
}

// ============================================
// LIVE PREVIEW DEL FORMULARIO
// ============================================
function setupLivePreview() {
  [
    "form-name",
    "form-price",
    "form-original-price",
    "form-category",
    "form-badge",
    "form-is-new",
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", updateLivePreview);
    if (el) el.addEventListener("change", updateLivePreview);
  });
}

function updateLivePreview() {
  const name =
    document.getElementById("form-name")?.value || "Nombre del producto";
  const price = parseInt(document.getElementById("form-price")?.value, 10) || 0;
  const originalPrice =
    parseInt(document.getElementById("form-original-price")?.value, 10) || 0;
  const category = document.getElementById("form-category")?.value || "";
  const badge = document.getElementById("form-badge")?.value || "";
  const isNew = document.getElementById("form-is-new")?.checked || false;
  const emoji = document.getElementById("emoji-preview")?.textContent || "👶";

  const catLabels = {
    ropa: "Ropa",
    calzado: "Calzado",
    juguetes: "Juguetes",
    accesorios: "Accesorios",
  };

  setText("preview-emoji", emoji);
  setText("preview-name", name);
  setText("preview-price", `RD$${price.toLocaleString()}`);

  const origEl = document.getElementById("preview-original-price");
  if (origEl) {
    if (originalPrice > 0) {
      origEl.textContent = `RD$${originalPrice.toLocaleString()}`;
      origEl.classList.remove("hidden");
    } else {
      origEl.classList.add("hidden");
    }
  }

  const catEl = document.getElementById("preview-category");
  if (catEl) catEl.textContent = catLabels[category] || "Categoría";

  const badgeEl = document.getElementById("preview-badge");
  if (badgeEl) {
    if (badge) {
      badgeEl.textContent = badge;
      badgeEl.classList.remove("hidden");
    } else {
      badgeEl.classList.add("hidden");
    }
  }

  const newEl = document.getElementById("preview-new");
  if (newEl) {
    if (isNew) newEl.classList.remove("hidden");
    else newEl.classList.add("hidden");
  }
}

// ============================================
// IMPORTAR / EXPORTAR
// ============================================
function exportProducts() {
  const data = JSON.stringify(products, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bebitos-productos-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showDashToast("Productos exportados correctamente", "success");
}

function importProducts(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);
      if (!Array.isArray(data)) {
        showDashToast("El archivo no contiene un array válido", "error");
        return;
      }
      // Validar estructura básica de cada producto
      const valid = data.every((p) => p.name && p.category && p.price >= 0);
      if (!valid) {
        showDashToast("Algunos productos tienen datos incompletos", "error");
        return;
      }
      products = data;
      saveProducts();
      renderTable();
      updateStats();
      showDashToast(`${data.length} productos importados`, "success");
    } catch (err) {
      showDashToast("Error al leer el archivo JSON", "error");
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

function resetToDefaults() {
  if (
    !confirm(
      "¿Restaurar todos los productos a los valores originales? Se perderán los cambios.",
    )
  )
    return;

  products = [...DEFAULT_PRODUCTS];
  saveProducts();
  renderTable();
  updateStats();
  applyFilters();
  showDashToast("Productos restaurados a valores originales", "info");
}

// ============================================
// TOAST
// ============================================
function showDashToast(message, type = "info") {
  const existing = document.querySelector(".dash-toast");
  if (existing) existing.remove();

  const toast = document.createElement("div");
  toast.className = `dash-toast ${type}`;
  toast.innerHTML = `${type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️"} ${escapeHtml(message)}`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}
