(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var wrapper = document.querySelector('[data-player]');
    if (!wrapper) {
      return;
    }

    var video = wrapper.querySelector('video');
    var button = wrapper.querySelector('[data-play-button]');
    var status = wrapper.querySelector('[data-status]');
    var stream = wrapper.getAttribute('data-stream');
    var engine = null;
    var bound = false;

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function attachStream() {
      if (bound || !video || !stream) {
        return;
      }
      bound = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        engine = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        engine.loadSource(stream);
        engine.attachMedia(video);
        engine.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            setStatus('播放暂时不可用');
          }
        });
      } else {
        video.src = stream;
      }
    }

    function play() {
      attachStream();
      wrapper.classList.add('is-playing');
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {
          wrapper.classList.remove('is-playing');
          setStatus('再次点击播放');
        });
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        play();
      });
    }

    wrapper.addEventListener('click', function (event) {
      if (event.target === video || event.target === wrapper) {
        play();
      }
    });

    video.addEventListener('play', function () {
      wrapper.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 || video.ended) {
        wrapper.classList.remove('is-playing');
      }
    });

    window.addEventListener('beforeunload', function () {
      if (engine) {
        engine.destroy();
      }
    });
  });
})();
