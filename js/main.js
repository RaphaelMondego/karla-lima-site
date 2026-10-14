/* Clínica Dra. Karla Lima — interações */
(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var nav = document.getElementById("nav");
  var bar = document.getElementById("scrollBar");
  var toTop = document.getElementById("toTop");
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("navMenu");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Scroll: barra de progresso, navbar sólida, voltar ao topo ---------- */
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    nav.classList.toggle("is-solid", y > 80);
    toTop.classList.toggle("is-visible", y > 300);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  /* ---------- Menu hambúrguer ---------- */
  function setMenu(open) {
    menu.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.classList.toggle("menu-open", open);
    if (open) nav.classList.add("is-solid"); else onScroll();
  }
  toggle.addEventListener("click", function () {
    setMenu(toggle.getAttribute("aria-expanded") !== "true");
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && menu.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
  });
  window.matchMedia("(min-width: 960px)").addEventListener("change", function (mq) {
    if (mq.matches) setMenu(false);
  });

  /* ---------- Smooth scroll das âncoras (compensando a navbar) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = link.getAttribute("href");
      if (id.length < 2) return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      setMenu(false);
      var offset = id === "#inicio" ? 0 : nav.offsetHeight - 1;
      var top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: top, behavior: reduceMotion ? "auto" : "smooth" });
      history.replaceState(null, "", id);
    });
  });

  /* ---------- Reveal: fade-in + slide-up ---------- */
  var reveals = document.querySelectorAll(".reveal");
  // escalonamento entre irmãos (cards, galeria, diferenciais)
  reveals.forEach(function (el) {
    var siblings = Array.prototype.filter.call(el.parentElement.children, function (c) {
      return c.classList.contains("reveal");
    });
    var i = siblings.indexOf(el);
    if (i > 0) el.style.setProperty("--d", Math.min(i * 0.08, 0.48) + "s");
  });

  if ("IntersectionObserver" in window) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { revealObs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Contadores animados ---------- */
  function easeOutExpo(t) { return t === 1 ? 1 : 1 - Math.pow(2, -10 * t); }
  function animateCount(el) {
    var end = parseInt(el.getAttribute("data-count"), 10);
    if (reduceMotion) { el.textContent = end; return; }
    var duration = 2000;
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      el.textContent = Math.round(easeOutExpo(p) * end);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          countObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countObs.observe(el); });
  } else {
    counters.forEach(function (el) { el.textContent = el.getAttribute("data-count"); });
  }

  /* ---------- Brilho que segue o mouse nos cards ---------- */
  document.querySelectorAll(".card").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });

  /* ---------- Partículas rose gold na hero ---------- */
  var canvas = document.getElementById("particles");
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext("2d");
    var hero = canvas.parentElement;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, particles = [], running = true, rafId = null;
    var COLORS = ["255,77,184", "233,30,140", "243,201,164", "255,214,236", "255,190,140"];

    function makeParticle(randomY) {
      var big = Math.random() < 0.12;
      return {
        x: Math.random() * W,
        y: randomY ? Math.random() * H : H + 10,
        r: big ? 1.8 + Math.random() * 2.2 : 0.5 + Math.random() * 1.4,
        vy: 0.15 + Math.random() * 0.45,
        vx: (Math.random() - 0.5) * 0.2,
        drift: Math.random() * Math.PI * 2,
        tw: 0.01 + Math.random() * 0.03,
        phase: Math.random() * Math.PI * 2,
        c: COLORS[(Math.random() * COLORS.length) | 0]
      };
    }

    function resize() {
      W = hero.clientWidth; H = hero.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(Math.min(140, Math.max(50, (W * H) / 11000)));
      particles = [];
      for (var i = 0; i < count; i++) particles.push(makeParticle(true));
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.y -= p.vy;
        p.drift += 0.01;
        p.x += p.vx + Math.sin(p.drift) * 0.25;
        p.phase += p.tw;
        if (p.y < -10 || p.x < -10 || p.x > W + 10) { particles[i] = makeParticle(false); continue; }
        var a = 0.35 + 0.65 * Math.abs(Math.sin(p.phase));
        var g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, "rgba(" + p.c + "," + a + ")");
        g.addColorStop(0.35, "rgba(" + p.c + "," + a * 0.35 + ")");
        g.addColorStop(1, "rgba(" + p.c + ",0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fill();
        if (p.r > 1.8) { // estrelinha nos brilhos maiores
          ctx.strokeStyle = "rgba(255,255,255," + a * 0.5 + ")";
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(p.x - p.r * 3, p.y); ctx.lineTo(p.x + p.r * 3, p.y);
          ctx.moveTo(p.x, p.y - p.r * 3); ctx.lineTo(p.x, p.y + p.r * 3);
          ctx.stroke();
        }
      }
      ctx.globalCompositeOperation = "source-over";
      if (running) rafId = requestAnimationFrame(draw);
    }

    resize();
    if (reduceMotion) {
      running = false; draw();
    } else {
      rafId = requestAnimationFrame(draw);
      // pausa quando a hero sai da tela (economia de bateria)
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
          var visible = entries[0].isIntersecting;
          if (visible && !running) { running = true; rafId = requestAnimationFrame(draw); }
          else if (!visible) { running = false; cancelAnimationFrame(rafId); }
        }).observe(hero);
      }
    }
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });
  }

  /* ---------- Ano no rodapé ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
