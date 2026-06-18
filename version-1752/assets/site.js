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
      nav.classList.toggle('open');
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
      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === index);
      });
    }
    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function restart(next) {
      window.clearInterval(timer);
      show(next);
      start();
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        restart(Number(dot.getAttribute('data-hero-dot') || 0));
      });
    });
    start();
  }

  function setupFilters() {
    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
      var scope = panel.parentElement || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card-list] .movie-card, [data-card-list] .ranking-card'));
      if (!cards.length) {
        cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .ranking-card'));
      }
      var input = panel.querySelector('[data-search-input]');
      var selects = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-select]'));
      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var filters = {};
        selects.forEach(function (select) {
          filters[select.getAttribute('data-filter-select')] = select.value;
        });
        cards.forEach(function (card) {
          var text = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
          var matched = !query || text.indexOf(query) !== -1;
          Object.keys(filters).forEach(function (key) {
            var value = filters[key];
            if (value && card.getAttribute('data-' + key) !== value) {
              matched = false;
            }
          });
          card.classList.toggle('is-hidden', !matched);
        });
      }
      if (input) {
        input.addEventListener('input', apply);
      }
      selects.forEach(function (select) {
        select.addEventListener('change', apply);
      });
    });
  }

  function setupJumpSearch() {
    document.querySelectorAll('[data-jump-search]').forEach(function (form) {
      form.addEventListener('submit', function () {
        var input = form.querySelector('input[name="q"]');
        if (input && input.value.trim()) {
          window.sessionStorage.setItem('movieSearchQuery', input.value.trim());
        }
      });
    });
    var saved = window.sessionStorage.getItem('movieSearchQuery');
    if (saved) {
      var firstInput = document.querySelector('[data-search-input]');
      if (firstInput) {
        firstInput.value = saved;
        firstInput.dispatchEvent(new Event('input'));
        window.sessionStorage.removeItem('movieSearchQuery');
      }
    }
  }

  function attachPlayer(video, source, shell, message) {
    var attached = false;
    var hls = null;
    function writeMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }
    function prepare() {
      if (attached) {
        return;
      }
      attached = true;
      writeMessage('');
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false,
          backBufferLength: 90
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            writeMessage('播放暂不可用，请稍后再试');
            hls.destroy();
          }
        });
        return;
      }
      writeMessage('播放暂不可用，请稍后再试');
    }
    function play() {
      prepare();
      shell.classList.add('is-playing');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }
    shell.querySelectorAll('[data-play-trigger]').forEach(function (trigger) {
      trigger.addEventListener('click', play);
    });
    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        return;
      }
      shell.classList.remove('is-playing');
    });
    video.addEventListener('click', function () {
      if (video.paused) {
        play();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.SitePlayer = {
    mount: function (id, source) {
      var video = document.getElementById(id);
      if (!video || !source) {
        return;
      }
      var shell = video.closest('.player-shell');
      if (!shell) {
        return;
      }
      attachPlayer(video, source, shell, shell.querySelector('.player-message'));
    }
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupJumpSearch();
  });
})();
