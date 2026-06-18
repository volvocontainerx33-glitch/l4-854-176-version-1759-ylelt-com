(function() {
    window.initMoviePlayer = function(options) {
        var video = document.getElementById(options.videoId);
        var overlay = document.getElementById(options.overlayId);
        var status = document.getElementById(options.statusId);
        var source = options.source;
        var hls = null;
        var prepared = false;

        if (!video || !source) {
            return;
        }

        function setStatus(message) {
            if (status) {
                status.textContent = message || "";
            }
        }

        function showError() {
            setStatus("播放暂不可用，请稍后再试");
            if (overlay) {
                overlay.classList.remove("is-hidden");
            }
        }

        function prepare() {
            if (prepared) {
                return;
            }

            prepared = true;

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });

                hls.loadSource(source);
                hls.attachMedia(video);

                hls.on(window.Hls.Events.MANIFEST_PARSED, function() {
                    setStatus("");
                });

                hls.on(window.Hls.Events.ERROR, function(event, data) {
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

                    showError();
                });

                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.addEventListener("loadedmetadata", function() {
                    setStatus("");
                }, { once: true });
                video.addEventListener("error", showError);
                return;
            }

            showError();
        }

        function play() {
            prepare();

            if (overlay) {
                overlay.classList.add("is-hidden");
            }

            setStatus("正在准备播放");

            var promise = video.play();

            if (promise && typeof promise.then === "function") {
                promise.then(function() {
                    setStatus("");
                }).catch(function() {
                    showError();
                });
            }
        }

        prepare();

        if (overlay) {
            overlay.addEventListener("click", play);
        }

        video.addEventListener("play", function() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }

            setStatus("");
        });

        video.addEventListener("pause", function() {
            if (video.currentTime === 0 && overlay) {
                overlay.classList.remove("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function() {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    };
})();
