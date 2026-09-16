(function () {
  var AUTH_KEY = "ixmati_adminweb_auth";
  var USER_KEY = "ixmati_adminweb_user";
  var USERS = {
    Admin: { password: "ixmati2026", role: "superadmin", home: "admin-su.html" },
    Jadith: { password: "ixmati2026", role: "vip", home: "index.html" },
    flor: { password: "ixmati2026", role: "flor", home: "produccion-flor.html" },
    karen: { password: "ixmati2026", role: "student", home: "academia.html" },
    xochitl: { password: "ixmati2026", role: "student", home: "academia.html" },
    adan: { password: "ixmati2026", role: "student", home: "academia.html" },
    jadith: { password: "ixmati2026", role: "student", home: "academia.html" }
  };
  var normalizedPath = window.location.pathname.toLowerCase();
  var ADMIN_BASE = normalizedPath.indexOf("/adminweb/") !== -1 || normalizedPath.indexOf("/ixmati/") !== -1 ? "/adminweb" : "";
  var ACADEMY_ALLOWED = [
    "academia.html",
    "modulo-estudio-visual.html",
    "modulo-web.html",
    "modulo-marketing.html",
    "modulo-comercial.html",
    "modulo-operacion.html",
    "curso.html",
    "practica.html",
    "evaluacion.html",
    "tiendas.html",
    "servicios.html",
    "restaurantes.html",
    "redes-sociales.html"
  ];
  var PRODUCTION_DOCS_ALLOWED = ["op-001.html", "op-002.html", "op-003.html", "op-004.html", "op-detalle.html"];
  var FLOR_PRODUCTION_ALLOWED = ["produccion-flor.html", "calendario-produccion.html"].concat(PRODUCTION_DOCS_ALLOWED);
  var SUPERADMIN_ALLOWED = PRODUCTION_DOCS_ALLOWED.concat(["admin-su.html", "progreso-estudiantes.html", "produccion-admin.html", "cms-op.html", "calendario-produccion.html"]);
  var ADMIN_ONLY_ALLOWED = ["admin-su.html", "progreso-estudiantes.html", "produccion-admin.html", "cms-op.html", "calendario-produccion.html"];
  var FLOR_ONLY_ALLOWED = FLOR_PRODUCTION_ALLOWED;

  function isAuthenticated() {
    return sessionStorage.getItem(AUTH_KEY) === "ok" || localStorage.getItem(AUTH_KEY) === "ok";
  }

  function readStoredUser() {
    var raw = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
    if (!raw) {
      return isAuthenticated() ? { username: "Jadith", role: "vip", home: "index.html" } : null;
    }
    try {
      return normalizeUser(JSON.parse(raw));
    } catch (error) {
      return { username: "Jadith", role: "vip", home: "index.html" };
    }
  }

  function userSlug(user) {
    var value = String((user && (user.username || user.email || user.fullName)) || "").toLowerCase();
    return value.split("@")[0];
  }

  function normalizeUser(user) {
    if (userSlug(user) === "leslie" || user.role === "leslie") {
      user.role = "blocked";
      user.home = "login.html";
    }
    if (userSlug(user) === "flor") {
      user.role = "flor";
      user.home = "produccion-flor.html";
    }
    if (userSlug(user) === "admin" || userSlug(user) === "supersu") {
      user.role = "superadmin";
      user.home = "admin-su.html";
    }
    return user;
  }

  function currentRole() {
    var user = readStoredUser();
    return user && user.role ? user.role : "vip";
  }

  function roleHome(role) {
    if (role === "superadmin" || role === "instructor") return ADMIN_BASE + "/admin-su.html";
    if (role === "flor") return ADMIN_BASE + "/produccion-flor.html";
    if (role === "student") return ADMIN_BASE + "/academia.html";
    if (role === "blocked") return ADMIN_BASE + "/login.html";
    return ADMIN_BASE + "/index.html";
  }

  function getPageName(pathname) {
    return (pathname.split("?")[0].split("#")[0].split("/").pop() || "index.html").toLowerCase();
  }

  function canAccess(pathname) {
    var role = currentRole();
    if (/\/adminweb\/ixmati-digital-2(?:\/|$)/i.test(pathname)) {
      return ["vip", "superadmin", "instructor"].indexOf(role) !== -1;
    }
    var page = getPageName(pathname);
    if (role === "blocked" || role === "leslie") return false;
    if (role === "superadmin" || role === "instructor") return SUPERADMIN_ALLOWED.indexOf(page) !== -1;
    if (role === "flor") return FLOR_ONLY_ALLOWED.indexOf(page) !== -1;
    if (role === "student") return ACADEMY_ALLOWED.indexOf(page) !== -1;
    if (role === "vip" && (FLOR_PRODUCTION_ALLOWED.indexOf(page) !== -1 || ADMIN_ONLY_ALLOWED.indexOf(page) !== -1)) return false;
    return true;
  }

  function persistLogin(payloadUser, remember) {
      var payload = JSON.stringify(payloadUser);
      sessionStorage.setItem(AUTH_KEY, "ok");
      sessionStorage.setItem(USER_KEY, payload);
      if (remember) {
        localStorage.setItem(AUTH_KEY, "ok");
        localStorage.setItem(USER_KEY, payload);
      } else {
        localStorage.removeItem(AUTH_KEY);
        localStorage.removeItem(USER_KEY);
      }
      return true;
  }

  function supabaseConfigured() {
    return Boolean(window.supabase && window.IxmatiSupabaseConfig && window.IxmatiSupabaseConfig.url && window.IxmatiSupabaseConfig.anonKey);
  }

  function hasSupabaseSession() {
    if (!supabaseConfigured()) return Promise.resolve(true);
    return window.supabase.createClient(window.IxmatiSupabaseConfig.url, window.IxmatiSupabaseConfig.anonKey).auth.getSession().then(function (result) {
      return Boolean(result && result.data && result.data.session);
    }).catch(function () {
      return false;
    });
  }

  function clearLocalLogin() {
    sessionStorage.removeItem(AUTH_KEY);
    sessionStorage.removeItem(USER_KEY);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(USER_KEY);
  }

  function localUserFor(username) {
    return USERS[username] || USERS[String(username || "").toLowerCase()];
  }

  function login(username, password, remember) {
    var slug = String(username || "").toLowerCase().split("@")[0];
    if (slug === "leslie") return false;
    var user = localUserFor(username);
    if (user && password === user.password) {
      if (window.IxmatiAcademySupabase && window.IxmatiAcademySupabase.enabled) {
        return window.IxmatiAcademySupabase.signIn(username, password).then(function (supabaseUser) {
          if (supabaseUser) return persistLogin(supabaseUser, remember);
          if (["flor", "superadmin", "instructor"].indexOf(user.role) !== -1) return "supabase_auth_failed";
          return persistLogin({ username: slug || username, role: user.role, home: user.home }, remember);
        });
      }
      return persistLogin({ username: slug || username, role: user.role, home: user.home }, remember);
    }
    if (window.IxmatiAcademySupabase && window.IxmatiAcademySupabase.enabled) {
      return window.IxmatiAcademySupabase.signIn(username, password).then(function (supabaseUser) {
        if (!supabaseUser) return false;
        return persistLogin(supabaseUser, remember);
      });
    }
    return false;
  }

  function signOutSupabase() {
    if (window.IxmatiAcademySupabase && window.IxmatiAcademySupabase.enabled) {
      return window.IxmatiAcademySupabase.signOut();
    }
    if (!supabaseConfigured()) {
      return Promise.resolve();
    }
    return window.supabase.createClient(window.IxmatiSupabaseConfig.url, window.IxmatiSupabaseConfig.anonKey).auth.signOut().catch(function () {});
  }

  function logout() {
    clearLocalLogin();
    signOutSupabase().then(function () {
      window.location.href = ADMIN_BASE + "/login.html";
    });
  }

  function safeNext(rawNext) {
    var role = currentRole();
    if (!rawNext) return roleHome(role);
    var decoded = decodeURIComponent(rawNext);
    if (decoded.indexOf("http://") === 0 || decoded.indexOf("https://") === 0 || decoded.indexOf("//") === 0) {
      return roleHome(role);
    }
    if (ADMIN_BASE && (decoded === ADMIN_BASE || decoded.indexOf(ADMIN_BASE + "/") === 0)) {
      if (!canAccess(new URL(decoded, window.location.origin).pathname)) return roleHome(role);
      return decoded;
    }
    if (ADMIN_BASE && decoded.indexOf("/") === 0 && canAccess(decoded)) {
      return decoded;
    }
    if (!ADMIN_BASE && decoded.indexOf("/") === 0) {
      if (!canAccess(decoded)) return roleHome(role);
      return decoded;
    }
    if (decoded.indexOf("/") === 0) {
      return roleHome(role);
    }
    if (!canAccess(decoded)) return roleHome(role);
    return decoded;
  }

  function filterUnauthorizedLinks() {
    if (currentRole() !== "flor" && currentRole() !== "student" && currentRole() !== "superadmin" && currentRole() !== "instructor") return;
    document.addEventListener("DOMContentLoaded", function () {
      Array.prototype.forEach.call(document.querySelectorAll("a[href]"), function (link) {
        var href = link.getAttribute("href");
        if (!href || href.indexOf("#") === 0 || href.indexOf("mailto:") === 0 || href.indexOf("tel:") === 0) return;
        var targetPath = new URL(href, window.location.href).pathname;
        if (!canAccess(targetPath)) {
          link.remove();
        }
      });
    });
  }

  function injectLogoutButton() {
    if (document.getElementById("adminweb-logout-btn")) return;
    var btn = document.createElement("button");
    btn.id = "adminweb-logout-btn";
    btn.type = "button";
    btn.textContent = "Cerrar sesion";
    btn.style.cssText = [
      "position:fixed",
      "right:16px",
      "bottom:16px",
      "z-index:99999",
      "border:0",
      "border-radius:999px",
      "padding:10px 14px",
      "font:600 13px/1.2 -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif",
      "background:#111827",
      "color:#ffffff",
      "box-shadow:0 8px 24px rgba(0,0,0,.18)",
      "cursor:pointer"
    ].join(";");
    btn.addEventListener("click", logout);
    document.addEventListener("DOMContentLoaded", function () {
      document.body.appendChild(btn);
    });
  }

  var path = window.location.pathname;
  var isLoginPage = /\/adminweb\/login\.html$/i.test(path) || /\/login\.html$/i.test(path);

  window.AdminWebAuth = {
    login: login,
    logout: logout,
    isAuthenticated: isAuthenticated,
    safeNext: safeNext,
    currentUser: readStoredUser,
    canAccess: canAccess
  };

  if (isLoginPage) {
    if (isAuthenticated()) {
      var qs = new URLSearchParams(window.location.search);
      if (currentRole() === "blocked" || currentRole() === "leslie") {
        logout();
        return;
      }
      if (["flor", "superadmin", "instructor"].indexOf(currentRole()) !== -1 && supabaseConfigured()) {
        hasSupabaseSession().then(function (hasSession) {
          if (!hasSession) {
            clearLocalLogin();
            return;
          }
          window.location.replace(safeNext(qs.get("next")));
        });
        return;
      }
      window.location.replace(safeNext(qs.get("next")));
    }
    return;
  }

  if (!isAuthenticated()) {
    var next = window.location.pathname + window.location.search + window.location.hash;
    window.location.replace(ADMIN_BASE + "/login.html?next=" + encodeURIComponent(next));
    return;
  }

  if (!canAccess(path)) {
    window.location.replace(roleHome(currentRole()));
    return;
  }

  filterUnauthorizedLinks();
  injectLogoutButton();
})();
