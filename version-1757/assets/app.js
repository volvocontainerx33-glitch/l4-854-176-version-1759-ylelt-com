(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));

  searchInputs.forEach(function (input) {
    var scope = document.querySelector(input.getAttribute('data-search-scope')) || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var empty = scope.querySelector('[data-empty-state]');

    input.addEventListener('input', function () {
      var query = input.value.trim().toLowerCase();
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.textContent
        ].join(' ').toLowerCase();
        var matched = !query || haystack.indexOf(query) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    });
  });

  var video = document.querySelector('[data-player]');
  var playButtons = Array.prototype.slice.call(document.querySelectorAll('[data-play-button]'));
  var streamReady = false;
  var hlsInstance = null;

  function prepareVideo() {
    if (!video || streamReady) {
      return;
    }

    var url = video.getAttribute('data-stream');

    if (!url) {
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: false
      });
      hlsInstance.loadSource(url);
      hlsInstance.attachMedia(video);
    } else {
      video.src = url;
    }

    streamReady = true;
  }

  function startPlayback() {
    if (!video) {
      return;
    }

    prepareVideo();

    playButtons.forEach(function (button) {
      button.classList.add('hidden');
    });

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {
        playButtons.forEach(function (button) {
          button.classList.remove('hidden');
        });
      });
    }
  }

  playButtons.forEach(function (button) {
    button.addEventListener('click', startPlayback);
  });

  if (video) {
    video.addEventListener('play', function () {
      playButtons.forEach(function (button) {
        button.classList.add('hidden');
      });
    });

    video.addEventListener('pause', function () {
      if (!video.ended) {
        playButtons.forEach(function (button) {
          button.classList.remove('hidden');
        });
      }
    });
  }
})();
