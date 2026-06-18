(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMobileNav() {
    const button = document.querySelector(".mobile-menu-toggle");
    const nav = document.querySelector(".site-nav");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    const slider = document.querySelector(".hero-slider");
    if (!slider) {
      return;
    }
    const slides = Array.from(slider.querySelectorAll(".hero-slide"));
    const dots = Array.from(slider.querySelectorAll(".hero-dot"));
    if (slides.length <= 1) {
      return;
    }
    let index = 0;
    let timer = null;
    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(dotIndex);
        start();
      });
    });
    start();
  }

  function initHeaderSearch() {
    const input = document.getElementById("siteSearchInput");
    const panel = document.getElementById("siteSearchResults");
    const movies = Array.isArray(window.SITE_MOVIES) ? window.SITE_MOVIES : [];
    if (!input || !panel || movies.length === 0) {
      return;
    }
    function render(items, keyword) {
      if (!keyword) {
        panel.classList.remove("is-open");
        panel.innerHTML = "";
        return;
      }
      if (items.length === 0) {
        panel.innerHTML = '<p class="search-empty">没有匹配内容</p>';
        panel.classList.add("is-open");
        return;
      }
      panel.innerHTML = items.slice(0, 8).map(function (movie) {
        return [
          '<a class="search-item" href="' + movie.url + '">',
          '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, "&quot;") + '">',
          '<span><strong>' + movie.title + '</strong><small>' + movie.year + ' · ' + movie.region + ' · ' + movie.type + '</small></span>',
          '</a>'
        ].join("");
      }).join("");
      panel.classList.add("is-open");
    }
    input.addEventListener("input", function () {
      const keyword = normalize(input.value);
      const results = movies.filter(function (movie) {
        const haystack = normalize(movie.title + " " + movie.region + " " + movie.type + " " + movie.genre + " " + movie.category + " " + movie.tags);
        return haystack.indexOf(keyword) !== -1;
      });
      render(results, keyword);
    });
    document.addEventListener("click", function (event) {
      if (!panel.contains(event.target) && event.target !== input) {
        panel.classList.remove("is-open");
      }
    });
  }

  function yearMatches(cardYear, filterYear) {
    if (!filterYear || filterYear === "全部年份") {
      return true;
    }
    const number = Number(cardYear);
    if (filterYear === "2010-2019") {
      return number >= 2010 && number <= 2019;
    }
    if (filterYear === "2000-2009") {
      return number >= 2000 && number <= 2009;
    }
    if (filterYear === "更早") {
      return number > 0 && number < 2000;
    }
    return String(cardYear) === filterYear;
  }

  function initPageFilters() {
    const cards = Array.from(document.querySelectorAll(".filter-card"));
    const search = document.querySelector("[data-filter-search]");
    const year = document.querySelector("[data-filter-year]");
    const type = document.querySelector("[data-filter-type]");
    if (cards.length === 0 || (!search && !year && !type)) {
      return;
    }
    function apply() {
      const keyword = normalize(search ? search.value : "");
      const yearValue = year ? year.value : "全部年份";
      const typeValue = type ? type.value : "全部类型";
      cards.forEach(function (card) {
        const content = normalize(card.dataset.title + " " + card.dataset.region + " " + card.dataset.type + " " + card.dataset.year + " " + card.dataset.genre + " " + card.dataset.category);
        const matchKeyword = !keyword || content.indexOf(keyword) !== -1;
        const matchYear = yearMatches(card.dataset.year, yearValue);
        const matchType = !typeValue || typeValue === "全部类型" || card.dataset.type.indexOf(typeValue) !== -1;
        card.hidden = !(matchKeyword && matchYear && matchType);
      });
    }
    [search, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
  }

  ready(function () {
    initMobileNav();
    initHero();
    initHeaderSearch();
    initPageFilters();
  });
})();
