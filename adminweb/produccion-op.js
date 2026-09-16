(function () {
  var api = window.IxmatiProduction;
  var explicitId = document.body.getAttribute("data-op-id");
  var queryId = new URLSearchParams(window.location.search).get("id");
  var op = null;
  var root = document.getElementById("opRoot");
  var user = window.AdminWebAuth && window.AdminWebAuth.currentUser && window.AdminWebAuth.currentUser();
  var isAdmin = user && (user.role === "superadmin" || user.role === "instructor");

  function syncHeaderForRole() {
    var brand = document.querySelector(".topbar .brand");
    var nav = document.querySelector(".topbar nav");
    if (!nav) return;
    if (isAdmin) {
      if (brand) {
        brand.setAttribute("href", "produccion-admin.html");
        var title = brand.querySelector("strong");
        if (title) title.textContent = "Produccion Admin";
      }
      nav.innerHTML = '<a href="produccion-admin.html">Produccion admin</a><a href="calendario-produccion.html">Calendario</a><a href="cms-op.html">CMS de OPs</a><a href="admin-su.html">Panel SU</a>';
      return;
    }
    if (user && user.role === "flor") {
      if (brand) {
        brand.setAttribute("href", "produccion-flor.html");
        var florTitle = brand.querySelector("strong");
        if (florTitle) florTitle.textContent = "Produccion Flor";
      }
      nav.innerHTML = '<a href="produccion-flor.html">Tablero</a><a href="calendario-produccion.html">Calendario</a>';
    }
  }

  function render() {
    var state = api.opState(op.id);
    var checks = state.checks || {};
    var deliveries = state.deliveries || [];
    var current = api.currentStatus(op);
    document.title = op.id + " - " + op.title;
    root.innerHTML = [
      '<section class="hero">',
      '<div class="panel"><p class="eyebrow">' + op.id + ' - ' + op.type + '</p><h1>' + op.title + '</h1><p>' + op.objective + '</p></div>',
      '<aside class="panel"><p class="eyebrow">Produccion</p><label>Estado</label><select id="statusSelect">' + allowedStatuses(current).map(function (status) { return '<option value="' + status + '" ' + (status === current ? "selected" : "") + '>' + status + '</option>'; }).join("") + '</select><div class="kpi"><span>Fecha</span><strong>' + (op.dueDate || "Sin fecha") + '</strong></div><div class="kpi"><span>Formato</span><strong>' + op.format + '</strong></div><div class="kpi"><span>Piezas</span><strong>' + op.pieces + '</strong></div><div class="kpi"><span>Plataforma</span><strong>' + (op.platform || "Multi") + '</strong></div></aside>',
      '</section>',
      '<section class="detail-layout">',
      '<article class="panel">' + renderGuide(op) + renderSocialCopy(op) + '<h2>Slides y copy</h2><div class="slide-list">' + op.slides.map(renderSlide).join("") + '</div></article>',
      '<aside class="side">',
      '<section class="panel"><h2>CTA</h2><p>' + op.cta + '</p></section>',
      '<section class="panel"><h2>Referencias</h2><div class="chips">' + op.refs.map(function (ref) { return '<span>' + ref + '</span>'; }).join("") + '</div></section>',
      '<section class="panel"><h2>Entrega esperada</h2><p>' + (op.deliverableGuide || defaultDeliverable(op)) + '</p></section>',
      '<section class="panel"><h2>Checklist</h2><div class="checklist">' + api.checklist.map(function (item) { return '<label><input type="checkbox" data-check="' + item + '" ' + (checks[item] ? "checked" : "") + '> ' + item + '</label>'; }).join("") + '</div></section>',
      renderDeliveriesPanel(op, deliveries),
      '</aside>',
      '</section>'
    ].join("");
    bind();
  }

  function renderGuide(op) {
    return [
      '<section class="work-guide">',
      '<p class="eyebrow">Guia facil para producir</p>',
      '<h2>Que se tiene que hacer</h2>',
      '<p>' + (op.simpleBrief || defaultBrief(op)) + '</p>',
      renderList("Pasos exactos", op.instructions || defaultInstructions(op)),
      renderList("Ejemplos que puedes usar", op.examples || defaultExamples(op)),
      renderList("Evita esto", op.avoid || defaultAvoid()),
      '</section>'
    ].join("");
  }

  function renderSocialCopy(op) {
    var copy = op.socialCopy || defaultSocialCopy(op);
    return [
      '<section class="social-copy">',
      '<div class="social-copy-head"><div><p class="eyebrow">Copy para redes sociales</p><h2>Texto listo para publicar</h2></div><button class="button" type="button" data-copy-social>Copiar copy</button></div>',
      '<textarea id="socialCopyText" rows="8" readonly>' + escapeHtml(copy) + '</textarea>',
      '<p class="copy-status" id="copyStatus"></p>',
      '</section>'
    ].join("");
  }

  function defaultSocialCopy(op) {
    var lines = [];
    if (op.slides && op.slides.length) lines.push(op.slides.map(function (slide) { return slide.text; }).join("\n"));
    if (op.cta) lines.push(op.cta);
    return lines.filter(Boolean).join("\n\n");
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char];
    });
  }

  function renderList(title, rows) {
    return '<div class="guide-block"><h3>' + title + '</h3><ul>' + rows.map(function (row) { return '<li>' + row + '</li>'; }).join("") + '</ul></div>';
  }

  function defaultBrief(op) {
    return "Convierte el objetivo de esta OP en una pieza clara y facil de entender. Si algo suena tecnico, cambialo por palabras simples para que un dueno de negocio lo entienda rapido.";
  }

  function defaultInstructions(op) {
    return [
      "Lee primero el objetivo y el CTA para entender que accion queremos provocar.",
      "Usa el titulo de cada slide como idea principal y el texto como apoyo, no como bloque gigante.",
      "Haz que el diseno se entienda sin explicacion: jerarquia clara, buen contraste y espacio suficiente.",
      "Cuando termines, cambia el estado a En revision o Enviado a aprobacion y sube el archivo final."
    ];
  }

  function defaultExamples(op) {
    return [
      "Si el texto se ve largo, dividelo en frases cortas.",
      "Puedes usar mockups, iconos y capturas limpias para explicar mejor.",
      "El cierre debe dejar claro que la persona puede pedir informacion."
    ];
  }

  function defaultAvoid() {
    return [
      "No pongas texto muy pequeno.",
      "No uses imagenes borrosas.",
      "No cambies el mensaje principal sin dejar nota para revision."
    ];
  }

  function defaultDeliverable(op) {
    return op.type && op.type.indexOf("REEL") !== -1 ? "Sube video MP4 vertical o un preview con storyboard si todavia falta material." : "Sube imagen final en PNG o JPG, y editable si lo tienes listo.";
  }

  function renderSlide(slide, index) {
    return '<section class="slide"><div class="slide-num">Slide ' + (index + 1) + '</div><div><h3>' + slide.title + '</h3>' + (slide.subtitle ? '<p><strong>Subtitulo:</strong> ' + slide.subtitle + '</p>' : '') + '<p><strong>Texto:</strong><br>' + slide.text + '</p><p><strong>Visual:</strong> ' + slide.visual + '</p></div></section>';
  }

  function renderDelivery(item, index) {
    return '<div class="delivery"><strong>Entrega ' + (index + 1) + ' - ' + item.status + '</strong>' + renderFiles(item.files || []) + (item.notes ? '<p>Notas: ' + item.notes + '</p>' : '') + (item.approvalNote ? '<p>Revision Admin: ' + item.approvalNote + '</p>' : '') + '</div>';
  }

  function renderDeliveriesPanel(currentOp, deliveries) {
    if (currentOp.noApproval) {
      return '<section class="panel no-approval"><p class="eyebrow">Entrega directa</p><h2>Sin aprobación</h2><p>Flor publica cuando el estado sea <strong>Listo</strong>. Sube el archivo final en la carpeta acordada y cambia el estado a Publicado al salir.</p></section>';
    }
    return '<section class="panel"><h2>Entregables</h2><p>Sube archivos finales o avances para aprobacion. Si el archivo pesa mucho, exporta preview MP4/PNG/JPG y deja nota.</p><textarea id="deliveryNotes" rows="3" placeholder="Notas para revision"></textarea><input id="deliveryFiles" type="file" multiple><button class="button primary" id="sendDelivery" type="button">Enviar a aprobacion</button><div id="deliveryStatus" class="delivery-status"></div><div class="deliveries">' + (deliveries.length ? deliveries.map(renderDelivery).join("") : '<div class="delivery">Sin entregables cargados.</div>') + '</div></section>';
  }

  function renderFiles(files) {
    if (!files.length) return "";
    return '<div class="file-list">' + files.map(function (file) {
      return file.data ? '<a href="' + file.data + '" download="' + file.name + '">' + file.name + '</a>' : '<span>' + file.name + '</span>';
    }).join("") + '</div>';
  }

  function bind() {
    var copyButton = document.querySelector("[data-copy-social]");
    if (copyButton) {
      copyButton.addEventListener("click", function () {
        var textarea = document.getElementById("socialCopyText");
        var status = document.getElementById("copyStatus");
        textarea.focus();
        textarea.select();
        var done = false;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(textarea.value).then(function () {
            status.textContent = "Copy copiado.";
          }).catch(function () {
            document.execCommand("copy");
            status.textContent = "Copy seleccionado para copiar.";
          });
          done = true;
        }
        if (!done) {
          document.execCommand("copy");
          status.textContent = "Copy seleccionado para copiar.";
        }
      });
    }
    document.getElementById("statusSelect").addEventListener("change", function (event) {
      if (!isAdmin && !op.noApproval && ["Aprobado", "Programado", "Publicado"].indexOf(event.target.value) !== -1) return;
      api.saveOpState(op.id, { status: event.target.value }).then(function (ok) {
        if (api.supabaseEnabled && !ok) {
          window.alert("No se pudo guardar el estado en Supabase. Revisa las politicas SQL y vuelve a intentar.");
          return;
        }
        render();
      });
    });
    Array.prototype.forEach.call(document.querySelectorAll("[data-check]"), function (input) {
      input.addEventListener("change", function () {
        var state = api.opState(op.id);
        var checks = state.checks || {};
        checks[input.getAttribute("data-check")] = input.checked;
        api.saveOpState(op.id, { checks: checks }).then(function (ok) {
          if (api.supabaseEnabled && !ok) {
            window.alert("No se pudo guardar el checklist en Supabase. Revisa las politicas SQL y vuelve a intentar.");
          }
        });
      });
    });
    var sendDelivery = document.getElementById("sendDelivery");
    if (!sendDelivery) return;
    sendDelivery.addEventListener("click", function () {
      var btn = document.getElementById("sendDelivery");
      var status = document.getElementById("deliveryStatus");
      var files = Array.prototype.slice.call(document.getElementById("deliveryFiles").files || []);
      var notes = document.getElementById("deliveryNotes").value.trim();
      if (!files.length) {
        status.textContent = "Selecciona al menos un archivo para enviar.";
        status.className = "delivery-status error";
        return;
      }
      btn.disabled = true;
      btn.textContent = "Subiendo...";
      status.textContent = "Subiendo archivo y guardando revision...";
      status.className = "delivery-status";
      api.uploadDelivery(op.id, notes, files).then(function (result) {
        if (result && result.error) {
          status.textContent = result.error;
          status.className = "delivery-status error";
          btn.disabled = false;
          btn.textContent = "Enviar a aprobacion";
          return;
        }
        render();
      });
    });
  }

  function allowedStatuses(current) {
    if (op && op.noApproval) return ["Pendiente", "Preparando", "Listo", "Publicado"];
    if (isAdmin) return api.statuses;
    var base = ["Pendiente", "En diseno", "En revision", "Enviado a aprobacion", "Cambios solicitados"];
    if (["Aprobado", "Programado", "Publicado"].indexOf(current) !== -1) return [current].concat(base);
    return base;
  }

  api.ready(function () {
    if (api.remoteError && api.remoteError()) {
      root.innerHTML = '<section class="panel"><h1>No se pudo cargar Supabase</h1><p>' + api.remoteError() + '</p></section>';
      return;
    }
    op = api.getOp(explicitId || queryId);
    syncHeaderForRole();
    render();
  });
})();
