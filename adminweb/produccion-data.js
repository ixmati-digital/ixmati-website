(function () {
  var STORAGE_KEY = "ixmati_produccion_flor_v1";
  var CUSTOM_OPS_KEY = "ixmati_produccion_custom_ops_v1";
  var API_URL = "api/production.php";
  var remoteLoaded = false;
  var cfg = window.IxmatiSupabaseConfig || {};
  var supabaseEnabled = Boolean(
    window.supabase &&
    cfg.url &&
    cfg.anonKey &&
    cfg.url !== "SUPABASE_URL" &&
    cfg.anonKey !== "SUPABASE_ANON_KEY" &&
    cfg.url.indexOf("TU-PROYECTO") === -1 &&
    cfg.anonKey !== "sb_publishable_..."
  );
  var supabaseClient = supabaseEnabled ? window.supabase.createClient(cfg.url, cfg.anonKey) : null;
  var supabaseSessionReady = null;
  var supabaseAuthMissing = false;
  var remoteError = "";
  var DELIVERY_BUCKET = "production-deliveries";
  var checklist = ["Diseno terminado", "Revisado", "Programado", "Publicado"];
  var statuses = ["Pendiente", "En diseno", "En revision", "Enviado a aprobacion", "Aprobado", "Cambios solicitados", "Programado", "Publicado"];

  var defaultOps = [
      {
          id: "OP-001",
          page: "op-001.html",
          type: "Carrusel",
          title: "Servicios Digitales Ixmati",
          status: "Pendiente",
          priority: "Alta",
          format: "1080x1350",
          pieces: "7 slides",
          objective: "Presentar la linea completa de servicios digitales Ixmati y abrir conversacion por WhatsApp o website.",
          cta: "Solicita informacion por WhatsApp o visita nuestro website.",
          refs: [
              "Mockups web",
              "Pantallas",
              "Laptop",
              "Movil",
              "UI limpia",
              "Fondos claros"
          ],
          slides: [
              {
                  title: "IXMATI DIGITAL",
                  subtitle: "Impulsamos negocios mediante tecnologia.",
                  text: "Soluciones digitales para vender mejor, ordenar procesos y comunicar con claridad.",
                  visual: "Mockups web, pantallas, laptop y movil."
              },
              {
                  title: "Redes Sociales",
                  text: "Diseno\nProgramacion\nContenido\nReportes",
                  visual: "Instagram, Facebook y TikTok con composicion tipo dashboard social."
              },
              {
                  title: "Sitios Web",
                  text: "Tu negocio abierto 24/7.\nCreamos paginas claras, rapidas y listas para recibir clientes.",
                  visual: "Mockup web moderno con hero, boton CTA y vista movil."
              },
              {
                  title: "Tiendas Online",
                  text: "Vende productos en linea.\nCatalogo, carrito y checkout para pedidos mas ordenados.",
                  visual: "Catalogo, carrito, checkout y tarjeta de producto."
              },
              {
                  title: "Sistemas",
                  text: "Digitaliza procesos.\nPaneles para administrar informacion, pedidos, citas o reportes.",
                  visual: "Dashboard, graficas y panel administrativo."
              },
              {
                  title: "Automatizacion",
                  text: "Menos trabajo manual.\nFlujos, IA y bots para ahorrar tiempo operativo.",
                  visual: "Flujos conectados, IA, bots y nodos de automatizacion."
              },
              {
                  title: "Solicita informacion",
                  text: "Cuentanos que necesita tu negocio.\nTe ayudamos a elegir la solucion correcta.",
                  visual: "CTA con WhatsApp, website y cierre visual de marca."
              }
          ],
          socialCopy: "Tu negocio puede vender mejor, atender más rápido y verse más profesional con herramientas digitales bien hechas.\n\nEn Ixmati desarrollamos páginas web, tiendas en línea, automatizaciones y contenido para que tu operación sea más clara y tus clientes encuentren la información sin vueltas.\n\nSolicita información por WhatsApp o visita nuestro website.\n\n#IxmatiDigital #SitiosWeb #Automatización #MarketingDigital"
      },
      {
          id: "OP-002",
          page: "op-002.html",
          type: "Carrusel",
          title: "Redes Sociales",
          status: "Pendiente",
          priority: "Alta",
          format: "1080x1350",
          pieces: "7 slides",
          objective: "Explicar que redes sociales no es solo publicar, sino disenar, programar, crear formatos y medir resultados.",
          cta: "Solicita informacion y arma tu plan mensual de redes.",
          refs: [
              "Feed",
              "Reels",
              "Stories",
              "Calendario editorial",
              "Metricas"
          ],
          slides: [
              {
                  title: "Tu negocio necesita Redes Sociales?",
                  text: "Si tus clientes te buscan en Instagram, Facebook o TikTok, tu presencia debe verse activa, clara y profesional.",
                  visual: "Collage de publicaciones y perfil social."
              },
              {
                  title: "Diseno de contenido",
                  text: "Creamos piezas visuales alineadas a tu marca para promociones, servicios, productos y comunicados.",
                  visual: "Plantillas de post, paleta de color y mockup de feed."
              },
              {
                  title: "Reels",
                  text: "Videos cortos para mostrar productos, procesos, testimonios, promociones y momentos clave de tu negocio.",
                  visual: "Interfaz de reel, timeline y mini clips."
              },
              {
                  title: "Stories",
                  text: "Contenido rapido para mantener presencia diaria, activar promociones y dirigir clientes a WhatsApp.",
                  visual: "Stories con stickers, encuesta y boton de mensaje."
              },
              {
                  title: "Programacion",
                  text: "Organizamos el calendario para publicar con constancia sin depender de improvisar cada semana.",
                  visual: "Calendario editorial y lista de publicaciones."
              },
              {
                  title: "Reportes",
                  text: "Revisamos alcance, interacciones, clics y mensajes para saber que contenido funciona mejor.",
                  visual: "Graficas simples y metricas sociales."
              },
              {
                  title: "Solicita informacion",
                  text: "Hagamos que tus redes trabajen con estrategia, diseno y seguimiento mensual.",
                  visual: "CTA con WhatsApp y website."
              }
          ],
          socialCopy: "Tus redes sociales no solo deben verse bonitas: también deben comunicar, generar confianza y mover a tus clientes a escribirte.\n\nCreamos contenido para posts, reels, stories y campañas con estrategia, diseño y seguimiento mensual.\n\nSolicita información y arma tu plan mensual de redes.\n\n#RedesSociales #ContenidoDigital #MarketingDigital #Ixmati"
      },
      {
          id: "OP-003",
          page: "op-003.html",
          type: "Carrusel",
          title: "Sitios Web",
          status: "Pendiente",
          priority: "Alta",
          format: "1080x1350",
          pieces: "7 slides",
          objective: "Mostrar el valor de una web como punto de venta, confianza y contacto disponible todo el dia.",
          cta: "Solicita informacion para crear tu sitio web.",
          refs: [
              "Landing",
              "Web corporativa",
              "Formulario",
              "WhatsApp",
              "Responsive"
          ],
          slides: [
              {
                  title: "Tu negocio abierto 24/7",
                  text: "Un sitio web permite que tus clientes conozcan tus servicios, vean informacion y te contacten a cualquier hora.",
                  visual: "Mockup desktop y movil con pagina principal."
              },
              {
                  title: "Landing Pages",
                  text: "Paginas enfocadas en una accion: cotizar, agendar, comprar o pedir informacion.",
                  visual: "Landing con hero, beneficios y CTA."
              },
              {
                  title: "Sitios Corporativos",
                  text: "Presencia profesional para explicar tu empresa, servicios, experiencia y datos de contacto.",
                  visual: "Secciones de empresa, servicios y contacto."
              },
              {
                  title: "Formularios",
                  text: "Recibe datos ordenados de prospectos, solicitudes, reservas o cotizaciones.",
                  visual: "Formulario limpio con campos y confirmacion."
              },
              {
                  title: "WhatsApp",
                  text: "Conecta tu pagina a mensajes directos para que el cliente pueda dar el siguiente paso rapido.",
                  visual: "Boton WhatsApp y conversacion iniciada."
              },
              {
                  title: "Beneficios",
                  text: "Mas confianza, informacion clara, mejor seguimiento y menos preguntas repetidas.",
                  visual: "Iconos de confianza, velocidad, contacto y orden."
              },
              {
                  title: "Solicita informacion",
                  text: "Creamos la web que tu negocio necesita para vender, informar o agendar.",
                  visual: "CTA con WhatsApp y website."
              }
          ],
          socialCopy: "Una página web profesional ayuda a que tus clientes conozcan tus servicios, resuelvan dudas y te contacten en cualquier momento.\n\nDiseñamos sitios claros, responsivos y conectados a WhatsApp para negocios que necesitan presencia digital real.\n\nSolicita información para crear tu sitio web.\n\n#PáginaWeb #DiseñoWeb #NegociosDigitales #IxmatiDigital"
      },
      {
          id: "OP-004",
          page: "op-004.html",
          type: "Carrusel",
          title: "Tiendas Online",
          status: "Pendiente",
          priority: "Media",
          format: "1080x1350",
          pieces: "7 slides",
          objective: "Explicar como una tienda online ordena catalogo, productos, carrito, pagos y pedidos.",
          cta: "Solicita informacion para vender en linea.",
          refs: [
              "Catalogo",
              "Producto",
              "Carrito",
              "Checkout",
              "Pagos"
          ],
          slides: [
              {
                  title: "Vende en linea",
                  text: "Convierte tu catalogo en una experiencia clara para que tus clientes vean, elijan y pidan sin desorden.",
                  visual: "Tienda online en laptop y movil."
              },
              {
                  title: "Catalogo",
                  text: "Muestra tus productos por categorias, colecciones, tallas, colores o disponibilidad.",
                  visual: "Grid de productos y filtros."
              },
              {
                  title: "Productos",
                  text: "Cada producto puede tener fotos, descripcion, precio, variantes y detalles importantes.",
                  visual: "Ficha de producto moderna."
              },
              {
                  title: "Carrito",
                  text: "El cliente agrega productos y revisa su pedido antes de enviarlo o pagarlo.",
                  visual: "Carrito lateral con resumen."
              },
              {
                  title: "Pagos",
                  text: "Integra pago en linea o flujo de confirmacion segun la operacion de tu negocio.",
                  visual: "Checkout, tarjeta y confirmacion."
              },
              {
                  title: "Beneficios",
                  text: "Pedidos mas claros, menos mensajes repetidos y una forma mas profesional de vender.",
                  visual: "Iconos de orden, venta, rapidez y control."
              },
              {
                  title: "Solicita informacion",
                  text: "Armemos una tienda online adaptada a tus productos y proceso de venta.",
                  visual: "CTA con WhatsApp y website."
              }
          ],
          socialCopy: "Convierte tu catálogo en una tienda en línea clara, ordenada y fácil de usar.\n\nTus clientes pueden ver productos, revisar detalles, elegir variantes y enviar pedidos sin depender de mensajes desordenados.\n\nSolicita información para vender en línea.\n\n#TiendaOnline #Ecommerce #CatálogoDigital #IxmatiDigital"
      },
      {
          id: "OP-005",
          page: "op-detalle.html?id=OP-005",
          type: "POST servicio",
          calendarType: "Producto",
          dueDate: "11 julio 2026",
          title: "Pagina web para tu negocio",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram",
          publishUrl: "ixmatiestudio.com",
          format: "1080x1350",
          pieces: "1 post feed",
          objective: "Hacer un post facil de entender para que negocios locales vean que una pagina web les ayuda a verse profesionales, recibir clientes y explicar sus servicios sin repetir todo por mensaje.",
          simpleBrief: "La idea es vender el servicio de paginas web sin sonar tecnico. Piensa en un dueno de negocio que pregunta: para que quiero una pagina si ya tengo Facebook? El post debe responder eso en palabras simples.",
          cta: "Manda mensaje y te decimos que tipo de pagina necesita tu negocio.",
          refs: [
              "Laptop con web abierta",
              "Celular con version movil",
              "Boton de WhatsApp",
              "Negocio local",
              "Diseno limpio"
          ],
          instructions: [
              "Haz una composicion clara: titulo grande, mockup de pagina web y 3 beneficios faciles de leer.",
              "No llenes el post de texto. Usa frases cortas: Da confianza, Explica tus servicios, Recibe mensajes.",
              "El cliente debe entender en 3 segundos que Ixmati hace paginas web para negocios.",
              "Usa colores sobrios y profesionales. Evita que parezca promocion barata."
          ],
          examples: [
              "Titulo posible: Tu negocio necesita una pagina web?",
              "Texto de apoyo: Presenta tus servicios, genera confianza y recibe clientes desde internet.",
              "Beneficios: Informacion clara / Contacto por WhatsApp / Disponible 24/7."
          ],
          deliverableGuide: "Sube 1 imagen final en PNG o JPG. Si trabajas en Canva/Illustrator, sube tambien captura o archivo editable si puedes.",
          avoid: [
              "No uses palabras como hosting, dominio, SEO tecnico o UX.",
              "No pongas demasiado texto pequeno.",
              "No uses mockups borrosos o pantallas inventadas que no se entiendan."
          ],
          slides: [
              {
                  title: "Post unico",
                  text: "Tu negocio necesita una pagina web?\nPresenta tus servicios, genera confianza y recibe clientes desde internet.\nDisponible 24/7.",
                  visual: "Mockup de laptop y celular mostrando una web limpia, con boton de WhatsApp visible y 3 beneficios alrededor."
              }
          ],
          socialCopy: "Tu negocio necesita una página web que explique lo que haces, genere confianza y facilite que tus clientes te contacten.\n\nCreamos sitios claros, rápidos y adaptados a celular para que tu marca esté disponible todos los días.\n\nManda mensaje y te decimos qué tipo de página necesita tu negocio.\n\n#PáginaWeb #DiseñoWeb #NegocioLocal #IxmatiDigital"
      },
      {
          id: "OP-006",
          page: "op-detalle.html?id=OP-006",
          type: "REEL proyecto",
          calendarType: "Trabajo realizado",
          dueDate: "13 julio 2026",
          title: "Website Nissan Tulancingo",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram / TikTok",
          format: "1080x1920",
          pieces: "1 reel vertical",
          objective: "Mostrar como trabajo realizado el website gustavomolinanissan.com para reforzar confianza: Ixmati ya ha desarrollado proyectos serios para marcas reconocibles.",
          simpleBrief: "Este reel se hace explorando gustavomolinanissan.com. No es para explicar todo el proyecto. Es para que la gente vea rapido: hicimos un website real, se ve profesional, funciona en celular y computadora, y podemos hacer algo asi para otros negocios.",
          cta: "Quieres una web profesional para tu negocio? Escribenos.",
          refs: [
              "gustavomolinanissan.com",
              "Grabacion de pantalla",
              "Scroll de pagina",
              "Mockup laptop",
              "Mockup celular",
              "Logo/proyecto Nissan Tulancingo"
          ],
          instructions: [
              "Hazlo como reel de portafolio: rapido, limpio y con orgullo profesional.",
              "Empieza con un gancho de 2 segundos: Website desarrollado para Nissan Tulancingo.",
              "Abre gustavomolinanissan.com y muestra 3 escenas: vista desktop, vista movil y detalle de una seccion importante.",
              "Cierra con Ixmati puede desarrollar la web de tu negocio."
          ],
          examples: [
              "Texto en pantalla 1: Website desarrollado para Nissan Tulancingo.",
              "Texto en pantalla 2: Diseno claro, responsive y enfocado en informacion util.",
              "Texto en pantalla 3: Tu negocio tambien puede tener una presencia profesional."
          ],
          deliverableGuide: "Sube video MP4 vertical 1080x1920. Si no tienes video, sube storyboard con capturas y notas de animacion.",
          avoid: [
              "No uses musica que tape el mensaje.",
              "No metas demasiadas transiciones.",
              "No uses pantallas borrosas, cortadas o secciones que se vean incompletas."
          ],
          slides: [
              {
                  title: "Escena 1",
                  text: "Website desarrollado para Nissan Tulancingo",
                  visual: "Abrir gustavomolinanissan.com y mostrar portada en laptop o mockup principal."
              },
              {
                  title: "Escena 2",
                  text: "Vista clara en computadora y celular",
                  visual: "Scroll corto de gustavomolinanissan.com mostrando desktop y mobile."
              },
              {
                  title: "Escena 3",
                  text: "Un sitio profesional ayuda a informar y generar confianza",
                  visual: "Detalle de una seccion importante del sitio publico."
              },
              {
                  title: "Escena 4",
                  text: "Tu negocio tambien puede tener una web profesional",
                  visual: "Cierre con marca Ixmati y CTA."
              }
          ],
          socialCopy: "Desarrollamos un website profesional para Nissan Tulancingo, pensado para verse claro en computadora y celular.\n\nUn sitio bien construido ayuda a presentar información, generar confianza y facilitar el contacto con nuevos clientes.\n\n¿Quieres una web profesional para tu negocio? Escríbenos.\n\n#Website #DiseñoWeb #ProyectoDigital #IxmatiDigital"
      },
      {
          id: "OP-007",
          page: "op-detalle.html?id=OP-007",
          type: "POST servicio",
          calendarType: "Producto",
          dueDate: "15 julio 2026",
          title: "Herramientas que te ahorran tiempo y trabajo",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram",
          format: "1080x1350",
          pieces: "1 post feed",
          objective: "Promocionar sistemas, automatizaciones y herramientas digitales de Ixmati como soluciones para ahorrar tiempo operativo en negocios.",
          simpleBrief: "No lo hagas sonar como programacion complicada. La idea es: si el negocio hace tareas repetidas todos los dias, Ixmati puede crear herramientas para que tarde menos y se equivoque menos.",
          cta: "Cuentanos que tarea repites todos los dias y vemos como automatizarla.",
          refs: [
              "Dashboard simple",
              "Checklist digital",
              "Automatizacion",
              "Calendario",
              "Formulario",
              "Bot"
          ],
          instructions: [
              "Haz un post de servicio con enfoque en dolor real: mucho mensaje, mucho Excel, mucho copiar y pegar.",
              "Muestra antes/despues: antes todo manual, despues una herramienta ordenada.",
              "Usa iconos simples: formulario, alerta, grafica, calendario, WhatsApp.",
              "Debe sentirse util, no futurista ni complicado."
          ],
          examples: [
              "Titulo posible: Herramientas que te ahorran tiempo y trabajo.",
              "Texto de apoyo: Automatiza registros, pedidos, recordatorios o reportes.",
              "Mini beneficios: Menos errores / Mas orden / Menos tareas repetidas."
          ],
          deliverableGuide: "Sube 1 imagen final en PNG o JPG.",
          avoid: [
              "No uses robots futuristas como tema principal.",
              "No expliques codigo.",
              "No prometas que todo se automatiza sin revisar el proceso."
          ],
          slides: [
              {
                  title: "Post unico",
                  text: "Herramientas que te ahorran tiempo y trabajo.\nAutomatiza registros, pedidos, recordatorios o reportes.\nMenos errores, mas orden y menos tareas repetidas.",
                  visual: "Antes/despues: lado izquierdo tareas manuales, lado derecho dashboard/herramienta simple."
              }
          ],
          socialCopy: "Hay tareas que tu negocio repite todos los días y que se pueden volver más simples con herramientas digitales.\n\nAutomatizamos registros, pedidos, recordatorios, reportes y procesos para ahorrar tiempo y reducir errores.\n\nCuéntanos qué tarea repites todos los días y vemos cómo automatizarla.\n\n#Automatización #HerramientasDigitales #Productividad #IxmatiDigital"
      },
      {
          id: "OP-008",
          page: "op-detalle.html?id=OP-008",
          type: "POST",
          calendarType: "Branding",
          dueDate: "20 julio 2026",
          title: "Visita nuestro nuevo sitio web",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram",
          publishUrl: "ixmatiestudio.com",
          format: "1080x1350",
          pieces: "1 post feed",
          objective: "Generar tráfico",
          simpleBrief: "Presentar el nuevo sitio web y sus beneficios para los clientes.",
          cta: "Visita nuestra página",
          refs: [
              "Navegación del sitio.",
              "#PáginaWeb #MarketingDigital"
          ],
          instructions: [
              "Presentar el nuevo sitio web y sus beneficios para los clientes.",
              "Tomas sugeridas: Navegación del sitio.",
              "Copy sugerido: Ahora es más fácil conocer todo lo que hacemos.",
              "CTA: Visita nuestra página"
          ],
          examples: [
              "Ahora es más fácil conocer todo lo que hacemos.",
              "Visita nuestra página",
              "#PáginaWeb #MarketingDigital"
          ],
          deliverableGuide: "Sube imagen final en PNG o JPG.",
          avoid: [
              "No cambies el enfoque indicado por gerencia.",
              "No uses información de cliente sin permiso.",
              "No publiques sin revisar ortografía, fechas y datos de contacto."
          ],
          slides: [
              {
                  title: "Post único",
                  text: "Ahora es más fácil conocer todo lo que hacemos.\nVisita nuestra página",
                  visual: "Navegación del sitio."
              }
          ],
          socialCopy: "Ahora es más fácil conocer todo lo que hacemos en Ixmati.\n\nNuestro nuevo sitio reúne servicios, proyectos y soluciones para marcas que quieren verse mejor, vender más y comunicar con claridad.\n\nVisita nuestra página.\n\n#PáginaWeb #MarketingDigital #Ixmati"
      },
      {
          id: "OP-009",
          page: "op-detalle.html?id=OP-009",
          type: "POST",
          calendarType: "Servicios digitales",
          dueDate: "22 julio 2026",
          title: "Website Gerokally",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram",
          format: "1080x1350",
          pieces: "1 post feed",
          objective: "Mostrar servicios",
          simpleBrief: "Presentar el sitio web desarrollado para Gerokally.",
          cta: "Solicita tu sitio",
          refs: [
              "Mockups.",
              "#SitioWeb"
          ],
          instructions: [
              "Presentar el sitio web desarrollado para Gerokally.",
              "Tomas sugeridas: Mockups.",
              "Copy sugerido: Una página web también vende.",
              "CTA: Solicita tu sitio"
          ],
          examples: [
              "Una página web también vende.",
              "Solicita tu sitio",
              "#SitioWeb"
          ],
          deliverableGuide: "Sube imagen final en PNG o JPG.",
          avoid: [
              "No cambies el enfoque indicado por gerencia.",
              "No uses información de cliente sin permiso.",
              "No publiques sin revisar ortografía, fechas y datos de contacto."
          ],
          slides: [
              {
                  title: "Post único",
                  text: "Una página web también vende.\nSolicita tu sitio",
                  visual: "Mockups."
              }
          ],
          socialCopy: "Una página web también vende cuando comunica bien, carga rápido y guía al cliente al siguiente paso.\n\nCreamos sitios pensados para mostrar servicios, generar confianza y recibir solicitudes de clientes.\n\nSolicita tu sitio.\n\n#SitioWeb #DiseñoWeb #NegociosDigitales #IxmatiDigital"
      },
      {
          id: "OP-010",
          page: "op-detalle.html?id=OP-010",
          type: "POST",
          calendarType: "Contenido de valor",
          dueDate: "24 julio 2026",
          title: "Publicidad digital para conseguir más clientes",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram",
          publishUrl: "ixmatiestudio.com",
          format: "1080x1350",
          pieces: "1 post feed",
          objective: "Educar",
          simpleBrief: "Explicar cómo una estrategia digital ayuda a vender más.",
          cta: "Escríbenos",
          refs: [
              "Gráficos y ejemplos.",
              "#MarketingDigital"
          ],
          instructions: [
              "Explicar cómo una estrategia digital ayuda a vender más.",
              "Tomas sugeridas: Gráficos y ejemplos.",
              "Copy sugerido: No basta con tener un buen negocio, también hay que hacerlo visible.",
              "CTA: Escríbenos"
          ],
          examples: [
              "No basta con tener un buen negocio, también hay que hacerlo visible.",
              "Escríbenos",
              "#MarketingDigital"
          ],
          deliverableGuide: "Sube imagen final en PNG o JPG.",
          avoid: [
              "No cambies el enfoque indicado por gerencia.",
              "No uses información de cliente sin permiso.",
              "No publiques sin revisar ortografía, fechas y datos de contacto."
          ],
          slides: [
              {
                  title: "Post único",
                  text: "No basta con tener un buen negocio, también hay que hacerlo visible.\nEscríbenos",
                  visual: "Gráficos y ejemplos."
              }
          ],
          socialCopy: "No basta con tener un buen negocio, también hay que hacerlo visible.\n\nLa publicidad digital ayuda a llegar a más personas, mostrar tus servicios y generar mensajes de clientes interesados.\n\nEscríbenos.\n\n#MarketingDigital #PublicidadDigital #Clientes #IxmatiDigital"
      },
      {
          id: "OP-011",
          page: "op-detalle.html?id=OP-011",
          type: "REEL instalación",
          calendarType: "Trabajo realizado",
          dueDate: "12 julio 2026",
          title: "Colocación de letras 3D para fachada",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram / TikTok",
          format: "1080x1920",
          pieces: "1 reel vertical",
          objective: "Mostrar una colocación de letras 3D como servicio fuerte de Ixmati tradicional, destacando presencia, visibilidad y acabado profesional en fachada.",
          simpleBrief: "Hazlo como reel de instalación con antes, proceso y resultado. Este contenido debe vender colocación, no solo diseño de letras.",
          cta: "Cotiza letras 3D con instalación para tu negocio.",
          refs: [
              "Fachada comercial",
              "Letras 3D",
              "Instalación",
              "Antes y después",
              "Negocio local"
          ],
          instructions: [
              "Empieza con la fachada antes de colocar las letras.",
              "Muestra el proceso de medición, alineación o instalación sin hacerlo técnico.",
              "Cierra con el resultado final desde calle y un detalle de volumen.",
              "Haz énfasis en presencia, visibilidad y confianza para el negocio."
          ],
          examples: [
              "Texto en pantalla: De fachada simple a marca visible.",
              "Texto en pantalla: Letras 3D con instalación.",
              "Texto en pantalla: Haz que tu negocio se vea profesional desde afuera."
          ],
          deliverableGuide: "Sube reel MP4 vertical o preview de instalación con antes/después.",
          avoid: [
              "No muestres una fachada sin permiso.",
              "No uses tomas movidas o oscuras.",
              "No prometas iluminación si no está incluida en la cotización."
          ],
          slides: [
              {
                  title: "Escena 1",
                  text: "Antes de la colocación",
                  visual: "Fachada limpia antes de instalar letras 3D."
              },
              {
                  title: "Escena 2",
                  text: "Proceso de instalación",
                  visual: "Alineación, medición o colocación de letras."
              },
              {
                  title: "Escena 3",
                  text: "Resultado final",
                  visual: "Fachada terminada con letras 3D visibles."
              },
              {
                  title: "Escena 4",
                  text: "Cotiza tu fachada",
                  visual: "Cierre con marca Ixmati y CTA."
              }
          ],
          socialCopy: "Las letras 3D hacen que una fachada se vea más profesional, visible y memorable.\n\nFabricamos e instalamos letras para negocios que quieren destacar desde la calle y reforzar su identidad visual.\n\nCotiza letras 3D con instalación para tu negocio.\n\n#Letras3D #FachadasComerciales #PublicidadExterior #Ixmati"
      },
      {
          id: "OP-012",
          page: "op-detalle.html?id=OP-012",
          type: "POST producto",
          calendarType: "Producto",
          dueDate: "14 julio 2026",
          title: "Anuncios luminosos para negocios",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram",
          format: "1080x1350",
          pieces: "1 post feed",
          objective: "Promover anuncios luminosos como una solución de alto impacto para negocios que necesitan verse mejor de día y de noche.",
          simpleBrief: "Este post debe sentirse fuerte y comercial. Lo importante es vender visibilidad, presencia y profesionalismo en fachada.",
          cta: "Cotiza tu anuncio luminoso para fachada.",
          refs: [
              "Anuncio luminoso",
              "Caja de luz",
              "Fachada nocturna",
              "Logo iluminado",
              "Negocio visible"
          ],
          instructions: [
              "Usa un visual de fachada con anuncio encendido.",
              "Incluye beneficios cortos: visibilidad, presencia y recordación.",
              "Menciona que se cotiza según medida, material e instalación.",
              "Haz que el anuncio se vea como inversión para negocios, no como decoración."
          ],
          examples: [
              "Título posible: Que tu negocio también se vea de noche.",
              "Texto de apoyo: Anuncios luminosos para fachadas comerciales.",
              "CTA: Cotiza medida e instalación."
          ],
          deliverableGuide: "Sube imagen final en PNG o JPG.",
          avoid: [
              "No uses efectos exagerados de brillo.",
              "No prometas precio fijo sin medidas.",
              "No pongas demasiado texto sobre la fachada."
          ],
          slides: [
              {
                  title: "Post único",
                  text: "Anuncios luminosos para negocios.\nHaz que tu fachada se vea profesional, visible y lista para atraer clientes.",
                  visual: "Fachada con anuncio luminoso encendido y CTA de cotización."
              }
          ],
          socialCopy: "Haz que tu negocio destaque también de noche con un anuncio luminoso diseñado para tu fachada.\n\nLos anuncios iluminados ayudan a que tu marca sea visible, profesional y fácil de ubicar.\n\nCotiza tu anuncio luminoso para fachada.\n\n#AnunciosLuminosos #PublicidadExterior #Fachadas #Ixmati"
      },
      {
          id: "OP-013",
          page: "op-detalle.html?id=OP-013",
          type: "REEL instalación",
          calendarType: "Trabajo realizado",
          dueDate: "18 julio 2026",
          title: "Instalación de lona microperforada",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram / TikTok",
          format: "1080x1920",
          pieces: "1 reel vertical",
          objective: "Mostrar la instalación de lona microperforada para vitrinas o fachadas, explicando su utilidad para comunicar hacia afuera y conservar privacidad.",
          simpleBrief: "Hazlo visual y práctico: superficie, colocación, resultado final. Debe vender instalación y material aplicado en negocio real.",
          cta: "Cotiza lona microperforada para tu negocio.",
          refs: [
              "Microperforado",
              "Vitrina",
              "Instalación",
              "Privacidad",
              "Fachada"
          ],
          instructions: [
              "Muestra la vitrina antes de instalar.",
              "Incluye toma de aplicación o alisado del material.",
              "Graba el resultado desde fuera y desde dentro si se puede.",
              "Cierra explicando que sirve para promociones, imagen y privacidad."
          ],
          examples: [
              "Texto en pantalla: Tus ventanas pueden vender.",
              "Texto en pantalla: Microperforado para fachadas y vitrinas.",
              "Texto en pantalla: Imagen hacia afuera, privacidad hacia adentro."
          ],
          deliverableGuide: "Sube reel MP4 vertical o preview de instalación.",
          avoid: [
              "No uses tomas donde no se entienda el material.",
              "No tapes datos sensibles del negocio si aparecen.",
              "No lo confundas con lona normal."
          ],
          slides: [
              {
                  title: "Escena 1",
                  text: "Antes de instalar",
                  visual: "Vitrina o ventana sin aplicación."
              },
              {
                  title: "Escena 2",
                  text: "Aplicación del microperforado",
                  visual: "Proceso de colocación del material."
              },
              {
                  title: "Escena 3",
                  text: "Resultado desde calle",
                  visual: "Fachada terminada con gráfica visible."
              },
              {
                  title: "Escena 4",
                  text: "Cotiza tu instalación",
                  visual: "CTA con ejemplos de uso."
              }
          ],
          socialCopy: "La lona microperforada es ideal para comunicar promociones o identidad visual en vitrinas sin perder visibilidad desde el interior.\n\nInstalamos soluciones para negocios que quieren aprovechar mejor sus cristales y fachadas.\n\nCotiza lona microperforada para tu negocio.\n\n#LonaMicroperforada #Instalación #PublicidadExterior #Ixmati"
      },
      {
          id: "OP-014",
          page: "op-detalle.html?id=OP-014",
          type: "REEL",
          calendarType: "Servicios / Caso de éxito",
          dueDate: "19 julio 2026",
          title: "Acrílicos – Discípulos",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram / TikTok",
          format: "1080x1920",
          pieces: "1 reel vertical",
          objective: "Mostrar la calidad del trabajo",
          simpleBrief: "Proceso y resultado final del proyecto, destacando acabados y cómo mejora la imagen del negocio.",
          cta: "Solicita tu cotización",
          refs: [
              "Fachada, detalles e instalación.",
              "#Acrílicos #Publicidad #Ixmati"
          ],
          instructions: [
              "Proceso y resultado final del proyecto, destacando acabados y cómo mejora la imagen del negocio.",
              "Tomas sugeridas: Fachada, detalles e instalación.",
              "Copy sugerido: Los pequeños detalles hacen grandes marcas. Así transformamos la imagen de Discípulos.",
              "CTA: Solicita tu cotización"
          ],
          examples: [
              "Los pequeños detalles hacen grandes marcas. Así transformamos la imagen de Discípulos.",
              "Solicita tu cotización",
              "#Acrílicos #Publicidad #Ixmati"
          ],
          deliverableGuide: "Sube reel MP4 vertical o preview con tomas principales.",
          avoid: [
              "No cambies el enfoque indicado por gerencia.",
              "No uses información de cliente sin permiso.",
              "No publiques sin revisar ortografía, fechas y datos de contacto."
          ],
          slides: [
              {
                  title: "Escena 1",
                  text: "Acrílicos – Discípulos",
                  visual: "Fachada, detalles e instalación."
              },
              {
                  title: "Escena 2",
                  text: "Proceso y resultado final del proyecto, destacando acabados y cómo mejora la imagen del negocio.",
                  visual: "Proceso, detalles o aplicación del servicio."
              },
              {
                  title: "Escena 3",
                  text: "Los pequeños detalles hacen grandes marcas. Así transformamos la imagen de Discípulos.",
                  visual: "Resultado final claro y atractivo."
              },
              {
                  title: "Escena 4",
                  text: "Solicita tu cotización",
                  visual: "#Acrílicos #Publicidad #Ixmati"
              }
          ],
          socialCopy: "Los pequeños detalles hacen grandes marcas.\n\nAsí transformamos la imagen de Discípulos con piezas en acrílico pensadas para comunicar mejor y elevar la presentación del espacio.\n\nSolicita tu cotización.\n\n#Acrílicos #Publicidad #Ixmati"
      },
      {
          id: "OP-015",
          page: "op-detalle.html?id=OP-015",
          type: "REEL",
          calendarType: "Trabajos realizados",
          dueDate: "21 julio 2026",
          title: "Colocación de letras 3D – Excapa",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram / TikTok",
          format: "1080x1920",
          pieces: "1 reel vertical",
          objective: "Generar confianza",
          simpleBrief: "Mostrar la instalación completa y el resultado final.",
          cta: "Agenda tu proyecto",
          refs: [
              "Proceso completo.",
              "#Letras3D #PublicidadExterior"
          ],
          instructions: [
              "Mostrar la instalación completa y el resultado final.",
              "Tomas sugeridas: Proceso completo.",
              "Copy sugerido: Cada proyecto representa nuestro compromiso con la calidad.",
              "CTA: Agenda tu proyecto"
          ],
          examples: [
              "Cada proyecto representa nuestro compromiso con la calidad.",
              "Agenda tu proyecto",
              "#Letras3D #PublicidadExterior"
          ],
          deliverableGuide: "Sube reel MP4 vertical o preview con tomas principales.",
          avoid: [
              "No cambies el enfoque indicado por gerencia.",
              "No uses información de cliente sin permiso.",
              "No publiques sin revisar ortografía, fechas y datos de contacto."
          ],
          slides: [
              {
                  title: "Escena 1",
                  text: "Colocación de letras 3D – Excapa",
                  visual: "Proceso completo."
              },
              {
                  title: "Escena 2",
                  text: "Mostrar la instalación completa y el resultado final.",
                  visual: "Proceso, detalles o aplicación del servicio."
              },
              {
                  title: "Escena 3",
                  text: "Cada proyecto representa nuestro compromiso con la calidad.",
                  visual: "Resultado final claro y atractivo."
              },
              {
                  title: "Escena 4",
                  text: "Agenda tu proyecto",
                  visual: "#Letras3D #PublicidadExterior"
              }
          ],
          socialCopy: "Cada proyecto representa nuestro compromiso con la calidad.\n\nEn esta colocación de letras 3D para Excapa cuidamos fabricación, instalación y acabado para lograr una fachada más sólida y profesional.\n\nAgenda tu proyecto.\n\n#Letras3D #PublicidadExterior #Fachadas #Ixmati"
      },
      {
          id: "OP-016",
          page: "op-detalle.html?id=OP-016",
          type: "REEL",
          calendarType: "Servicios",
          dueDate: "23 julio 2026",
          title: "Señalamientos de lámina sublimada",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram / TikTok",
          format: "1080x1920",
          pieces: "1 reel vertical",
          objective: "Mostrar aplicaciones",
          simpleBrief: "Explicar beneficios y aplicaciones del producto.",
          cta: "Cotiza",
          refs: [
              "Detalles del producto.",
              "#Señalética"
          ],
          instructions: [
              "Explicar beneficios y aplicaciones del producto.",
              "Tomas sugeridas: Detalles del producto.",
              "Copy sugerido: La señalización también comunica profesionalismo.",
              "CTA: Cotiza"
          ],
          examples: [
              "La señalización también comunica profesionalismo.",
              "Cotiza",
              "#Señalética"
          ],
          deliverableGuide: "Sube reel MP4 vertical o preview con tomas principales.",
          avoid: [
              "No cambies el enfoque indicado por gerencia.",
              "No uses información de cliente sin permiso.",
              "No publiques sin revisar ortografía, fechas y datos de contacto."
          ],
          slides: [
              {
                  title: "Escena 1",
                  text: "Señalamientos de lámina sublimada",
                  visual: "Detalles del producto."
              },
              {
                  title: "Escena 2",
                  text: "Explicar beneficios y aplicaciones del producto.",
                  visual: "Proceso, detalles o aplicación del servicio."
              },
              {
                  title: "Escena 3",
                  text: "La señalización también comunica profesionalismo.",
                  visual: "Resultado final claro y atractivo."
              },
              {
                  title: "Escena 4",
                  text: "Cotiza",
                  visual: "#Señalética"
              }
          ],
          socialCopy: "La señalización también comunica profesionalismo.\n\nLos señalamientos de lámina sublimada ayudan a orientar, informar y mantener una imagen clara dentro de negocios, oficinas e instituciones.\n\nCotiza.\n\n#Señalética #Señalamientos #Publicidad #Ixmati"
      },
      {
          id: "OP-017",
          page: "op-detalle.html?id=OP-017",
          type: "POST",
          calendarType: "Servicios",
          dueDate: "25 julio 2026",
          title: "Acrílico",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram",
          format: "1080x1350",
          pieces: "1 post feed",
          objective: "Mostrar producto",
          simpleBrief: "Presentar distintas aplicaciones del acrílico.",
          cta: "Solicita una cotización",
          refs: [
              "Detalles del material.",
              "#Acrílico"
          ],
          instructions: [
              "Presentar distintas aplicaciones del acrílico.",
              "Tomas sugeridas: Detalles del material.",
              "Copy sugerido: Elegancia y resistencia para tu marca.",
              "CTA: Solicita una cotización"
          ],
          examples: [
              "Elegancia y resistencia para tu marca.",
              "Solicita una cotización",
              "#Acrílico"
          ],
          deliverableGuide: "Sube imagen final en PNG o JPG.",
          avoid: [
              "No cambies el enfoque indicado por gerencia.",
              "No uses información de cliente sin permiso.",
              "No publiques sin revisar ortografía, fechas y datos de contacto."
          ],
          slides: [
              {
                  title: "Post único",
                  text: "Elegancia y resistencia para tu marca.\nSolicita una cotización",
                  visual: "Detalles del material."
              }
          ],
          socialCopy: "El acrílico aporta elegancia, resistencia y una presentación limpia para piezas de marca, señalética, exhibidores y detalles personalizados.\n\nTrabajamos piezas a la medida para que tu negocio se vea más profesional.\n\nSolicita una cotización.\n\n#Acrílico #Señalética #Publicidad #Ixmati"
      },
      {
          id: "OP-018",
          page: "op-detalle.html?id=OP-018",
          type: "REEL",
          calendarType: "Trabajos realizados",
          dueDate: "26 julio 2026",
          title: "Colocación de anuncio luminoso",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram / TikTok",
          format: "1080x1920",
          pieces: "1 reel vertical",
          objective: "Mostrar experiencia",
          simpleBrief: "Mostrar instalación y resultado final.",
          cta: "Agenda una visita",
          refs: [
              "Proceso e iluminación.",
              "#AnunciosLuminosos"
          ],
          instructions: [
              "Mostrar instalación y resultado final.",
              "Tomas sugeridas: Proceso e iluminación.",
              "Copy sugerido: Haz que tu negocio destaque también de noche.",
              "CTA: Agenda una visita"
          ],
          examples: [
              "Haz que tu negocio destaque también de noche.",
              "Agenda una visita",
              "#AnunciosLuminosos"
          ],
          deliverableGuide: "Sube reel MP4 vertical o preview con tomas principales.",
          avoid: [
              "No cambies el enfoque indicado por gerencia.",
              "No uses información de cliente sin permiso.",
              "No publiques sin revisar ortografía, fechas y datos de contacto."
          ],
          slides: [
              {
                  title: "Escena 1",
                  text: "Colocación de anuncio luminoso",
                  visual: "Proceso e iluminación."
              },
              {
                  title: "Escena 2",
                  text: "Mostrar instalación y resultado final.",
                  visual: "Proceso, detalles o aplicación del servicio."
              },
              {
                  title: "Escena 3",
                  text: "Haz que tu negocio destaque también de noche.",
                  visual: "Resultado final claro y atractivo."
              },
              {
                  title: "Escena 4",
                  text: "Agenda una visita",
                  visual: "#AnunciosLuminosos"
              }
          ],
          socialCopy: "Haz que tu negocio destaque también de noche.\n\nRealizamos colocación de anuncios luminosos para fachadas que necesitan mayor visibilidad y una imagen más profesional.\n\nAgenda una visita.\n\n#AnunciosLuminosos #Instalación #PublicidadExterior #Ixmati"
      },
      {
          id: "OP-019",
          page: "op-detalle.html?id=OP-019",
          type: "REEL",
          calendarType: "Servicios",
          dueDate: "27 julio 2026",
          title: "Rotulación vehicular",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram / TikTok",
          format: "1080x1920",
          pieces: "1 reel vertical",
          objective: "Mostrar la calidad del servicio",
          simpleBrief: "Mostrar la preparación, aplicación del vinil y resultado final, destacando la publicidad móvil y sus beneficios.",
          cta: "Agenda una cotización",
          refs: [
              "Vehículo antes, aplicación y recorrido.",
              "#RotulaciónVehicular #PublicidadMóvil"
          ],
          instructions: [
              "Mostrar la preparación, aplicación del vinil y resultado final, destacando la publicidad móvil y sus beneficios.",
              "Tomas sugeridas: Vehículo antes, aplicación y recorrido.",
              "Copy sugerido: 🚗 Lleva tu marca a todas partes con una rotulación profesional.",
              "CTA: Agenda una cotización"
          ],
          examples: [
              "🚗 Lleva tu marca a todas partes con una rotulación profesional.",
              "Agenda una cotización",
              "#RotulaciónVehicular #PublicidadMóvil"
          ],
          deliverableGuide: "Sube reel MP4 vertical o preview con tomas principales.",
          avoid: [
              "No cambies el enfoque indicado por gerencia.",
              "No uses información de cliente sin permiso.",
              "No publiques sin revisar ortografía, fechas y datos de contacto."
          ],
          slides: [
              {
                  title: "Escena 1",
                  text: "Rotulación vehicular",
                  visual: "Vehículo antes, aplicación y recorrido."
              },
              {
                  title: "Escena 2",
                  text: "Mostrar la preparación, aplicación del vinil y resultado final, destacando la publicidad móvil y sus beneficios.",
                  visual: "Proceso, detalles o aplicación del servicio."
              },
              {
                  title: "Escena 3",
                  text: "🚗 Lleva tu marca a todas partes con una rotulación profesional.",
                  visual: "Resultado final claro y atractivo."
              },
              {
                  title: "Escena 4",
                  text: "Agenda una cotización",
                  visual: "#RotulaciónVehicular #PublicidadMóvil"
              }
          ],
          socialCopy: "Lleva tu marca a todas partes con una rotulación vehicular profesional.\n\nTu unidad puede funcionar como publicidad móvil mientras refuerza la presencia de tu empresa en cada recorrido.\n\nAgenda una cotización.\n\n#RotulaciónVehicular #PublicidadMóvil #PublicidadExterior #Ixmati"
      },
      {
          id: "OP-020",
          page: "op-detalle.html?id=OP-020",
          type: "REEL",
          calendarType: "Servicios",
          dueDate: "28 julio 2026",
          title: "Etiquetas de corte a registro",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram / TikTok",
          format: "1080x1920",
          pieces: "1 reel vertical",
          objective: "Mostrar producto",
          simpleBrief: "Explicar proceso y aplicaciones.",
          cta: "Solicita información",
          refs: [
              "Impresión y corte.",
              "#Etiquetas"
          ],
          instructions: [
              "Explicar proceso y aplicaciones.",
              "Tomas sugeridas: Impresión y corte.",
              "Copy sugerido: Los detalles hacen la diferencia.",
              "CTA: Solicita información"
          ],
          examples: [
              "Los detalles hacen la diferencia.",
              "Solicita información",
              "#Etiquetas"
          ],
          deliverableGuide: "Sube reel MP4 vertical o preview con tomas principales.",
          avoid: [
              "No cambies el enfoque indicado por gerencia.",
              "No uses información de cliente sin permiso.",
              "No publiques sin revisar ortografía, fechas y datos de contacto."
          ],
          slides: [
              {
                  title: "Escena 1",
                  text: "Etiquetas de corte a registro",
                  visual: "Impresión y corte."
              },
              {
                  title: "Escena 2",
                  text: "Explicar proceso y aplicaciones.",
                  visual: "Proceso, detalles o aplicación del servicio."
              },
              {
                  title: "Escena 3",
                  text: "Los detalles hacen la diferencia.",
                  visual: "Resultado final claro y atractivo."
              },
              {
                  title: "Escena 4",
                  text: "Solicita información",
                  visual: "#Etiquetas"
              }
          ],
          socialCopy: "Los detalles hacen la diferencia.\n\nLas etiquetas de corte a registro ayudan a que tus productos se vean más cuidados, más profesionales y listos para destacar en empaque o venta.\n\nSolicita información.\n\n#Etiquetas #StickersPersonalizados #CorteARegistro #Ixmati"
      },
      {
          id: "OP-021",
          page: "op-detalle.html?id=OP-021",
          type: "REEL",
          calendarType: "Servicios",
          dueDate: "29 julio 2026",
          title: "Uniformes personalizados",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram / TikTok",
          format: "1080x1920",
          pieces: "1 reel vertical",
          objective: "Incrementar ventas",
          simpleBrief: "Mostrar uniformes personalizados con bordado y DTF.",
          cta: "Pide tu cotización",
          refs: [
              "Detalles y modelos.",
              "#Uniformes #DTF"
          ],
          instructions: [
              "Mostrar uniformes personalizados con bordado y DTF.",
              "Tomas sugeridas: Detalles y modelos.",
              "Copy sugerido: La imagen de tu equipo también habla de tu empresa.",
              "CTA: Pide tu cotización"
          ],
          examples: [
              "La imagen de tu equipo también habla de tu empresa.",
              "Pide tu cotización",
              "#Uniformes #DTF"
          ],
          deliverableGuide: "Sube reel MP4 vertical o preview con tomas principales.",
          avoid: [
              "No cambies el enfoque indicado por gerencia.",
              "No uses información de cliente sin permiso.",
              "No publiques sin revisar ortografía, fechas y datos de contacto."
          ],
          slides: [
              {
                  title: "Escena 1",
                  text: "Uniformes personalizados",
                  visual: "Detalles y modelos."
              },
              {
                  title: "Escena 2",
                  text: "Mostrar uniformes personalizados con bordado y DTF.",
                  visual: "Proceso, detalles o aplicación del servicio."
              },
              {
                  title: "Escena 3",
                  text: "La imagen de tu equipo también habla de tu empresa.",
                  visual: "Resultado final claro y atractivo."
              },
              {
                  title: "Escena 4",
                  text: "Pide tu cotización",
                  visual: "#Uniformes #DTF"
              }
          ],
          socialCopy: "La imagen de tu equipo también habla de tu empresa.\n\nLos uniformes personalizados ayudan a proyectar orden, confianza y profesionalismo desde el primer contacto con tus clientes.\n\nPide tu cotización.\n\n#Uniformes #DTF #PlayerasPersonalizadas #Ixmati"
      },
      {
          id: "OP-022",
          page: "op-detalle.html?id=OP-022",
          type: "POST",
          calendarType: "Caso de éxito",
          dueDate: "30 julio 2026",
          title: "Caso de éxito – Boritos",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram",
          format: "1080x1350",
          pieces: "1 post feed",
          objective: "Generar confianza",
          simpleBrief: "Mostrar antes y después del proyecto.",
          cta: "Conoce nuestros proyectos",
          refs: [
              "Proceso y resultado.",
              "#CasoDeÉxito"
          ],
          instructions: [
              "Mostrar antes y después del proyecto.",
              "Tomas sugeridas: Proceso y resultado.",
              "Copy sugerido: Cada cliente tiene una historia.",
              "CTA: Conoce nuestros proyectos"
          ],
          examples: [
              "Cada cliente tiene una historia.",
              "Conoce nuestros proyectos",
              "#CasoDeÉxito"
          ],
          deliverableGuide: "Sube imagen final en PNG o JPG.",
          avoid: [
              "No cambies el enfoque indicado por gerencia.",
              "No uses información de cliente sin permiso.",
              "No publiques sin revisar ortografía, fechas y datos de contacto."
          ],
          slides: [
              {
                  title: "Post único",
                  text: "Cada cliente tiene una historia.\nConoce nuestros proyectos",
                  visual: "Proceso y resultado."
              }
          ],
          socialCopy: "Cada cliente tiene una historia, y cada proyecto merece una solución pensada a la medida.\n\nEn este caso de éxito mostramos cómo una buena ejecución visual ayuda a fortalecer la presencia de una marca.\n\nConoce nuestros proyectos.\n\n#CasoDeÉxito #Publicidad #Marca #Ixmati"
      },
      {
          id: "OP-023",
          page: "op-detalle.html?id=OP-023",
          type: "POST",
          calendarType: "Contenido de valor",
          dueDate: "31 julio 2026",
          title: "Diferenciación de la competencia de lonas",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram",
          format: "1080x1350",
          pieces: "1 post feed",
          objective: "Educar",
          simpleBrief: "Comparar tipos de lonas y sus aplicaciones.",
          cta: "Escríbenos",
          refs: [
              "Muestras de materiales.",
              "#Lonas"
          ],
          instructions: [
              "Comparar tipos de lonas y sus aplicaciones.",
              "Tomas sugeridas: Muestras de materiales.",
              "Copy sugerido: No todas las lonas ofrecen el mismo resultado.",
              "CTA: Escríbenos"
          ],
          examples: [
              "No todas las lonas ofrecen el mismo resultado.",
              "Escríbenos",
              "#Lonas"
          ],
          deliverableGuide: "Sube imagen final en PNG o JPG.",
          avoid: [
              "No cambies el enfoque indicado por gerencia.",
              "No uses información de cliente sin permiso.",
              "No publiques sin revisar ortografía, fechas y datos de contacto."
          ],
          slides: [
              {
                  title: "Post único",
                  text: "No todas las lonas ofrecen el mismo resultado.\nEscríbenos",
                  visual: "Muestras de materiales."
              }
          ],
          socialCopy: "No todas las lonas ofrecen el mismo resultado.\n\nLa calidad del material, la impresión y los acabados influyen en cómo se ve tu promoción y cuánto dura expuesta.\n\nEscríbenos.\n\n#Lonas #PublicidadExterior #Impresión #Ixmati"
      },
      {
          id: "OP-024",
          page: "op-detalle.html?id=OP-024",
          type: "POST",
          calendarType: "Servicios",
          dueDate: "1 agosto 2026",
          title: "Reconocimientos de vidrio",
          status: "Pendiente",
          priority: "Media",
          platform: "Facebook / Instagram",
          format: "1080x1350",
          pieces: "1 post feed",
          objective: "Mostrar producto",
          simpleBrief: "Presentar reconocimientos personalizados.",
          cta: "Solicita tu diseño",
          refs: [
              "Detalles del grabado.",
              "#Reconocimientos"
          ],
          instructions: [
              "Presentar reconocimientos personalizados.",
              "Tomas sugeridas: Detalles del grabado.",
              "Copy sugerido: Reconoce los logros con un detalle que perdure.",
              "CTA: Solicita tu diseño"
          ],
          examples: [
              "Reconoce los logros con un detalle que perdure.",
              "Solicita tu diseño",
              "#Reconocimientos"
          ],
          deliverableGuide: "Sube imagen final en PNG o JPG.",
          avoid: [
              "No cambies el enfoque indicado por gerencia.",
              "No uses información de cliente sin permiso.",
              "No publiques sin revisar ortografía, fechas y datos de contacto."
          ],
          slides: [
              {
                  title: "Post único",
                  text: "Reconoce los logros con un detalle que perdure.\nSolicita tu diseño",
                  visual: "Detalles del grabado."
              }
          ],
          socialCopy: "Reconoce los logros con un detalle que perdure.\n\nLos reconocimientos de vidrio son una opción elegante para eventos, escuelas, empresas, premiaciones y agradecimientos especiales.\n\nSolicita tu diseño.\n\n#Reconocimientos #Vidrio #Eventos #Ixmati"
      },
      {
          id: "OP-025",
          page: "op-detalle.html?id=OP-025",
          type: "REEL",
          calendarType: "Trabajos realizados",
          dueDate: "2 agosto 2026",
          title: "Personalización de termos – Pedro de Gante",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram / TikTok",
          format: "1080x1920",
          pieces: "1 reel vertical",
          objective: "Mostrar resultados",
          simpleBrief: "Mostrar el proceso completo de personalización.",
          cta: "Personaliza tus productos",
          refs: [
              "Sublimación y producto final.",
              "#TermosPersonalizados"
          ],
          instructions: [
              "Mostrar el proceso completo de personalización.",
              "Tomas sugeridas: Sublimación y producto final.",
              "Copy sugerido: Los artículos personalizados fortalecen la identidad de cualquier institución.",
              "CTA: Personaliza tus productos"
          ],
          examples: [
              "Los artículos personalizados fortalecen la identidad de cualquier institución.",
              "Personaliza tus productos",
              "#TermosPersonalizados"
          ],
          deliverableGuide: "Sube reel MP4 vertical o preview con tomas principales.",
          avoid: [
              "No cambies el enfoque indicado por gerencia.",
              "No uses información de cliente sin permiso.",
              "No publiques sin revisar ortografía, fechas y datos de contacto."
          ],
          slides: [
              {
                  title: "Escena 1",
                  text: "Personalización de termos – Pedro de Gante",
                  visual: "Sublimación y producto final."
              },
              {
                  title: "Escena 2",
                  text: "Mostrar el proceso completo de personalización.",
                  visual: "Proceso, detalles o aplicación del servicio."
              },
              {
                  title: "Escena 3",
                  text: "Los artículos personalizados fortalecen la identidad de cualquier institución.",
                  visual: "Resultado final claro y atractivo."
              },
              {
                  title: "Escena 4",
                  text: "Personaliza tus productos",
                  visual: "#TermosPersonalizados"
              }
          ],
          socialCopy: "Los artículos personalizados fortalecen la identidad de cualquier institución.\n\nPersonalizamos termos para equipos, escuelas y empresas que buscan detalles útiles, duraderos y con presencia de marca.\n\nPersonaliza tus productos.\n\n#TermosPersonalizados #RegalosCorporativos #Sublimación #Ixmati"
      },
      {
          id: "OP-026",
          page: "op-detalle.html?id=OP-026",
          type: "CARRUSEL educativo",
          calendarType: "Servicio",
          dueDate: "3 agosto 2026",
          title: "Vinil decorativo y microperforado para negocios",
          status: "Pendiente",
          priority: "Media",
          platform: "Facebook / Instagram",
          format: "1080x1350",
          pieces: "5 slides",
          objective: "Explicar usos diferentes del vinil decorativo y la lona microperforada para negocios con ventanas, vitrinas o fachadas.",
          simpleBrief: "Domingo educativo y ligero. Compara usos sin hacerlo técnico: decoración, privacidad, promoción y visibilidad.",
          cta: "Te ayudamos a elegir el material correcto para tu negocio.",
          refs: [
              "Vitrina",
              "Ventana con vinil",
              "Microperforado",
              "Negocio desde calle",
              "Privacidad"
          ],
          instructions: [
              "Explica primero el problema: ventanas vacías o fachadas desaprovechadas.",
              "Diferencia vinil decorativo y microperforado con ejemplos simples.",
              "Muestra usos para promociones, privacidad e identidad visual.",
              "Cierra ofreciendo orientación para elegir material."
          ],
          examples: [
              "Slide 1: Tus ventanas también pueden comunicar.",
              "Slide 2: Vinil decorativo para identidad y ambiente.",
              "Slide 3: Microperforado para vista exterior y privacidad interior."
          ],
          deliverableGuide: "Sube carrusel en PNG/JPG por slide o preview completo.",
          avoid: [
              "No uses lenguaje técnico de instalación.",
              "No confundas vinil decorativo con lona normal.",
              "No satures con fotos de muchos estilos."
          ],
          slides: [
              {
                  title: "Tus ventanas también comunican",
                  text: "Aprovecha vitrinas y cristales para mostrar marca, promociones o información.",
                  visual: "Vitrina de negocio con aplicación visual."
              },
              {
                  title: "Vinil decorativo",
                  text: "Sirve para ambientar, reforzar identidad visual y vestir espacios.",
                  visual: "Cristal o pared con patrón decorativo."
              },
              {
                  title: "Microperforado",
                  text: "Ideal para ventanas donde quieres comunicar hacia afuera y conservar privacidad.",
                  visual: "Ventana con gráfico microperforado."
              },
              {
                  title: "Usos comunes",
                  text: "Promociones, horarios, logos, privacidad, decoración o lanzamientos.",
                  visual: "Iconos o mini ejemplos aplicados."
              },
              {
                  title: "Elegimos el material contigo",
                  text: "Te orientamos según lugar, medida, objetivo y tipo de superficie.",
                  visual: "Cierre con CTA de asesoría."
              }
          ],
          socialCopy: "El vinil decorativo y el microperforado ayudan a vestir vitrinas, comunicar promociones y reforzar la identidad visual de tu negocio.\n\nTe orientamos para elegir el material correcto según superficie, objetivo y ubicación.\n\nTe ayudamos a elegir el material correcto para tu negocio.\n\n#VinilDecorativo #Microperforado #Vitrinas #Ixmati"
      },
      {
          id: "OP-027",
          page: "op-detalle.html?id=OP-027",
          type: "POST producto",
          calendarType: "Producto",
          dueDate: "4 agosto 2026",
          title: "Corte láser MDF para decoración y exhibición",
          status: "Pendiente",
          priority: "Media",
          platform: "Facebook / Instagram",
          format: "1080x1350",
          pieces: "1 post feed",
          objective: "Promover corte láser en MDF para piezas decorativas, exhibidores, nombres, bases, displays y proyectos personalizados.",
          simpleBrief: "Hazlo práctico: muestra posibilidades sin parecer manualidad genérica. Debe verse como solución para negocios, eventos y decoración comercial.",
          cta: "Cotiza corte láser MDF para tu proyecto.",
          refs: [
              "MDF cortado",
              "Decoración",
              "Display",
              "Nombre personalizado",
              "Exhibidor"
          ],
          instructions: [
              "Muestra piezas MDF con corte limpio.",
              "Incluye usos: decoración, exhibición, eventos, nombres o displays.",
              "Habla de personalización por forma y medida.",
              "Cierra con CTA para cotizar proyecto."
          ],
          examples: [
              "Título posible: Piezas MDF a la medida de tu idea.",
              "Texto de apoyo: Corte láser para decoración, displays y eventos.",
              "CTA: Cotiza tu diseño."
          ],
          deliverableGuide: "Sube imagen final en PNG o JPG.",
          avoid: [
              "No uses piezas quemadas o mal terminadas.",
              "No lo hagas ver infantil si va para negocios.",
              "No prometas pintura/acabado si no está incluido."
          ],
          slides: [
              {
                  title: "Post único",
                  text: "Corte láser MDF para decoración, exhibición y proyectos personalizados.\nCreamos piezas a la medida de tu idea.",
                  visual: "Piezas MDF cortadas con detalle y CTA."
              }
          ],
          socialCopy: "El corte láser MDF permite crear piezas decorativas, exhibidores, nombres, detalles personalizados y elementos para puntos de venta.\n\nFabricamos piezas a la medida para proyectos que necesitan precisión y buen acabado.\n\nCotiza corte láser MDF para tu proyecto.\n\n#CorteLáser #MDF #Decoración #Ixmati"
      },
      {
          id: "OP-028",
          page: "op-detalle.html?id=OP-028",
          type: "REEL proceso",
          calendarType: "Proceso",
          dueDate: "5 agosto 2026",
          title: "Stickers corte a registro paso a paso",
          status: "Pendiente",
          priority: "Media",
          platform: "Facebook / Instagram / TikTok",
          format: "1080x1920",
          pieces: "1 reel vertical",
          objective: "Mostrar el proceso de stickers corte a registro para que se entienda la precisión entre impresión, contorno y acabado final.",
          simpleBrief: "Haz un reel de proceso visual: impresión, lectura/corte, desprendido y resultado final. Debe verse limpio y satisfactorio.",
          cta: "Cotiza stickers con corte personalizado.",
          refs: [
              "Impresión de stickers",
              "Plotter de corte",
              "Registro",
              "Desprendido",
              "Planilla final"
          ],
          instructions: [
              "Muestra la hoja impresa antes del corte.",
              "Graba el momento del corte o desprendido.",
              "Enseña el contorno final y varias piezas listas.",
              "Cierra con usos para empaques, marcas y promociones."
          ],
          examples: [
              "Texto en pantalla: Así salen los stickers con corte personalizado.",
              "Texto en pantalla: Impresión, corte y acabado.",
              "Texto en pantalla: Ideales para marcas y empaques."
          ],
          deliverableGuide: "Sube reel MP4 vertical o preview del proceso.",
          avoid: [
              "No uses tomas movidas del plotter.",
              "No expliques parámetros técnicos.",
              "No muestres archivos con datos de cliente sin permiso."
          ],
          slides: [
              {
                  title: "Escena 1",
                  text: "Impresión lista",
                  visual: "Planilla de stickers impresa."
              },
              {
                  title: "Escena 2",
                  text: "Corte a registro",
                  visual: "Plotter cortando el contorno."
              },
              {
                  title: "Escena 3",
                  text: "Desprendido limpio",
                  visual: "Mano separando stickers o sobrante."
              },
              {
                  title: "Escena 4",
                  text: "Stickers listos para tu marca",
                  visual: "Resultado final con varias piezas."
              }
          ],
          socialCopy: "Así se hacen stickers con corte a registro: impresión, alineación, corte y desprendido limpio.\n\nUna buena etiqueta hace que tu producto se vea más cuidado desde el primer vistazo.\n\nCotiza stickers con corte personalizado.\n\n#StickersPersonalizados #CorteARegistro #Etiquetas #Ixmati"
      },
      {
          id: "OP-029",
          page: "op-detalle.html?id=OP-029",
          type: "REEL instalación",
          calendarType: "Trabajo realizado",
          dueDate: "6 agosto 2026",
          title: "Colocación de señalética interior",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram / TikTok",
          format: "1080x1920",
          pieces: "1 reel vertical",
          objective: "Mostrar la colocación de señalética interior en negocio u oficina para reforzar orden, orientación y presencia de marca.",
          simpleBrief: "Este reel debe vender instalación y acabado final. Muestra cómo una pared o área vacía se vuelve útil y profesional.",
          cta: "Cotiza señalética interior para tu espacio.",
          refs: [
              "Señalética interior",
              "Instalación",
              "Pared",
              "Oficina",
              "Marca"
          ],
          instructions: [
              "Muestra el área antes de colocar la señal.",
              "Incluye proceso de alineación o colocación.",
              "Enseña el resultado final con contexto del espacio.",
              "Cierra con CTA para negocios y oficinas."
          ],
          examples: [
              "Texto en pantalla: Ordena y viste tu espacio.",
              "Texto en pantalla: Señalética interior personalizada.",
              "Texto en pantalla: Instalación profesional para negocios."
          ],
          deliverableGuide: "Sube reel MP4 vertical o preview de instalación.",
          avoid: [
              "No grabes espacios desordenados si distraen.",
              "No uses tomas oscuras.",
              "No muestres datos privados de oficinas."
          ],
          slides: [
              {
                  title: "Escena 1",
                  text: "Antes de colocar",
                  visual: "Pared o área interior sin señal."
              },
              {
                  title: "Escena 2",
                  text: "Instalación",
                  visual: "Proceso de alineación o colocación."
              },
              {
                  title: "Escena 3",
                  text: "Resultado final",
                  visual: "Señalética instalada en contexto."
              },
              {
                  title: "Escena 4",
                  text: "Cotiza tu espacio",
                  visual: "CTA de señalética interior."
              }
          ],
          socialCopy: "La señalética interior ayuda a orientar, ordenar espacios y reforzar la imagen de tu marca dentro de oficinas, locales e instituciones.\n\nInstalamos piezas claras, limpias y funcionales para cada espacio.\n\nCotiza señalética interior para tu espacio.\n\n#Señalética #Instalación #Oficinas #Ixmati"
      },
      {
          id: "OP-030",
          page: "op-detalle.html?id=OP-030",
          type: "IMAGEN promocional",
          calendarType: "Promoción",
          dueDate: "7 agosto 2026",
          title: "Playeras y gorras personalizadas para equipos",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram",
          format: "1080x1350",
          pieces: "1 imagen promocional",
          objective: "Promover playeras y gorras personalizadas para equipos, eventos, negocios y activaciones de marca.",
          simpleBrief: "Cierre de mes con promoción clara. Debe verse como solución para grupos, equipos y negocios, no solo como moda.",
          cta: "Cotiza prendas personalizadas para tu equipo.",
          refs: [
              "Playeras personalizadas",
              "Gorras con logo",
              "Equipo",
              "Vinil textil",
              "Marca aplicada"
          ],
          instructions: [
              "Muestra playera y gorra como combo visual.",
              "Incluye usos: equipos, eventos, negocio, activaciones.",
              "Usa CTA claro para cotizar cantidades.",
              "Mantén estilo limpio y comercial."
          ],
          examples: [
              "Título posible: Personaliza prendas para tu equipo.",
              "Texto de apoyo: Playeras y gorras con tu logo.",
              "CTA: Cotiza por cantidad."
          ],
          deliverableGuide: "Sube imagen final en PNG o JPG.",
          avoid: [
              "No uses diseño tipo tienda de ropa sin marca.",
              "No pongas demasiados colores juntos.",
              "No prometas técnicas específicas sin validar prenda."
          ],
          slides: [
              {
                  title: "Post único",
                  text: "Playeras y gorras personalizadas para equipos, eventos y negocios.\nCotiza prendas con tu logo.",
                  visual: "Combo de playera y gorra con logo, fondo limpio y CTA."
              }
          ],
          socialCopy: "Playeras y gorras personalizadas ayudan a que tu equipo se vea uniforme, profesional y alineado a tu marca.\n\nCotizamos prendas para negocios, eventos, escuelas, equipos y campañas promocionales.\n\nCotiza prendas personalizadas para tu equipo.\n\n#PlayerasPersonalizadas #GorrasPersonalizadas #VinilTextil #Ixmati"
      },
      {
          id: "OP-031",
          page: "op-detalle.html?id=OP-031",
          type: "POST / CARRUSEL",
          calendarType: "Contenido de valor",
          dueDate: "10 agosto 2026",
          title: "¿Tu negocio depende demasiado de WhatsApp?",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram",
          format: "1080x1350",
          pieces: "1 carrusel de 5 slides",
          objective: "Generar interés por automatización y plataformas administrativas mostrando señales de desorden operativo.",
          simpleBrief: "Carrusel educativo/comercial para que el dueño de negocio identifique problemas cotidianos: mensajes perdidos, cotizaciones tardías, citas manuales y clientes sin seguimiento.",
          cta: "Descubre qué procesos de tu negocio podemos automatizar.",
          refs: [
              "WhatsApp saturado",
              "Cotizaciones",
              "Citas manuales",
              "Seguimiento de clientes",
              "Automatización"
          ],
          instructions: [
              "Abre con una pregunta directa sobre dependencia de WhatsApp.",
              "Muestra 3 o 4 señales de desorden operativo.",
              "Conecta cada problema con una solución digital simple.",
              "Cierra con CTA hacia automatización y plataformas administrativas."
          ],
          examples: [
              "Señal 1: mensajes que se pierden entre chats.",
              "Señal 2: cotizaciones que tardan demasiado en salir.",
              "Señal 3: clientes que preguntan y ya nadie les da seguimiento."
          ],
          deliverableGuide: "Sube carrusel final en PNG/JPG por slide.",
          avoid: [
              "No culpes al cliente por usar WhatsApp.",
              "No prometas automatización total sin diagnóstico.",
              "No uses capturas reales con datos privados."
          ],
          slides: [
              {
                  title: "Slide 1",
                  text: "¿Tu negocio depende demasiado de WhatsApp?",
                  visual: "Celular con muchos chats y notificaciones."
              },
              {
                  title: "Slide 2",
                  text: "Si se pierden mensajes, cotizaciones o citas, el problema no es vender más: es ordenar mejor.",
                  visual: "Lista de pendientes mezclada con chats."
              },
              {
                  title: "Slide 3",
                  text: "Una plataforma puede registrar solicitudes, guardar datos y dar seguimiento sin depender de memoria.",
                  visual: "Dashboard simple con clientes, citas y cotizaciones."
              },
              {
                  title: "Slide 4",
                  text: "Automatizar no reemplaza tu atención: la hace más rápida, clara y medible.",
                  visual: "Flujo de cliente a sistema y aviso al negocio."
              },
              {
                  title: "Slide 5",
                  text: "Descubre qué procesos de tu negocio podemos automatizar.",
                  visual: "CTA con marca Ixmati Digital."
              }
          ],
          socialCopy: "WhatsApp es útil, pero no debería cargar con toda la operación de tu negocio.\n\nSi se pierden mensajes, las cotizaciones tardan, las citas se manejan a mano o los clientes se quedan sin seguimiento, quizá ya necesitas ordenar tus procesos digitales.\n\nDescubre qué procesos de tu negocio podemos automatizar.\n\n#Automatización #ProcesosDigitales #IxmatiDigital #Negocios"
      },
      {
          id: "OP-032",
          page: "op-detalle.html?id=OP-032",
          type: "REEL",
          calendarType: "Proceso",
          dueDate: "12 agosto 2026",
          title: "Así funciona una plataforma hecha para tu negocio",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram / TikTok",
          format: "Reel vertical 1080x1920",
          pieces: "1 reel",
          objective: "Demostrar capacidad técnica y generar confianza mostrando interfaces desarrolladas por Ixmati.",
          simpleBrief: "Reel dinámico con pantallas de paneles, calendarios, CMS, formularios, tiendas y sistemas de citas. Debe sentirse como demo profesional, no tutorial largo.",
          cta: "Tu operación también puede tener una plataforma propia.",
          refs: [
              "Panel administrativo",
              "Calendario",
              "CMS",
              "Formulario",
              "Tienda",
              "Sistema de citas"
          ],
          instructions: [
              "Usa cortes rápidos de distintas interfaces.",
              "Evita datos privados: usa blur, datos demo o pantallas limpias.",
              "Incluye textos cortos sobre cada función.",
              "Cierra con promesa de plataforma a la medida."
          ],
          examples: [
              "Pantalla 1: agenda y calendario.",
              "Pantalla 2: CMS para editar contenidos.",
              "Pantalla 3: tienda o formulario conectado a seguimiento."
          ],
          deliverableGuide: "Sube reel MP4 vertical y, si aplica, portada JPG.",
          avoid: [
              "No muestres contraseñas, clientes reales ni datos privados.",
              "No grabes demasiado lento.",
              "No uses tecnicismos que el cliente no entienda."
          ],
          slides: [
              {
                  title: "Escena 1",
                  text: "Una plataforma hecha para tu negocio",
                  visual: "Entrada con mockups de varias pantallas."
              },
              {
                  title: "Escena 2",
                  text: "Paneles, calendarios, CMS, formularios, tiendas y citas",
                  visual: "Cortes rápidos de interfaces."
              },
              {
                  title: "Escena 3",
                  text: "Todo adaptado a tu operación real",
                  visual: "Flujo visual de datos entrando a dashboard."
              },
              {
                  title: "Escena 4",
                  text: "Tu operación también puede tener una plataforma propia.",
                  visual: "Cierre con CTA y marca Ixmati Digital."
              }
          ],
          socialCopy: "Una plataforma bien hecha se adapta a cómo trabaja tu negocio.\n\nEn Ixmati desarrollamos paneles, calendarios, CMS, formularios, tiendas, sistemas de citas y herramientas administrativas para ordenar procesos reales.\n\nTu operación también puede tener una plataforma propia.\n\n#PlataformasDigitales #DesarrolloWeb #SistemasAdministrativos #IxmatiDigital"
      },
      {
          id: "OP-033",
          page: "op-detalle.html?id=OP-033",
          type: "POST servicio",
          calendarType: "Servicio",
          dueDate: "14 agosto 2026",
          title: "Tu página web debería trabajar por ti",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram",
          format: "1080x1350",
          pieces: "1 post",
          objective: "Promover desarrollo web orientado a resultados.",
          simpleBrief: "Post comercial para explicar que una web profesional no solo informa: capta clientes, agenda citas, muestra productos y responde dudas aunque el negocio esté cerrado.",
          cta: "Convierte tu sitio web en una herramienta de ventas.",
          refs: [
              "Página web",
              "Clientes",
              "Citas",
              "Productos",
              "Ventas"
          ],
          instructions: [
              "Presenta la web como herramienta activa de ventas.",
              "Incluye beneficios concretos: captar, agendar, mostrar y responder.",
              "Usa visual de sitio web en laptop y celular.",
              "Cierra con CTA comercial."
          ],
          examples: [
              "Texto principal: Tu página web debería trabajar por ti.",
              "Apoyos: capta clientes, agenda citas, muestra productos, responde dudas.",
              "CTA: Convierte tu sitio web en una herramienta de ventas."
          ],
          deliverableGuide: "Sube imagen final en PNG/JPG.",
          avoid: [
              "No lo hagas parecer solo tarjeta de presentación.",
              "No uses mockups genéricos sin contexto de negocio.",
              "No prometas resultados específicos sin pauta o estrategia."
          ],
          slides: [
              {
                  title: "Post único",
                  text: "Tu página web debería trabajar por ti: captar clientes, agendar citas, mostrar productos y responder dudas.",
                  visual: "Mockup de web en laptop y celular con iconos de ventas, citas y contacto."
              }
          ],
          socialCopy: "Tu página web no debería ser solo una tarjeta de presentación.\n\nUna web profesional puede captar clientes, agendar citas, mostrar productos y resolver dudas incluso cuando tu negocio está cerrado.\n\nConvierte tu sitio web en una herramienta de ventas.\n\n#PáginaWeb #DiseñoWeb #VentasDigitales #IxmatiDigital"
      },
      {
          id: "OP-034",
          page: "op-detalle.html?id=OP-034",
          type: "CARRUSEL educativo",
          calendarType: "Contenido de valor",
          dueDate: "17 agosto 2026",
          title: "Landing page, sitio web o plataforma: ¿qué necesita tu negocio?",
          status: "Pendiente",
          priority: "Media",
          platform: "Facebook / Instagram",
          format: "1080x1350",
          pieces: "1 carrusel de 5 slides",
          objective: "Educar al prospecto y facilitar la contratación del servicio correcto.",
          simpleBrief: "Comparar landing page, sitio web y plataforma de forma breve, clara y orientada a decisión. El usuario debe entender cuál le conviene según su necesidad.",
          cta: "Cuéntanos qué quieres resolver y te ayudamos a elegir.",
          refs: [
              "Landing page",
              "Sitio web",
              "Plataforma",
              "Comparativo",
              "Diagnóstico"
          ],
          instructions: [
              "Define cada opción con una frase simple.",
              "Da un caso de uso por opción.",
              "Evita lenguaje técnico innecesario.",
              "Cierra invitando a diagnóstico."
          ],
          examples: [
              "Landing page: ideal para una campaña o servicio específico.",
              "Sitio web: ideal para presentar toda tu empresa.",
              "Plataforma: ideal para administrar procesos internos o clientes."
          ],
          deliverableGuide: "Sube carrusel final en PNG/JPG por slide.",
          avoid: [
              "No des una respuesta única para todos.",
              "No uses demasiado texto por slide.",
              "No confundas plataforma con página informativa."
          ],
          slides: [
              {
                  title: "Slide 1",
                  text: "Landing page, sitio web o plataforma: ¿qué necesita tu negocio?",
                  visual: "Tres tarjetas comparativas."
              },
              {
                  title: "Slide 2",
                  text: "Landing page: para campañas, promociones o una acción específica.",
                  visual: "Página simple con botón de contacto."
              },
              {
                  title: "Slide 3",
                  text: "Sitio web: para presentar tu empresa, servicios, productos y contacto.",
                  visual: "Web con varias secciones."
              },
              {
                  title: "Slide 4",
                  text: "Plataforma: para administrar citas, pedidos, clientes, contenidos o procesos.",
                  visual: "Dashboard administrativo."
              },
              {
                  title: "Slide 5",
                  text: "Cuéntanos qué quieres resolver y te ayudamos a elegir.",
                  visual: "CTA con marca Ixmati Digital."
              }
          ],
          socialCopy: "No todos los negocios necesitan lo mismo.\n\nUna landing page sirve para campañas específicas, un sitio web presenta tu empresa y una plataforma te ayuda a administrar procesos, clientes, citas o pedidos.\n\nCuéntanos qué quieres resolver y te ayudamos a elegir.\n\n#LandingPage #SitioWeb #PlataformaDigital #IxmatiDigital"
      },
      {
          id: "OP-035",
          page: "op-detalle.html?id=OP-035",
          type: "REEL",
          calendarType: "Proceso",
          dueDate: "19 agosto 2026",
          title: "3 tareas que tu negocio ya debería tener automatizadas",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram / TikTok",
          format: "Reel vertical 1080x1920",
          pieces: "1 reel",
          objective: "Generar deseo por automatizaciones aplicadas a negocios reales.",
          simpleBrief: "Reel claro y rápido sobre tres automatizaciones útiles: seguimiento de clientes, recordatorios de citas y registro de solicitudes o pedidos.",
          cta: "Menos tareas repetitivas. Más tiempo para crecer.",
          refs: [
              "Seguimiento de clientes",
              "Recordatorios",
              "Solicitudes",
              "Pedidos",
              "Automatización"
          ],
          instructions: [
              "Abre con gancho de 3 tareas automatizables.",
              "Dedica una escena a cada tarea.",
              "Muestra antes/después de forma visual.",
              "Cierra con beneficio de tiempo y crecimiento."
          ],
          examples: [
              "1. Seguimiento automático de clientes.",
              "2. Recordatorios de citas.",
              "3. Registro ordenado de solicitudes o pedidos."
          ],
          deliverableGuide: "Sube reel MP4 vertical y portada JPG si aplica.",
          avoid: [
              "No lo hagas demasiado técnico.",
              "No uses interfaces con datos reales.",
              "No prometas que todo se automatiza sin evaluar proceso."
          ],
          slides: [
              {
                  title: "Escena 1",
                  text: "3 tareas que tu negocio ya debería tener automatizadas",
                  visual: "Texto grande y fondo de dashboard."
              },
              {
                  title: "Escena 2",
                  text: "Seguimiento de clientes",
                  visual: "Cliente entra a lista de seguimiento."
              },
              {
                  title: "Escena 3",
                  text: "Recordatorios de citas",
                  visual: "Calendario con aviso automático."
              },
              {
                  title: "Escena 4",
                  text: "Registro de solicitudes o pedidos",
                  visual: "Formulario guardando información en panel."
              },
              {
                  title: "Escena 5",
                  text: "Menos tareas repetitivas. Más tiempo para crecer.",
                  visual: "CTA final con marca."
              }
          ],
          socialCopy: "Hay tareas que tu negocio no debería seguir haciendo a mano.\n\nSeguimiento de clientes, recordatorios de citas y registro de solicitudes o pedidos pueden automatizarse para trabajar con más orden y menos errores.\n\nMenos tareas repetitivas. Más tiempo para crecer.\n\n#Automatización #Negocios #ProcesosDigitales #IxmatiDigital"
      },
      {
          id: "OP-036",
          page: "op-detalle.html?id=OP-036",
          type: "CASO DE PROYECTO",
          calendarType: "Trabajo realizado",
          dueDate: "21 agosto 2026",
          title: "Photos Time: de vender fotografías manualmente a una plataforma propia",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram / TikTok",
          format: "Reel o carrusel de proyecto",
          pieces: "1 reel o carrusel",
          objective: "Mostrar que Ixmati desarrolla sistemas completos, no solamente páginas web.",
          simpleBrief: "Caso de proyecto sin revelar información privada. Enfocar en el problema, la solución y las funciones generales: códigos, galerías privadas, selección de fotos, pagos y administración.",
          cta: "¿Tu negocio también necesita digitalizar un proceso?",
          refs: [
              "Photos Time",
              "Galerías privadas",
              "Códigos de acceso",
              "Pagos",
              "Panel administrativo"
          ],
          instructions: [
              "No revelar datos privados, precios internos, usuarios reales ni información sensible.",
              "Presenta el antes: venta manual de fotografías.",
              "Presenta la solución: plataforma propia con acceso y administración.",
              "Cierra comunicando que Ixmati desarrolla sistemas completos."
          ],
          examples: [
              "Antes: selección y venta manual.",
              "Después: galerías privadas por código.",
              "Funciones: selección, pagos y administración desde panel."
          ],
          deliverableGuide: "Sube reel MP4 vertical o carrusel en PNG/JPG.",
          avoid: [
              "No mostrar datos privados del proyecto.",
              "No revelar detalles técnicos internos.",
              "No usar pantallas reales sin revisar información visible."
          ],
          slides: [
              {
                  title: "Escena/Slide 1",
                  text: "Photos Time: de vender fotografías manualmente a una plataforma propia",
                  visual: "Mockup con galería fotográfica limpia."
              },
              {
                  title: "Escena/Slide 2",
                  text: "Acceso por códigos y galerías privadas para cada cliente.",
                  visual: "Pantalla de acceso con código demo."
              },
              {
                  title: "Escena/Slide 3",
                  text: "Selección de fotos, pagos y administración desde un sistema propio.",
                  visual: "Panel demo con módulos generales."
              },
              {
                  title: "Escena/Slide 4",
                  text: "¿Tu negocio también necesita digitalizar un proceso?",
                  visual: "CTA con marca Ixmati Digital."
              }
          ],
          socialCopy: "Photos Time necesitaba algo más que una página web: necesitaba ordenar un proceso completo.\n\nDesarrollamos una plataforma con acceso por códigos, galerías privadas, selección de fotos, pagos y administración, sin depender de un flujo manual para cada cliente.\n\n¿Tu negocio también necesita digitalizar un proceso?\n\n#CasoDeProyecto #PlataformaDigital #DesarrolloWeb #IxmatiDigital"
      },
      {
          id: "OP-037",
          page: "op-detalle.html?id=OP-037",
          type: "POST / CARRUSEL",
          calendarType: "Contenido de valor",
          dueDate: "24 agosto 2026",
          title: "Lo barato sale caro también en una página web",
          status: "Pendiente",
          priority: "Media",
          platform: "Facebook / Instagram",
          format: "1080x1350",
          pieces: "1 carrusel de 5 slides",
          objective: "Defender el valor del desarrollo profesional sin atacar directamente a competidores.",
          simpleBrief: "Carrusel educativo/comercial sobre problemas frecuentes de sitios improvisados: lentitud, mala imagen, falta de seguridad, dependencia de terceros y poca capacidad de crecimiento.",
          cta: "Construye una base digital preparada para crecer.",
          refs: [
              "Sitio lento",
              "Mala imagen",
              "Seguridad",
              "Dependencia",
              "Escalabilidad"
          ],
          instructions: [
              "Habla del problema sin burlarte de competidores.",
              "Usa tono profesional y preventivo.",
              "Menciona riesgos concretos.",
              "Cierra con valor de una base digital bien construida."
          ],
          examples: [
              "Un sitio lento puede hacer que el cliente se vaya.",
              "Una mala imagen digital afecta la confianza.",
              "Si no puede crecer contigo, pronto tendrás que rehacerlo."
          ],
          deliverableGuide: "Sube carrusel final en PNG/JPG por slide.",
          avoid: [
              "No ataques marcas, freelancers ni competidores.",
              "No uses miedo exagerado.",
              "No prometas perfección absoluta."
          ],
          slides: [
              {
                  title: "Slide 1",
                  text: "Lo barato sale caro también en una página web",
                  visual: "Web rota o lenta comparada con web profesional."
              },
              {
                  title: "Slide 2",
                  text: "Lentitud, mala imagen y poca claridad pueden costarte clientes.",
                  visual: "Iconos de velocidad, diseño y confianza."
              },
              {
                  title: "Slide 3",
                  text: "También importa la seguridad, el mantenimiento y la capacidad de crecer.",
                  visual: "Candado, soporte y módulos."
              },
              {
                  title: "Slide 4",
                  text: "Una web profesional es una base digital, no solo una pantalla bonita.",
                  visual: "Estructura de sitio como cimientos."
              },
              {
                  title: "Slide 5",
                  text: "Construye una base digital preparada para crecer.",
                  visual: "CTA con marca Ixmati Digital."
              }
          ],
          socialCopy: "Una página web barata puede salir cara si es lenta, se ve improvisada, no es segura o no puede crecer con tu negocio.\n\nUn desarrollo profesional no solo busca que la web se vea bien: también debe ser clara, funcional y preparada para operar mejor con el tiempo.\n\nConstruye una base digital preparada para crecer.\n\n#DiseñoWeb #DesarrolloWeb #PáginaWeb #IxmatiDigital"
      },
      {
          id: "OP-038",
          page: "op-detalle.html?id=OP-038",
          type: "REEL",
          calendarType: "Proceso",
          dueDate: "26 agosto 2026",
          title: "Del formulario al seguimiento automático",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram / TikTok",
          format: "Reel vertical 1080x1920",
          pieces: "1 reel",
          objective: "Hacer comprensible el valor de una automatización.",
          simpleBrief: "Reel visual mostrando flujo simple: cliente llena formulario, información se guarda, negocio recibe aviso y se inicia seguimiento.",
          cta: "Cada prospecto debería entrar a un proceso, no perderse en un chat.",
          refs: [
              "Formulario",
              "Base de datos",
              "Aviso automático",
              "Seguimiento",
              "Prospectos"
          ],
          instructions: [
              "Mostrar flujo paso a paso con flechas o transiciones.",
              "Usar datos ficticios.",
              "Mantener cada pantalla clara y legible.",
              "Cerrar explicando el beneficio: ningún prospecto perdido."
          ],
          examples: [
              "Cliente llena formulario.",
              "La información se guarda automáticamente.",
              "El negocio recibe aviso y se activa seguimiento."
          ],
          deliverableGuide: "Sube reel MP4 vertical y portada JPG si aplica.",
          avoid: [
              "No mostrar datos reales de clientes.",
              "No usar demasiados pasos.",
              "No hacerlo parecer complicado."
          ],
          slides: [
              {
                  title: "Escena 1",
                  text: "Del formulario al seguimiento automático",
                  visual: "Formulario llenándose con datos demo."
              },
              {
                  title: "Escena 2",
                  text: "La información se guarda en tu sistema.",
                  visual: "Dato entrando a tabla o panel."
              },
              {
                  title: "Escena 3",
                  text: "Tu negocio recibe aviso y sabe qué hacer después.",
                  visual: "Notificación o tarea creada."
              },
              {
                  title: "Escena 4",
                  text: "Cada prospecto debería entrar a un proceso, no perderse en un chat.",
                  visual: "CTA final con flujo completo."
              }
          ],
          socialCopy: "Un formulario puede ser mucho más que una caja para recibir datos.\n\nCuando está conectado a un proceso, la información se guarda, el negocio recibe aviso y el seguimiento empieza sin depender de que alguien revise chats todo el día.\n\nCada prospecto debería entrar a un proceso, no perderse en un chat.\n\n#Automatización #Formularios #Prospectos #IxmatiDigital"
      },
      {
          id: "OP-039",
          page: "op-detalle.html?id=OP-039",
          type: "POST servicio",
          calendarType: "Servicio",
          dueDate: "28 agosto 2026",
          title: "Panel administrativo: controla tu negocio desde un solo lugar",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram",
          format: "1080x1350",
          pieces: "1 post",
          objective: "Vender CMS y sistemas administrativos personalizados.",
          simpleBrief: "Post comercial sobre paneles donde el cliente administra productos, citas, pedidos, contenidos, usuarios o reportes sin depender del desarrollador.",
          cta: "Administra tu operación de forma más simple.",
          refs: [
              "Panel administrativo",
              "CMS",
              "Productos",
              "Citas",
              "Pedidos",
              "Reportes"
          ],
          instructions: [
              "Mostrar un dashboard como centro de control.",
              "Incluir módulos administrables por el cliente.",
              "Comunicar independencia operativa sin decir que nunca necesitará soporte.",
              "Cerrar con CTA simple."
          ],
          examples: [
              "Administra productos, citas, pedidos y contenidos.",
              "Consulta reportes y usuarios desde un solo lugar.",
              "No dependas de pedir cambios pequeños cada semana."
          ],
          deliverableGuide: "Sube imagen final en PNG/JPG.",
          avoid: [
              "No usar pantallas con datos reales.",
              "No saturar el post con demasiadas funciones.",
              "No prometer que todo se puede editar sin límites."
          ],
          slides: [
              {
                  title: "Post único",
                  text: "Panel administrativo: controla productos, citas, pedidos, contenidos, usuarios o reportes desde un solo lugar.",
                  visual: "Dashboard moderno con módulos y CTA."
              }
          ],
          socialCopy: "Un panel administrativo te permite controlar partes clave de tu negocio desde un solo lugar.\n\nProductos, citas, pedidos, contenidos, usuarios o reportes pueden gestionarse en una plataforma hecha a la medida de tu operación.\n\nAdministra tu operación de forma más simple.\n\n#PanelAdministrativo #CMS #SistemasWeb #IxmatiDigital"
      },
      {
          id: "OP-040",
          page: "op-detalle.html?id=OP-040",
          type: "CARRUSEL comercial",
          calendarType: "Promoción",
          dueDate: "31 agosto 2026",
          title: "¿Qué podemos desarrollar para tu empresa?",
          status: "Pendiente",
          priority: "Alta",
          platform: "Facebook / Instagram",
          format: "1080x1350",
          pieces: "1 carrusel de 6 slides",
          objective: "Cerrar el mes con una publicación comercial amplia y captar prospectos.",
          simpleBrief: "Carrusel comercial para presentar los principales servicios digitales de Ixmati y captar prospectos con necesidades variadas.",
          cta: "Cuéntanos qué proceso quieres mejorar.",
          refs: [
              "Sitios web",
              "Tiendas en línea",
              "Sistemas de citas",
              "Plataformas administrativas",
              "Automatizaciones",
              "CMS",
              "Landing pages",
              "Integraciones de pago"
          ],
          instructions: [
              "Presenta servicios digitales como soluciones de negocio.",
              "Agrupa servicios para no saturar cada slide.",
              "Usa visuales de interfaces, web, tienda y automatización.",
              "Cierra con CTA abierto a diagnóstico."
          ],
          examples: [
              "Podemos desarrollar sitios web y landing pages.",
              "También tiendas en línea, sistemas de citas y CMS.",
              "Además plataformas administrativas, automatizaciones e integraciones de pago."
          ],
          deliverableGuide: "Sube carrusel final en PNG/JPG por slide.",
          avoid: [
              "No hacer una lista plana sin jerarquía.",
              "No prometer servicios fuera del alcance digital.",
              "No usar capturas con información privada."
          ],
          slides: [
              {
                  title: "Slide 1",
                  text: "¿Qué podemos desarrollar para tu empresa?",
                  visual: "Collage de interfaces digitales."
              },
              {
                  title: "Slide 2",
                  text: "Sitios web, landing pages y tiendas en línea.",
                  visual: "Mockups web y ecommerce."
              },
              {
                  title: "Slide 3",
                  text: "Sistemas de citas, CMS y plataformas administrativas.",
                  visual: "Calendario, editor y dashboard."
              },
              {
                  title: "Slide 4",
                  text: "Automatizaciones e integraciones de pago para ordenar procesos.",
                  visual: "Flujo automatizado y pago en línea."
              },
              {
                  title: "Slide 5",
                  text: "Desarrollamos herramientas adaptadas a la operación real de tu negocio.",
                  visual: "Sistema conectado a clientes y equipo."
              },
              {
                  title: "Slide 6",
                  text: "Cuéntanos qué proceso quieres mejorar.",
                  visual: "CTA con marca Ixmati Digital."
              }
          ],
          socialCopy: "En Ixmati Digital desarrollamos herramientas para que tu empresa venda, atienda y administre mejor.\n\nSitios web, tiendas en línea, sistemas de citas, plataformas administrativas, automatizaciones, CMS, landing pages e integraciones de pago.\n\nCuéntanos qué proceso quieres mejorar.\n\n#IxmatiDigital #DesarrolloWeb #Automatización #Ecommerce #CMS"
      }
  ];

  function readJson(key, fallback) {
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function postJson(payload) {
    if (!window.fetch) return Promise.resolve(null);
    return fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).then(function (response) {
      if (!response.ok) throw new Error("Backend no disponible");
      return response.json();
    }).catch(function () {
      return null;
    });
  }

  function waitForSupabaseSession() {
    if (!supabaseClient) return Promise.resolve(false);
    if (supabaseSessionReady) return supabaseSessionReady;
    supabaseSessionReady = supabaseClient.auth.getSession().then(function (result) {
      supabaseAuthMissing = !Boolean(result && result.data && result.data.session);
      return !supabaseAuthMissing;
    }).catch(function () {
      supabaseAuthMissing = true;
      return false;
    });
    return supabaseSessionReady;
  }

  function loadSupabaseStore() {
    if (!supabaseClient) return Promise.resolve(null);
    return waitForSupabaseSession().then(function (hasSession) {
      if (!hasSession) {
        remoteError = "No hay sesion activa en Supabase. Cierra sesion y vuelve a entrar.";
        return null;
      }
      return Promise.all([
        supabaseClient.from("production_op_state").select("op_id,state"),
        supabaseClient.from("production_custom_ops").select("op_id,payload").order("created_at", { ascending: true })
      ]);
    }).then(function (results) {
      if (!results) return null;
      if (results[0].error || results[1].error) {
        remoteError = "No se pudo leer Supabase. Revisa la sesion y las politicas RLS.";
        return null;
      }
      var state = {};
      (results[0].data || []).forEach(function (row) {
        state[row.op_id] = row.state || {};
      });
      var customOps = (results[1].data || []).map(function (row) {
        return row.payload;
      }).filter(Boolean);
      return { state: state, customOps: customOps };
    }).catch(function () {
      remoteError = "No se pudo conectar con Supabase.";
      return null;
    });
  }

  function writeSupabaseState(state) {
    if (!supabaseClient) return Promise.resolve(false);
    var rows = Object.keys(state || {}).map(function (opId) {
      return { op_id: opId, state: state[opId] || {}, updated_at: new Date().toISOString() };
    });
    if (!rows.length) return Promise.resolve(true);
    return waitForSupabaseSession().then(function (hasSession) {
      if (!hasSession) return { error: true };
      return supabaseClient.from("production_op_state").upsert(rows, { onConflict: "op_id" });
    }).then(function (result) {
      return !result.error;
    }).catch(function () {
      return false;
    });
  }

  function writeSupabaseCustomOps(ops) {
    if (!supabaseClient) return Promise.resolve(false);
    var rows = (ops || []).map(function (op) {
      return { op_id: op.id, payload: op, updated_at: new Date().toISOString() };
    });
    if (!rows.length) return Promise.resolve(true);
    return waitForSupabaseSession().then(function (hasSession) {
      if (!hasSession) return { error: true };
      return supabaseClient.from("production_custom_ops").upsert(rows, { onConflict: "op_id" });
    }).then(function (result) {
      return !result.error;
    }).catch(function () {
      return false;
    });
  }

  function cacheRemote(data) {
    if (!data || typeof data !== "object") return;
    if (data.state) writeJson(STORAGE_KEY, data.state);
    if (data.customOps) writeJson(CUSTOM_OPS_KEY, data.customOps);
    remoteLoaded = true;
  }

  function ready(callback) {
    if (remoteLoaded) {
      callback();
      return;
    }
    if (supabaseClient) {
      loadSupabaseStore().then(function (data) {
        if (data) {
          cacheRemote(data);
          callback();
          return;
        }
        remoteLoaded = true;
        callback();
      });
      return;
    }
    if (!window.fetch) {
      callback();
      return;
    }
    fetch(API_URL, { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error("Backend no disponible");
        return response.json();
      })
      .then(function (data) {
        cacheRemote(data);
        callback();
      })
      .catch(function () {
        callback();
      });
  }

  function readState() {
    return readJson(STORAGE_KEY, {});
  }

  function writeState(state) {
    writeJson(STORAGE_KEY, state);
    var remote = supabaseClient ? writeSupabaseState(state) : Promise.resolve(false);
    if (!supabaseClient) postJson({ action: "writeState", state: state }).then(cacheRemote);
    return remote;
  }

  function readCustomOps() {
    return readJson(CUSTOM_OPS_KEY, []);
  }

  function writeCustomOps(ops) {
    writeJson(CUSTOM_OPS_KEY, ops);
    writeSupabaseCustomOps(ops);
    postJson({ action: "writeCustomOps", customOps: ops }).then(cacheRemote);
  }

  function allOps() {
    var defaultIds = {};
    defaultOps.forEach(function (op) { defaultIds[op.id] = true; });
    return defaultOps.concat(readCustomOps().filter(function (op) { return op && !defaultIds[op.id]; }));
  }

  function getOp(id) {
    return allOps().filter(function (op) { return op.id === id; })[0] || allOps()[0];
  }

  function nextOpId() {
    var max = allOps().reduce(function (current, op) {
      var match = String(op.id || "").match(/^OP-(\d+)$/);
      return match ? Math.max(current, Number(match[1])) : current;
    }, 0);
    return "OP-" + String(max + 1).padStart(3, "0");
  }

  function opState(id) {
    return readState()[id] || {};
  }

  function saveOpState(id, patch) {
    var state = readState();
    state[id] = Object.assign({}, state[id] || {}, patch);
    return writeState(state);
  }

  function currentStatus(op) {
    return opState(op.id).status || op.status;
  }

  function statusClass(status) {
    if (status === "En diseno") return "design";
    if (status === "En revision" || status === "Enviado a aprobacion") return "review";
    if (status === "Aprobado" || status === "Publicado") return "done";
    if (status === "Cambios solicitados") return "high";
    if (status === "Programado") return "scheduled";
    return "pending";
  }

  function readFiles(files) {
    return Promise.all(files.map(function (file) {
      return new Promise(function (resolve) {
        var reader = new FileReader();
        reader.onload = function () {
          resolve({ name: file.name, type: file.type, data: reader.result, uploadedAt: new Date().toISOString() });
        };
        reader.onerror = function () {
          resolve({ name: file.name, type: file.type, data: "", uploadedAt: new Date().toISOString() });
        };
        reader.readAsDataURL(file);
      });
    }));
  }

  function safeFileName(value) {
    return String(value || "archivo").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "archivo";
  }

  function uploadFilesToSupabase(opId, files) {
    if (!supabaseClient) return Promise.resolve(null);
    var stamp = new Date().toISOString().replace(/[:.]/g, "-");
    return waitForSupabaseSession().then(function (hasSession) {
      if (!hasSession) throw new Error("No hay sesion activa en Supabase. Cierra sesion y vuelve a entrar.");
      return Promise.all(files.map(function (file, index) {
      var path = opId + "/" + stamp + "-" + index + "-" + safeFileName(file.name);
      return supabaseClient.storage.from(DELIVERY_BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "application/octet-stream"
      }).then(function (result) {
        if (result.error) throw result.error;
        var publicData = supabaseClient.storage.from(DELIVERY_BUCKET).getPublicUrl(path);
        return {
          name: file.name,
          type: file.type,
          size: file.size,
          path: path,
          data: publicData && publicData.data ? publicData.data.publicUrl : "",
          uploadedAt: new Date().toISOString()
        };
      });
      }));
    });
  }

  function uploadDelivery(opId, notes, files) {
    if (supabaseClient) {
      return waitForSupabaseSession().then(function (hasSession) {
        if (!hasSession) throw new Error("No hay sesion activa en Supabase. Cierra sesion y vuelve a entrar.");
        return uploadFilesToSupabase(opId, files).then(function (attachments) {
        var state = opState(opId);
        var deliveries = state.deliveries || [];
        deliveries.push({ notes: notes, files: attachments, status: "Pendiente de revision", createdAt: new Date().toISOString(), approvalNote: "" });
        return saveOpState(opId, { deliveries: deliveries, status: "Enviado a aprobacion" }).then(function (ok) {
          if (!ok) throw new Error("No se pudo guardar el estado en Supabase.");
          return readState();
        });
        });
      }).catch(function (error) {
        return { error: error && error.message ? error.message : "No se pudo subir el archivo a Supabase." };
      });
    }
    return uploadDeliveryToBackend(opId, notes, files);
  }

  function uploadDeliveryToBackend(opId, notes, files) {
    if (!window.fetch || !window.FormData) {
      return readFiles(files).then(function (attachments) {
        var state = opState(opId);
        var deliveries = state.deliveries || [];
        deliveries.push({ notes: notes, files: attachments, status: "Pendiente de revision", createdAt: new Date().toISOString(), approvalNote: "" });
        saveOpState(opId, { deliveries: deliveries, status: "Enviado a aprobacion" });
        return readState();
      });
    }
    var formData = new FormData();
    formData.append("action", "uploadDelivery");
    formData.append("opId", opId);
    formData.append("notes", notes);
    files.forEach(function (file) {
      formData.append("files[]", file);
    });
    return fetch(API_URL, { method: "POST", body: formData })
      .then(function (response) {
        if (!response.ok) throw new Error("Backend no disponible");
        return response.json();
      })
      .then(function (data) {
        cacheRemote(data);
        return readState();
      })
      .catch(function () {
        return readFiles(files).then(function (attachments) {
          var state = opState(opId);
          var deliveries = state.deliveries || [];
          deliveries.push({ notes: notes, files: attachments, status: "Pendiente de revision", createdAt: new Date().toISOString(), approvalNote: "" });
          saveOpState(opId, { deliveries: deliveries, status: "Enviado a aprobacion" });
          return readState();
        });
      });
  }

  window.IxmatiProduction = {
    supabaseEnabled: supabaseEnabled,
    supabaseClient: supabaseClient,
    checklist: checklist,
    statuses: statuses,
    defaultOps: defaultOps,
    ready: ready,
    allOps: allOps,
    getOp: getOp,
    nextOpId: nextOpId,
    opState: opState,
    saveOpState: saveOpState,
    readState: readState,
    writeState: writeState,
    readCustomOps: readCustomOps,
    writeCustomOps: writeCustomOps,
    currentStatus: currentStatus,
    statusClass: statusClass,
    readFiles: readFiles,
    remoteError: function () { return remoteError; },
    uploadDelivery: uploadDelivery
  };
})();
