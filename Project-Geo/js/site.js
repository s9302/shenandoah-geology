(function(){
  "use strict";

  /* ---------- Theme toggle ---------- */
  var root = document.documentElement;
  var toggleBtn = document.getElementById("theme-toggle");

  function systemPrefersDark(){
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function currentIsDark(){
    var saved = root.getAttribute("data-theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return systemPrefersDark();
  }
  function paintToggle(){
    if (!toggleBtn) return;
    toggleBtn.textContent = currentIsDark() ? "☀" : "☾"; /* sun : moon */
    toggleBtn.setAttribute("aria-label", currentIsDark() ? "Switch to light theme" : "Switch to dark theme");
  }
  try{
    var saved = localStorage.getItem("shen-theme");
    if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);
  }catch(e){ /* storage unavailable, fall back to system */ }
  paintToggle();

  if (toggleBtn){
    toggleBtn.addEventListener("click", function(){
      var next = currentIsDark() ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try{ localStorage.setItem("shen-theme", next); }catch(e){}
      paintToggle();
    });
  }

  /* ---------- Scroll-spy nav ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".navlinks a"));
  var sections = navLinks.map(function(a){
    var id = a.getAttribute("href").replace("#","");
    return document.getElementById(id);
  }).filter(Boolean);

  if ("IntersectionObserver" in window && sections.length){
    var spy = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        var link = navLinks.filter(function(a){ return a.getAttribute("href") === "#" + entry.target.id; })[0];
        if (!link) return;
        if (entry.isIntersecting){
          navLinks.forEach(function(a){ a.classList.remove("active"); });
          link.classList.add("active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach(function(s){ spy.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealTargets = document.querySelectorAll(".era, .specimen, .prose-block");
  if ("IntersectionObserver" in window && revealTargets.length){
    var reveal = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting){
          entry.target.classList.add("in-view");
          reveal.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealTargets.forEach(function(t){ reveal.observe(t); });
  } else {
    revealTargets.forEach(function(t){ t.classList.add("in-view"); });
  }

  /* ---------- Strata rail fill (deep-time progress through the History section) ---------- */
  var railFill = document.querySelector(".strata-rail .fill");
  var historySection = document.getElementById("history");
  function updateRail(){
    if (!railFill || !historySection) return;
    var rect = historySection.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    var total = rect.height + vh;
    var passed = vh - rect.top;
    var pct = Math.max(0, Math.min(1, passed / total));
    railFill.style.height = (pct * 100) + "%";
  }
  document.addEventListener("scroll", updateRail, { passive: true });
  window.addEventListener("resize", updateRail);
  updateRail();

  /* ---------- Back to top ---------- */
  var toTop = document.getElementById("to-top");
  function updateToTop(){
    if (!toTop) return;
    if (window.scrollY > 600) toTop.classList.add("show");
    else toTop.classList.remove("show");
  }
  document.addEventListener("scroll", updateToTop, { passive: true });
  updateToTop();
  if (toTop){
    toTop.addEventListener("click", function(){
      var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });
  }

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lbImg = lightbox ? lightbox.querySelector("img") : null;
  var lbCap = lightbox ? lightbox.querySelector(".lb-cap") : null;
  var lastFocused = null;

  function openLightbox(src, alt, caption){
    if (!lightbox || !lbImg) return;
    lbImg.src = src;
    lbImg.alt = alt || "";
    if (lbCap) lbCap.textContent = caption || "";
    lightbox.classList.add("open");
    lastFocused = document.activeElement;
    lightbox.querySelector(".lb-close").focus();
    document.body.style.overflow = "hidden";
  }
  function closeLightbox(){
    if (!lightbox) return;
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }
  document.querySelectorAll("[data-lightbox]").forEach(function(fig){
    var img = fig.querySelector("img");
    if (!img) return;
    fig.setAttribute("tabindex", "0");
    fig.setAttribute("role", "button");
    fig.setAttribute("aria-label", "View larger image: " + (img.alt || ""));
    var cap = fig.querySelector("figcaption");
    function trigger(){ openLightbox(img.src, img.alt, cap ? cap.textContent : ""); }
    fig.addEventListener("click", trigger);
    fig.addEventListener("keydown", function(e){
      if (e.key === "Enter" || e.key === " "){ e.preventDefault(); trigger(); }
    });
  });
  if (lightbox){
    lightbox.addEventListener("click", function(e){
      if (e.target === lightbox || e.target.classList.contains("lb-close")) closeLightbox();
    });
    document.addEventListener("keydown", function(e){
      if (e.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
    });
  }

  /* ---------- Roc, the rock guide ---------- */
  var mascotAvatar = document.getElementById("mascot-avatar");
  var mascotBubble = document.getElementById("mascot-bubble");
  var mascotClose = document.getElementById("mascot-close");
  var mascotFactBtn = document.getElementById("mascot-fact-btn");
  var mascotText = document.getElementById("mascot-text");

  var ROC_INTRO = "Hey, I’m Roc — a piece of Old Rag Granite come to life. Want a fun fact about Shenandoah?";

  /* Every line below is pulled straight from the research on this page. */
  var ROC_FACTS = [
    "The oldest rocks found in Shenandoah National Park are over 1.2 billion years old.",
    "Many of these oldest rocks can be found on the mountain Old Rag — that's home for me.",
    "The core of the mountain range’s anticlinorium is made out of Mesoproterozoic granite and granodioritic gneiss. Around here, it's called Old Rag Granite.",
    "The signature rock of Shenandoah National Park is meta basalt, or greenstone.",
    "Greenstone is mostly made out of chlorite, epidote, albite, and actinolite — that's what gives it its green color.",
    "During the Alleghenian orogeny, these mountains rose up to about 20,000 feet — comparable to the Rockies in modern day.",
    "Some scholars believe these mountains had an elevation of 4,000 to 6,000 meters at their peaks.",
    "The region is not known to have many earthquakes, since the mountain range sits in the interior of the North American plate.",
    "The faults that built this mountain range are over 300 million years old, deeply buried, and mostly locked — though we saw a slip like this in 2011.",
    "This range was never glaciated directly, but it did experience periglacial freezes and thaws that caused distinct boulder fields to form.",
    "This was historically a place to mine iron, along with manganese and some copper."
  ];
  var rocLastIndex = -1;
  var rocOpen = false;

  function rocPickFact(){
    if (ROC_FACTS.length === 1) return ROC_FACTS[0];
    var i;
    do { i = Math.floor(Math.random() * ROC_FACTS.length); } while (i === rocLastIndex);
    rocLastIndex = i;
    return ROC_FACTS[i];
  }
  function rocSetText(t){
    if (mascotText) mascotText.textContent = t;
  }
  function rocOpenBubble(){
    if (!mascotBubble) return;
    mascotBubble.classList.add("open");
    rocOpen = true;
    if (mascotAvatar) mascotAvatar.setAttribute("aria-expanded", "true");
  }
  function rocCloseBubble(){
    if (!mascotBubble) return;
    mascotBubble.classList.remove("open");
    rocOpen = false;
    if (mascotAvatar) mascotAvatar.setAttribute("aria-expanded", "false");
  }

  if (mascotAvatar){
    mascotAvatar.addEventListener("click", function(){
      if (rocOpen) rocCloseBubble(); else rocOpenBubble();
    });
  }
  if (mascotClose){
    mascotClose.addEventListener("click", rocCloseBubble);
  }
  if (mascotFactBtn){
    mascotFactBtn.addEventListener("click", function(){
      rocSetText(rocPickFact());
      mascotFactBtn.textContent = "Another fact";
    });
  }
  document.addEventListener("keydown", function(e){
    if (e.key === "Escape" && rocOpen) rocCloseBubble();
  });

  /* Greet automatically the first time this browser opens the page */
  (function rocGreetOnce(){
    var seen = true;
    try{ seen = !!localStorage.getItem("roc-intro-seen"); }catch(e){ seen = false; }
    if (seen) return;
    window.setTimeout(function(){
      rocSetText(ROC_INTRO);
      rocOpenBubble();
      try{ localStorage.setItem("roc-intro-seen", "1"); }catch(e){}
    }, 1000);
  })();

})();
