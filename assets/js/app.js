(function () {
    "use strict";

    function normalizeText(value) {
        return String(value || "")
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();
    }

    function setupMobileMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-mobile-menu]");

        if (!toggle || !menu) {
            return;
        }

        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHeroCarousel() {
        var hero = document.querySelector("[data-hero]");

        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var currentIndex = 0;
        var timer = null;

        if (slides.length <= 1) {
            return;
        }

        function showSlide(index) {
            currentIndex = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === currentIndex);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === currentIndex);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(currentIndex + 1);
            }, 5000);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var index = Number(dot.getAttribute("data-hero-dot"));
                showSlide(index);
                startTimer();
            });
        });

        hero.addEventListener("mouseenter", stopTimer);
        hero.addEventListener("mouseleave", startTimer);
        startTimer();
    }

    function setupSearchAndFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        var clearButtons = Array.prototype.slice.call(document.querySelectorAll("[data-clear-search]"));
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-category]"));
        var resultSummary = document.querySelector("[data-result-summary]");
        var emptyResult = document.querySelector("[data-empty-result]");
        var activeCategory = "all";

        if (!inputs.length || !cards.length) {
            return;
        }

        function getQuery() {
            return normalizeText(inputs[0].value);
        }

        function syncInputs(value) {
            inputs.forEach(function (input) {
                if (input.value !== value) {
                    input.value = value;
                }
            });
        }

        function updateChipState() {
            chips.forEach(function (chip) {
                chip.classList.toggle("is-active", chip.getAttribute("data-filter-category") === activeCategory);
            });
        }

        function applyFilters() {
            var query = getQuery();
            var visibleCount = 0;

            cards.forEach(function (card) {
                var text = normalizeText(card.getAttribute("data-search"));
                var category = card.getAttribute("data-category") || "";
                var matchesQuery = !query || text.indexOf(query) !== -1;
                var matchesCategory = activeCategory === "all" || category === activeCategory;
                var isVisible = matchesQuery && matchesCategory;

                card.hidden = !isVisible;

                if (isVisible) {
                    visibleCount += 1;
                }
            });

            if (resultSummary) {
                resultSummary.textContent = "当前显示 " + visibleCount + " 部影片";
            }

            if (emptyResult) {
                emptyResult.hidden = visibleCount !== 0;
            }
        }

        inputs.forEach(function (input) {
            input.addEventListener("input", function () {
                syncInputs(input.value);
                applyFilters();
            });
        });

        clearButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                syncInputs("");
                applyFilters();
            });
        });

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                activeCategory = chip.getAttribute("data-filter-category") || "all";
                updateChipState();
                applyFilters();
            });
        });

        updateChipState();
        applyFilters();
    }

    function setupPlayers() {
        var triggers = Array.prototype.slice.call(document.querySelectorAll(".play-trigger"));

        triggers.forEach(function (trigger) {
            trigger.addEventListener("click", function () {
                var shell = trigger.closest(".player-shell");
                var video = shell ? shell.querySelector("video") : null;
                var message = shell ? shell.querySelector("[data-player-message]") : null;
                var source = shell ? shell.getAttribute("data-video-source") : "";

                if (!shell || !video || !source) {
                    if (message) {
                        message.textContent = "当前影片没有可用播放源。";
                    }
                    return;
                }

                function playVideo() {
                    shell.classList.add("is-playing");
                    var playPromise = video.play();

                    if (playPromise && typeof playPromise.catch === "function") {
                        playPromise.catch(function () {
                            if (message) {
                                message.textContent = "浏览器阻止了自动播放，请再次点击视频播放。";
                            }
                        });
                    }
                }

                if (shell.getAttribute("data-player-ready") === "true") {
                    playVideo();
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    shell.setAttribute("data-player-ready", "true");
                    playVideo();
                    return;
                }

                if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });

                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        shell.setAttribute("data-player-ready", "true");
                        playVideo();
                    });
                    hls.on(window.Hls.Events.ERROR, function (eventName, data) {
                        if (data && data.fatal && message) {
                            message.textContent = "播放源加载失败，请稍后重试。";
                        }
                    });
                    return;
                }

                video.src = source;
                shell.setAttribute("data-player-ready", "true");
                if (message) {
                    message.textContent = "当前浏览器可能不支持 HLS，已尝试直接加载播放源。";
                }
                playVideo();
            });
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        setupMobileMenu();
        setupHeroCarousel();
        setupSearchAndFilters();
        setupPlayers();
    });
}());
