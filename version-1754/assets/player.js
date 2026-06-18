(function () {
  var hlsLibrary = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.7/dist/hls.min.js';
  var hlsLoading = false;
  var hlsCallbacks = [];

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    hlsCallbacks.push(callback);
    if (hlsLoading) {
      return;
    }

    hlsLoading = true;
    var script = document.createElement('script');
    script.src = hlsLibrary;
    script.async = true;
    script.onload = function () {
      hlsLoading = false;
      hlsCallbacks.splice(0).forEach(function (item) {
        item();
      });
    };
    script.onerror = function () {
      hlsLoading = false;
      hlsCallbacks.splice(0).forEach(function (item) {
        item(new Error('load failed'));
      });
    };
    document.head.appendChild(script);
  }

  function bindPlayer(card) {
    var video = card.querySelector('video[data-stream]');
    var overlay = card.querySelector('.player-overlay');
    var message = card.querySelector('.player-message');
    var started = false;
    var hls = null;

    if (!video || !overlay) {
      return;
    }

    function setMessage(text) {
      if (message) {
        message.textContent = text || '';
      }
    }

    function playVideo() {
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          setMessage('请再次点击播放');
        });
      }
    }

    function start() {
      var stream = video.getAttribute('data-stream');
      if (!stream) {
        return;
      }

      overlay.classList.add('is-hidden');
      setMessage('');

      if (started) {
        playVideo();
        return;
      }
      started = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        video.addEventListener('loadedmetadata', playVideo, { once: true });
        video.addEventListener('error', function () {
          setMessage('播放暂时不可用，请稍后再试');
        });
        video.load();
        playVideo();
        return;
      }

      loadHls(function (error) {
        if (error || !window.Hls || !window.Hls.isSupported()) {
          setMessage('播放暂时不可用，请稍后再试');
          overlay.classList.remove('is-hidden');
          started = false;
          return;
        }

        hls = new window.Hls({
          maxBufferLength: 45,
          backBufferLength: 30,
          enableWorker: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          playVideo();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }
          setMessage('播放暂时不可用，请稍后再试');
          overlay.classList.remove('is-hidden');
          hls.destroy();
          hls = null;
          started = false;
        });
      });
    }

    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (!started) {
        start();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(bindPlayer);
})();
