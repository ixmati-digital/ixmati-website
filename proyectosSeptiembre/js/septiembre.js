(function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".main-nav a"));

  if (toggle) {
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("menu-open");
      toggle.setAttribute("aria-expanded", document.body.classList.contains("menu-open") ? "true" : "false");
    });
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      document.body.classList.remove("menu-open");
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
  });

  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { observer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  Array.prototype.slice.call(document.querySelectorAll(".accordion button")).forEach(function (button) {
    button.addEventListener("click", function () {
      var item = button.closest(".accordion-item");
      var open = item.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  });

  function money(value) {
    return value.toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0
    });
  }

  function number(value) {
    return value.toLocaleString("es-MX", { maximumFractionDigits: 1 });
  }

  var calc = document.querySelector("[data-roi-calculator]");
  if (calc) {
    var inputs = Array.prototype.slice.call(calc.querySelectorAll("input"));

    function read(name) {
      var field = calc.querySelector('[name="' + name + '"]');
      return Number(field && field.value ? field.value : 0);
    }

    function render() {
      var ops = read("ops");
      var people = read("people");
      var admin = read("admin");
      var search = read("search");
      var coordination = read("coordination");
      var hourly = read("hourly");
      var material = read("material");
      var waste = read("waste");
      var reprints = read("reprints");
      var reprintCost = read("reprintCost");

      var manualHours = ops * (admin + search + coordination) / 60;
      var timeCost = manualHours * hourly * Math.max(people, 1);
      var wasteCost = material * (waste / 100);
      var reprintTotal = reprints * reprintCost;
      var avoidable = timeCost + wasteCost + reprintTotal;

      calc.querySelector("[data-result-hours]").textContent = number(manualHours) + " h";
      calc.querySelector("[data-result-time]").textContent = money(timeCost);
      calc.querySelector("[data-result-waste]").textContent = money(wasteCost);
      calc.querySelector("[data-result-reprints]").textContent = money(reprintTotal);
      calc.querySelector("[data-result-month]").textContent = money(avoidable);
      calc.querySelector("[data-result-year]").textContent = money(avoidable * 12);
    }

    inputs.forEach(function (input) {
      input.addEventListener("input", render);
    });
    render();
  }
})();
