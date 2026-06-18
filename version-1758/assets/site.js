(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var menu = document.querySelector(".nav-menu");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      var opened = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
      toggle.textContent = opened ? "×" : "☰";
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5000);
  }

  function uniqueValues(cards, name) {
    var values = [];
    cards.forEach(function (card) {
      var value = card.getAttribute(name) || "";
      if (value && values.indexOf(value) === -1) {
        values.push(value);
      }
    });
    return values.sort().reverse();
  }

  function fillSelect(select, values) {
    if (!select || select.options.length > 1) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupSearch() {
    var input = document.querySelector("[data-search-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
    var year = document.querySelector("[data-filter-year]");
    var type = document.querySelector("[data-filter-type]");
    if (!cards.length) {
      return;
    }
    fillSelect(year, uniqueValues(cards, "data-card-year"));
    fillSelect(type, uniqueValues(cards, "data-card-type"));
    function apply() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var yearValue = year ? year.value : "";
      var typeValue = type ? type.value : "";
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search-text") || "").toLowerCase();
        var cardYear = card.getAttribute("data-card-year") || "";
        var cardType = card.getAttribute("data-card-type") || "";
        var matched = (!query || text.indexOf(query) !== -1) && (!yearValue || cardYear === yearValue) && (!typeValue || cardType === typeValue);
        card.classList.toggle("is-hidden", !matched);
      });
    }
    if (input) {
      input.addEventListener("input", apply);
    }
    if (year) {
      year.addEventListener("change", apply);
    }
    if (type) {
      type.addEventListener("change", apply);
    }
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".player-card"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector(".play-overlay");
      var stream = player.getAttribute("data-stream");
      var hls = null;
      var attached = false;
      var pending = false;
      if (!video || !stream) {
        return;
      }
      function attach() {
        if (attached) {
          return;
        }
        attached = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls();
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            if (pending) {
              video.play().catch(function () {});
            }
          });
        } else {
          video.src = stream;
        }
      }
      function play() {
        pending = true;
        attach();
        video.controls = true;
        if (button) {
          button.classList.add("is-hidden");
        }
        video.play().catch(function () {});
      }
      if (button) {
        button.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (!attached || video.paused) {
          play();
        }
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupSearch();
    setupPlayers();
  });
})();
