(function () {
  let activeHls = null;

  function initializePlayer(url) {
    const video = document.getElementById("movieVideo");
    const overlay = document.getElementById("playerOverlay");
    const status = document.getElementById("playerStatus");
    if (!video || !overlay || !url) {
      return;
    }

    let attached = false;

    function attachVideo() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        activeHls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        activeHls.loadSource(url);
        activeHls.attachMedia(video);
      } else {
        video.src = url;
      }
    }

    function playVideo() {
      attachVideo();
      overlay.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    video.addEventListener("error", function () {
      if (status) {
        status.textContent = "播放暂时不可用";
      }
      overlay.classList.remove("is-hidden");
    });
  }

  window.initializePlayer = initializePlayer;
})();
