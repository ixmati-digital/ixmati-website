export const PRICING_CONFIG = {
  currency: "MXN",
  minPrice: 3000,
  commercialRange: {
    low: 0.92,
    high: 1.14
  },
  basePlans: {
    services: {
      S1: {
        label: "Presencia básica",
        basePrice: 3000,
        referenceIncludes: ["Página informativa", "Información del servicio", "Ubicación", "Datos principales", "Contacto por WhatsApp"]
      },
      S2: {
        label: "Sistema de citas",
        basePrice: 8000,
        referenceIncludes: ["Todo S1", "Calendario", "Horarios disponibles", "Reglas de agenda", "Confirmaciones", "Recordatorios", "Google Ads inicial"]
      },
      S3: {
        label: "Sistema + clientes nuevos",
        basePrice: 14000,
        referenceIncludes: ["Todo S2", "Captación avanzada", "Google Ads", "Meta Ads", "Sistema orientado a conversión"]
      }
    },
    stores: {
      T1: {
        label: "Catálogo online",
        basePrice: 3500,
        referenceIncludes: ["Hasta 50 productos", "Fotografías y precios", "Pedidos por WhatsApp", "Información de contacto"]
      },
      T2: {
        label: "Catálogo con pedidos",
        basePrice: 7500,
        referenceIncludes: ["Hasta 300 productos", "Formularios de pedido", "Panel de pedidos", "Productos destacados", "Google Ads inicial"]
      },
      T3: {
        label: "Ecommerce",
        basePrice: 15000,
        referenceIncludes: ["Más de 500 productos", "Carrito", "Pagos en línea", "Panel de pedidos", "Correos automáticos", "Google Ads", "Meta Ads"]
      }
    },
    restaurants: {
      R1: {
        label: "Menú y contacto",
        basePrice: 3000,
        referenceIncludes: ["Menú con fotos y precios", "Pedido preparado para WhatsApp", "Horarios", "Ubicación", "Código QR"]
      },
      R2: {
        label: "Pedidos asistidos",
        basePrice: 7000,
        referenceIncludes: ["Todo R1", "Aplicación web para empleados", "Órdenes organizadas", "Estados del pedido", "Confirmaciones", "Google Ads inicial"]
      },
      R3: {
        label: "Operación y crecimiento",
        basePrice: 12000,
        referenceIncludes: ["Todo R2", "Plataforma integral", "Datos", "Reportes", "Google Ads", "Meta Ads"]
      }
    }
  },
  modifiers: {
    extraPage: { label: "Página o sección adicional", price: 900, complexity: 1, timeDays: 1 },
    adminPanel: { label: "Panel administrativo", price: 2800, complexity: 3, timeDays: 3 },
    appointments: { label: "Sistema de citas", price: 3200, complexity: 3, timeDays: 3 },
    onlinePayments: { label: "Pagos en línea", price: 3000, complexity: 3, timeDays: 3 },
    cart: { label: "Carrito", price: 2200, complexity: 2, timeDays: 2 },
    internalUsers: { label: "Usuarios internos", price: 1300, complexity: 2, timeDays: 2 },
    automations: { label: "Automatizaciones", price: 1800, complexity: 2, timeDays: 2 },
    emails: { label: "Correos automáticos", price: 1200, complexity: 1, timeDays: 1 },
    whatsapp: { label: "WhatsApp conectado", price: 600, complexity: 1, timeDays: 1 },
    reports: { label: "Reportes", price: 2200, complexity: 3, timeDays: 3 },
    thirdParty: { label: "Integración de terceros", price: 2600, complexity: 3, timeDays: 3 },
    productsExtra: { label: "Productos adicionales", price: 1200, complexity: 1, timeDays: 2 },
    branchesExtra: { label: "Sucursal adicional", price: 750, complexity: 1, timeDays: 1 },
    customFeature: { label: "Función personalizada", price: 2500, complexity: 3, timeDays: 3 },
    googleAds: { label: "Publicidad Google inicial", price: 1800, complexity: 1, timeDays: 2 },
    metaAds: { label: "Publicidad Meta inicial", price: 1800, complexity: 1, timeDays: 2 },
    priority: { label: "Entrega prioritaria", price: 2500, complexity: 2, timeDays: -2 },
    visualComplexity: { label: "Dirección visual avanzada", price: 1500, complexity: 2, timeDays: 2 },
    contentVolume: { label: "Carga ampliada de contenido", price: 1400, complexity: 1, timeDays: 2 }
  },
  includedByBasePlan: {
    S1: ["whatsapp"],
    S2: ["whatsapp", "appointments", "googleAds", "emails"],
    S3: ["whatsapp", "appointments", "googleAds", "metaAds", "emails", "automations"],
    T1: ["whatsapp"],
    T2: ["whatsapp", "adminPanel", "googleAds"],
    T3: ["whatsapp", "adminPanel", "cart", "onlinePayments", "emails", "googleAds", "metaAds"],
    R1: ["whatsapp", "cart"],
    R2: ["whatsapp", "cart", "adminPanel", "emails", "googleAds"],
    R3: ["whatsapp", "cart", "adminPanel", "emails", "reports", "googleAds", "metaAds"]
  },
  removalCredits: {
    whatsapp: 250,
    cart: 900,
    adminPanel: 1400,
    appointments: 1500,
    onlinePayments: 1300,
    emails: 500,
    googleAds: 700,
    metaAds: 700,
    reports: 900,
    internalUsers: 600,
    automations: 700
  }
};
