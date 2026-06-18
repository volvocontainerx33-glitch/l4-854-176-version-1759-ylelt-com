(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function restart() {
      window.clearInterval(timer);
      start();
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        restart();
      });
    });

    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters() {
    var toolbars = Array.prototype.slice.call(document.querySelectorAll('[data-filter-toolbar]'));
    toolbars.forEach(function (toolbar) {
      var scope = toolbar.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
      var input = toolbar.querySelector('[data-filter-input]');
      var year = toolbar.querySelector('[data-filter-year]');
      var category = toolbar.querySelector('[data-filter-category]');
      var empty = toolbar.querySelector('[data-filter-empty]');
      if (!cards.length) {
        return;
      }

      function apply() {
        var keyword = normalize(input && input.value);
        var yearValue = normalize(year && year.value);
        var categoryValue = normalize(category && category.value);
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-region'),
            card.getAttribute('data-category'),
            card.getAttribute('data-year')
          ].join(' '));
          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesYear = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
          var matchesCategory = !categoryValue || normalize(card.getAttribute('data-category')) === categoryValue;
          var isVisible = matchesKeyword && matchesYear && matchesCategory;
          card.classList.toggle('is-hidden', !isVisible);
          if (isVisible) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [input, year, category].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });

      if (input && input.hasAttribute('data-query-sync')) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (query) {
          input.value = query;
        }
      }

      apply();
    });
  }

  function setupImageFallback() {
    var images = Array.prototype.slice.call(document.querySelectorAll('img[data-cover-image]'));
    images.forEach(function (image) {
      image.addEventListener('error', function () {
        image.style.opacity = '0';
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupImageFallback();
  });
})();
