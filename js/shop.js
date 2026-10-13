(function () {
    "use strict";

    const API_URL = "api/store.php";
    const WA_PHONE = "527751064629";
    const CART_KEY = "ixmati_shop_cart_v1";

    const fallbackProducts = [
        {
            id: "SHOP-001",
            title: "Tazas y termos premium",
            category: "Tazas y termos",
            description: "Sublimación envolvente, nombres y empaques listos para regalo.",
            image: "img/ixmati/galeria-banner.jpg",
            badge: "Nuevo",
            stock: 50,
            minQuantity: 1,
            unit: "pieza",
            customizableFields: ["Logo", "Nombre", "Color"]
        },
        {
            id: "SHOP-002",
            title: "Playeras y sudaderas",
            category: "Textil",
            description: "DTF y vinil textil para tirajes cortos con colores vivos.",
            image: "img/ixmati/galeria-lona-vinil.jpg",
            badge: "Top ventas",
            stock: 40,
            minQuantity: 1,
            unit: "pieza",
            customizableFields: ["Logo", "Talla", "Color"]
        },
        {
            id: "SHOP-003",
            title: "Impresión comercial",
            category: "Lonas y vinil",
            description: "Lonas, vinil y microperforado con instalación supervisada.",
            image: "img/ixmati/hero-lona-stand.jpg",
            badge: "",
            stock: 999,
            minQuantity: 1,
            unit: "m2",
            customizableFields: ["Medida", "Material", "Instalación"]
        }
    ];

    let products = [];
    let activeCategory = "Todos";

    function readCart() {
        try {
            return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
        } catch (error) {
            return [];
        }
    }

    function writeCart(cart) {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        renderCart();
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (char) {
            return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char];
        });
    }

    function categories() {
        return ["Todos"].concat(Array.from(new Set(products.map(function (product) {
            return product.category || "General";
        }))).sort(function (a, b) {
            if (a === "Todos") return -1;
            if (b === "Todos") return 1;
            return a.localeCompare(b, "es");
        }));
    }

    function filteredProducts() {
        if (activeCategory === "Todos") return products;
        return products.filter(function (product) {
            return (product.category || "General") === activeCategory;
        });
    }

    function renderFilters() {
        const wrap = document.getElementById("shopFilters");
        if (!wrap) return;
        wrap.innerHTML = categories().map(function (category) {
            const active = category === activeCategory ? " active" : "";
            return '<button class="shop-filter' + active + '" type="button" data-category="' + escapeHtml(category) + '">' + escapeHtml(category) + "</button>";
        }).join("");
    }

    function renderProducts() {
        const root = document.getElementById("shopProducts");
        if (!root) return;
        const rows = filteredProducts();
        if (!rows.length) {
            root.innerHTML = '<div class="col-12"><div class="shop-empty">No hay productos activos en esta categoría.</div></div>';
            return;
        }

        root.innerHTML = rows.map(function (product, index) {
            const image = product.image || "img/optimized/home-hero-promo.webp";
            const badge = product.badge ? '<span class="shop-badge">' + escapeHtml(product.badge) + "</span>" : "";
            const stock = Number(product.stock || 0);
            const stockLabel = stock > 0 ? stock + " disponibles" : "Bajo pedido";
            const fields = (product.customizableFields || []).slice(0, 3).map(function (item) {
                return "<span>" + escapeHtml(item) + "</span>";
            }).join("");
            return [
                '<div class="col-md-6 col-xl-4 wow fadeIn" data-wow-delay=".' + ((index % 6) + 1) + 's">',
                '<article class="shop-card h-100" data-product-card="' + escapeHtml(product.id) + '">',
                '<div class="shop-img">',
                '<img src="' + escapeHtml(image) + '" alt="' + escapeHtml(product.title) + '" class="img-fluid w-100" loading="lazy">',
                badge,
                "</div>",
                '<div class="shop-body">',
                '<div class="shop-category">' + escapeHtml(product.category || "General") + "</div>",
                "<h4>" + escapeHtml(product.title) + "</h4>",
                '<p class="mb-3">' + escapeHtml(product.description || product.shortDescription || "") + "</p>",
                '<div class="shop-tags">' + fields + "</div>",
                '<div class="shop-stock">' + escapeHtml(stockLabel) + " · mínimo " + escapeHtml(product.minQuantity || 1) + " " + escapeHtml(product.unit || "pieza") + "</div>",
                '<div class="d-flex justify-content-between align-items-center gap-2 mt-3">',
                '<button class="btn btn-sm btn-primary rounded-pill" type="button" data-add-cart="' + escapeHtml(product.id) + '">Agregar</button>',
                "</div>",
                "</div>",
                "</article>",
                "</div>"
            ].join("");
        }).join("");
    }

    function addToCart(productId) {
        const product = products.find(function (item) { return item.id === productId; });
        if (!product) return;
        const cart = readCart();
        const existing = cart.find(function (item) { return item.id === productId; });
        const minQuantity = Number(product.minQuantity || 1);
        if (existing) {
            existing.quantity += minQuantity;
        } else {
            cart.push({
                id: product.id,
                title: product.title,
                quantity: minQuantity,
                unit: product.unit || "pieza",
                note: ""
            });
        }
        writeCart(cart);
    }

    function renderCart() {
        const root = document.getElementById("shopCart");
        const count = document.getElementById("shopCartCount");
        const total = document.getElementById("shopCartTotal");
        if (!root) return;
        const cart = readCart();
        if (count) count.textContent = cart.length + (cart.length === 1 ? " item" : " items");
        if (!cart.length) {
            root.innerHTML = '<p class="text-muted mb-0">Agrega productos del catálogo para armar tu solicitud.</p>';
            if (total) total.textContent = "Por confirmar";
            return;
        }
        root.innerHTML = cart.map(function (item) {
            return [
                '<div class="cart-line" data-cart-item="' + escapeHtml(item.id) + '">',
                '<div class="d-flex justify-content-between gap-3">',
                "<div>",
                '<p class="mb-1 fw-bold">' + escapeHtml(item.quantity) + " " + escapeHtml(item.unit) + " · " + escapeHtml(item.title) + "</p>",
                "</div>",
                '<button class="cart-remove" type="button" data-remove-cart="' + escapeHtml(item.id) + '" aria-label="Quitar">×</button>',
                "</div>",
                "</div>"
            ].join("");
        }).join("");
        if (total) total.textContent = "Por confirmar";
    }

    function sendCart() {
        const cart = readCart();
        const lines = cart.map(function (item) {
            return "- " + item.quantity + " " + item.unit + " " + item.title;
        });
        const text = cart.length
            ? "Hola Ixmati, quiero cotizar este carrito:\n" + lines.join("\n") + "\nNecesito confirmar precio, personalización, tiempos y entrega."
            : "Hola Ixmati, quiero cotizar productos personalizados de la tienda.";
        window.open("https://wa.me/" + WA_PHONE + "?text=" + encodeURIComponent(text), "_blank");
    }

    async function loadProducts() {
        try {
            const response = await fetch(API_URL, { cache: "no-store" });
            if (!response.ok) throw new Error("No se pudo cargar catálogo");
            const data = await response.json();
            products = Array.isArray(data.products) && data.products.length ? data.products : fallbackProducts;
        } catch (error) {
            products = fallbackProducts;
        }
        products.sort(function (a, b) {
            return Number(a.sortOrder || 100) - Number(b.sortOrder || 100);
        });
        renderFilters();
        renderProducts();
        renderCart();
    }

    document.addEventListener("click", function (event) {
        const filter = event.target.closest("[data-category]");
        if (filter) {
            activeCategory = filter.getAttribute("data-category") || "Todos";
            renderFilters();
            renderProducts();
            return;
        }
        const add = event.target.closest("[data-add-cart]");
        if (add) {
            addToCart(add.getAttribute("data-add-cart"));
            return;
        }
        const remove = event.target.closest("[data-remove-cart]");
        if (remove) {
            writeCart(readCart().filter(function (item) {
                return item.id !== remove.getAttribute("data-remove-cart");
            }));
            return;
        }
        if (event.target.closest("[data-send-cart]")) {
            sendCart();
        }
    });

    loadProducts();
})();
