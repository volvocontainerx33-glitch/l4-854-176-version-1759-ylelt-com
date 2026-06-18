(function () {
  var navButton = document.querySelector('.mobile-nav-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (navButton && mobileNav) {
    navButton.addEventListener('click', function () {
      var expanded = navButton.getAttribute('aria-expanded') === 'true';
      navButton.setAttribute('aria-expanded', String(!expanded));
      mobileNav.classList.toggle('open', !expanded);
    });
  }

  document.querySelectorAll('.js-hero-slider').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var buttons = Array.prototype.slice.call(slider.querySelectorAll('[data-slide-target]'));
    var index = 0;
    var timer = null;

    function setSlide(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      buttons.forEach(function (button) {
        button.classList.toggle('active', Number(button.getAttribute('data-slide-target')) === index);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        setSlide(index + 1);
      }, 5200);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        setSlide(Number(button.getAttribute('data-slide-target')) || 0);
        startTimer();
      });
    });

    setSlide(0);
    startTimer();
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('.js-search-input');
    var region = scope.querySelector('.js-filter-region');
    var year = scope.querySelector('.js-filter-year');
    var type = scope.querySelector('.js-filter-type');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.js-movie-card'));

    function normalized(value) {
      return String(value || '').trim().toLowerCase();
    }

    function matches(card) {
      var q = normalized(input && input.value);
      var regionValue = normalized(region && region.value);
      var yearValue = normalized(year && year.value);
      var typeValue = normalized(type && type.value);
      var haystack = normalized([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-keywords')
      ].join(' '));

      if (q && haystack.indexOf(q) === -1) {
        return false;
      }
      if (regionValue && normalized(card.getAttribute('data-region')) !== regionValue) {
        return false;
      }
      if (yearValue && normalized(card.getAttribute('data-year')) !== yearValue) {
        return false;
      }
      if (typeValue && normalized(card.getAttribute('data-type')) !== typeValue) {
        return false;
      }
      return true;
    }

    function apply() {
      cards.forEach(function (card) {
        card.hidden = !matches(card);
      });
    }

    [input, region, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
  });
})();
