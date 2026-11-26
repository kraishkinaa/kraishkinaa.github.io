(function () {
  "use strict";

  var R = window.RESUME;
  if (!R) return;

  var SHOW_THEME_SWITCH = false; // true — вернуть плавающий переключатель тем
  var THEMES = ["template", "signal", "onyx", "onyx-steel", "onyx-bordeaux"];
  var THEME_COLORS = {
    template: "#FFFEFB",
    signal: "#0A0B0D",
    onyx: "#0A0A0B",
    "onyx-steel": "#0A0B0C",
    "onyx-bordeaux": "#0B0A0B"
  };
  var THEME_KEY = "ak_theme";
  var LANG_KEY = "ak_lang";

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }
  function read(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  var params = new URLSearchParams(location.search);
  var state = {
    lang: params.get("lang") === "en" ? "en" : (read(LANG_KEY) === "en" ? "en" : "ru"),
    theme: THEMES.indexOf(params.get("theme")) > -1
      ? params.get("theme")
      : (THEMES.indexOf(read(THEME_KEY)) > -1 ? read(THEME_KEY) : "template")
  };

  function L() { return R[state.lang]; }

  function get(path, fallback) {
    var parts = path.split(".");
    var cur = L();
    for (var i = 0; i < parts.length; i++) {
      if (cur && typeof cur === "object" && parts[i] in cur) cur = cur[parts[i]];
      else { cur = undefined; break; }
    }
    if (cur === undefined) {
      cur = R.meta;
      for (var j = 0; j < parts.length; j++) {
        if (cur && typeof cur === "object" && parts[j] in cur) cur = cur[parts[j]];
        else { cur = undefined; break; }
      }
    }
    return cur === undefined ? (fallback || "") : cur;
  }

  function esc(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /* ---------- topic: theme ---------- */

  function applyTheme(theme, persist) {
    state.theme = THEMES.indexOf(theme) > -1 ? theme : "template";
    document.body.classList.remove.apply(document.body.classList, THEMES.map(function (t) { return "theme-" + t; }));
    document.body.classList.add("theme-" + state.theme);
    if (state.theme.indexOf("onyx") === 0) document.body.classList.add("theme-signal");
    var meta = $('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", THEME_COLORS[state.theme]);
    $$("#themeSwitch button").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.dataset.theme === state.theme));
    });
    if (persist) { store(THEME_KEY, state.theme); syncUrl("theme", state.theme); }
    document.documentElement.dataset.theme = state.theme;
  }

  function syncUrl(key, value) {
    try {
      var url = new URL(location.href);
      url.searchParams.set(key, value);
      history.replaceState(null, "", url);
    } catch (e) {}
  }

  /* ---------- render ---------- */

  function renderTags() {
    var host = $("#heroTags");
    if (!host) return;
    host.innerHTML = L().hero.tags.map(function (tag) {
      return '<li class="tag">' + esc(tag) + "</li>";
    }).join("");
  }

  function renderStats() {
    var host = $("#heroStats");
    if (!host) return;
    host.innerHTML = L().hero.stats.map(function (s) {
      var dec = Number(s.value) % 1 !== 0 ? 1 : 0;
      return '<li class="stat">' +
        '<span class="stat-figure">' +
          '<span class="stat-value" data-count="' + esc(s.value) + '" data-dec="' + dec + '">' + esc(s.value) + "</span>" +
          '<span class="stat-suffix">' + esc(s.suffix) + "</span>" +
        "</span>" +
        '<span class="stat-label">' + esc(s.label) + "</span>" +
        "</li>";
    }).join("");
  }

  function contactItems(compact) {
    var items = [
      { icon: "i-mail", label: "E-mail", value: R.meta.email, href: "mailto:" + R.meta.email, copy: R.meta.email },
      { icon: "i-tg", label: "Telegram", value: R.meta.telegram, href: R.meta.telegramHref, external: true },
      { icon: "i-phone", label: "Телефон", value: R.meta.phone, href: R.meta.phoneHref }
    ];
    return items.map(function (it) {
      var inner = '<span class="contact-icon"><svg class="icon" aria-hidden="true"><use href="#' + it.icon + '"></use></svg></span>' +
        '<span class="contact-body"><span class="contact-label">' + esc(it.label) + "</span>" +
        '<span class="contact-value">' + esc(it.value) + "</span></span>";
      var attrs = ' class="contact"' + ' href="' + esc(it.href) + '"' +
        (it.external ? ' target="_blank" rel="noopener"' : "");
      var link = "<a" + attrs + ">" + inner + "</a>";
      var copy = it.copy
        ? '<button class="copy" type="button" data-copy="' + esc(it.copy) + '" aria-label="' + esc(get("ui.copy", "Скопировать")) + ' ' + esc(it.copy) + '">' +
          '<svg class="icon" aria-hidden="true"><use href="#i-copy"></use></svg></button>'
        : "";
      return '<li class="contact-item' + (compact ? " compact" : "") + '">' + link + copy + "</li>";
    }).join("");
  }

  function renderContacts() {
    ["#heroContacts", "#ctaContacts"].forEach(function (sel) {
      var host = $(sel);
      if (host) host.innerHTML = contactItems(sel === "#ctaContacts");
    });
  }

  function renderTabs() {
    var host = $("#resultTabs");
    if (!host) return;
    var filters = L().ui.filters;
    var buttons = [{ id: "all", label: L().ui.all }];
    Object.keys(filters).forEach(function (key) { buttons.push({ id: key, label: filters[key] }); });
    host.innerHTML = buttons.map(function (b, i) {
      return '<button type="button" role="tab" data-filter="' + b.id + '" aria-selected="' + (i === 0) + '" tabindex="' + (i === 0 ? 0 : -1) + '">' +
        esc(b.label) + "</button>";
    }).join("");
    host.addEventListener("click", onTabClick);
    host.addEventListener("keydown", onTabKey);
  }

  function onTabClick(event) {
    var btn = event.target.closest("button[data-filter]");
    if (!btn) return;
    selectTab(btn);
  }

  function onTabKey(event) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    var tabs = $$("#resultTabs button");
    var index = tabs.indexOf(document.activeElement);
    if (index < 0) return;
    var next = event.key === "ArrowRight" ? (index + 1) % tabs.length : (index - 1 + tabs.length) % tabs.length;
    tabs[next].focus();
    selectTab(tabs[next]);
  }

  function selectTab(btn) {
    $$("#resultTabs button").forEach(function (b) {
      var active = b === btn;
      b.setAttribute("aria-selected", String(active));
      b.tabIndex = active ? 0 : -1;
    });
    var filter = btn.dataset.filter;
    $$("#resultCards .card").forEach(function (card) {
      var show = filter === "all" || card.dataset.cat === filter;
      card.hidden = !show;
    });
  }

  function renderCards() {
    var host = $("#resultCards");
    if (!host) return;
    host.innerHTML = L().results.cards.map(function (c) {
      return '<article class="card" data-cat="' + esc(c.cat) + '">' +
        '<p class="card-metric">' + esc(c.metric) + "</p>" +
        '<h3 class="card-title">' + esc(c.title) + "</h3>" +
        '<p class="card-text">' + esc(c.text) + "</p>" +
        '<p class="card-outcome"><svg class="icon" aria-hidden="true"><use href="#i-arrow"></use></svg><span>' + esc(c.outcome) + "</span></p>" +
        (c.note ? '<p class="card-note">' + esc(c.note) + "</p>" : "") +
        "</article>";
    }).join("");
  }

  function renderTimeline() {
    var host = $("#timeline");
    if (!host) return;
    var note = $("#timelineNote");
    if (note) note.textContent = L().experience.personalNote || "";
    host.innerHTML = L().experience.jobs.map(function (job, index) {
      var points = job.points.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("");
      return '<li class="job">' +
        '<p class="job-period">' + esc(job.period) + "</p>" +
        '<div class="job-main">' +
          '<details class="job-details">' +
            "<summary>" +
              '<span class="job-toggle" aria-hidden="true"></span>' +
              '<span class="job-head">' +
                '<span class="job-role">' + esc(job.role) + "</span>" +
                '<span class="job-company">' + esc(job.company) + "</span>" +
              "</span>" +
              '<span class="job-lead job-context">' + esc(job.note) + "</span>" +
            "</summary>" +
            '<div class="job-body">' +
              '<p class="job-metrics">' + esc(job.lead) + "</p>" +
              '<ul class="job-points">' + points + "</ul>" +
            "</div>" +
          "</details>" +
        "</div>" +
      "</li>";
    }).join("");
  }

  function renderSkills() {
    var groups = $("#skillGroups");
    if (groups) {
      groups.innerHTML = L().skills.groups.map(function (g) {
        return '<article class="skill-group">' +
          "<h3>" + esc(g.title) + "</h3>" +
          '<ul class="chips">' + g.items.map(function (i) { return "<li>" + esc(i) + "</li>"; }).join("") + "</ul>" +
          "</article>";
      }).join("");
    }
    var edu = $("#eduList");
    if (edu) {
      edu.innerHTML = L().skills.education.map(function (e) {
        return '<li><span class="edu-year">' + esc(e.year) + "</span>" +
          '<span class="edu-body"><strong>' + esc(e.title) + "</strong><span>" + esc(e.place) + "</span></span></li>";
      }).join("");
    }
    var courses = $("#courseList");
    if (courses) {
      courses.innerHTML = L().skills.courses.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("");
    }
    var langs = $("#langList");
    if (langs) {
      langs.innerHTML = L().skills.languages.map(function (l) { return "<li>" + esc(l) + "</li>"; }).join("");
    }
  }

  function renderStatic() {
    var lang = L();
    document.documentElement.lang = state.lang;
    document.title = lang.meta.title;
    var desc = $('meta[name="description"]');
    if (desc) desc.setAttribute("content", lang.meta.description);

    $$("[data-i18n]").forEach(function (el) {
      var value = get(el.dataset.i18n);
      if (typeof value === "string" && value) el.textContent = value;
    });

    var toggle = $("#langToggle");
    if (toggle) {
      toggle.textContent = state.lang === "ru" ? "EN" : "RU";
      toggle.setAttribute("title", get("ui.langLabel", "Переключить язык"));
    }
    var photo = $(".hero-media img");
    if (photo) photo.alt = state.lang === "ru" ? "Андрей Краишкин, HR-директор" : "Andrey Kraishkin, HR Director";
    var tg = $("#ctaTelegram");
    if (tg) tg.href = R.meta.telegramHref;
    var year = $("#year");
    if (year) year.textContent = new Date().getFullYear();
    $$('a[href^="resume.html"]').forEach(function (link) {
      link.setAttribute("href", "resume.html?lang=" + state.lang);
    });
    var about = $("#aboutText");
    if (about) about.textContent = L().about.text;
    var rec = $("#recommendations");
    if (rec) rec.textContent = L().footer.recommendations;
    var toggleAll = $("#toggleAll");
    if (toggleAll) {
      toggleAll.textContent = get("ui.expandAll");
      toggleAll.setAttribute("aria-expanded", "false");
    }
  }

  function renderAll() {
    renderStatic();
    renderTags();
    renderStats();
    renderContacts();
    renderTabs();
    renderCards();
    renderTimeline();
    renderSkills();
    startCounters();
    revealInit();
  }

  /* ---------- counters & reveal ---------- */

  function animate(el) {
    var target = parseFloat(el.dataset.count);
    var dec = parseInt(el.dataset.dec || "0", 10);
    if (isNaN(target)) { return; }
    if (reduced) { el.textContent = target.toFixed(dec).replace(".", ","); return; }
    var start = null;
    var duration = 900;
    function frame(now) {
      if (!start) start = now;
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var value = target * eased;
      el.textContent = (dec ? value.toFixed(dec).replace(".", ",") : Math.round(value).toString());
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function statText(value, dec) {
    return dec ? value.toFixed(dec).replace(".", ",") : String(Math.round(value));
  }

  function startCounters() {
    var values = $$(".stat-value[data-count]");
    if (!values.length) return;
    values.forEach(function (el) {
      el.textContent = statText(parseFloat(el.dataset.count), parseInt(el.dataset.dec || "0", 10));
    });
    if (reduced || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    values.forEach(function (el) { el.textContent = "0"; io.observe(el); });
  }

  function revealInit() {
    if (reduced || !("IntersectionObserver" in window)) return;
    var items = $$(".card, .job, .skill-group, .cred-block, .cta-inner");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    items.forEach(function (el) {
      el.classList.add("reveal");
      io.observe(el);
    });
  }

  /* ---------- interactions ---------- */

  function toast(message) {
    var el = $("#toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(function () { el.classList.remove("show"); }, 1800);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(area);
    return Promise.resolve();
  }

  document.addEventListener("click", function (event) {
    var copyBtn = event.target.closest("[data-copy]");
    if (copyBtn) {
      copyText(copyBtn.dataset.copy).then(function () {
        toast(get("ui.copied", "Скопировано"));
      });
    }
    var themeBtn = event.target.closest("#themeSwitch button");
    if (themeBtn) applyTheme(themeBtn.dataset.theme, true);
  });

  var expandBtn = $("#toggleAll");
  if (expandBtn) {
    expandBtn.addEventListener("click", function () {
      var details = $$("#timeline .job-details");
      var openAll = details.some(function (d) { return !d.open; });
      details.forEach(function (d) { d.open = openAll; });
      expandBtn.setAttribute("aria-expanded", String(openAll));
      expandBtn.textContent = get(openAll ? "ui.collapseAll" : "ui.expandAll");
    });
  }

  $("#langToggle").addEventListener("click", function () {
    state.lang = state.lang === "ru" ? "en" : "ru";
    store(LANG_KEY, state.lang);
    syncUrl("lang", state.lang);
    renderAll();
  });

  var progress = $("#progressBar");
  var topbar = $(".topbar");
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      var p = max > 0 ? (window.scrollY / max) * 100 : 0;
      if (progress) progress.style.width = p + "%";
      if (topbar) topbar.classList.toggle("is-scrolled", window.scrollY > 10);
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  var switchHost = $("#themeSwitch");
  if (switchHost) switchHost.hidden = !SHOW_THEME_SWITCH;

  applyTheme(state.theme, false);
  renderAll();
  onScroll();
})();
