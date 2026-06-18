(function() {
    var mobileToggle = document.querySelector(".mobile-toggle");
    var mobilePanel = document.getElementById("mobile-menu");

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener("click", function() {
            var isOpen = mobilePanel.classList.toggle("open");
            mobileToggle.setAttribute("aria-expanded", String(isOpen));
        });
    }

    document.querySelectorAll("[data-hero]").forEach(function(hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
        var previous = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var active = 0;
        var timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }

            active = (index + slides.length) % slides.length;

            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === active);
            });

            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function() {
                show(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (previous) {
            previous.addEventListener("click", function() {
                show(active - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function() {
                show(active + 1);
                start();
            });
        }

        dots.forEach(function(dot, index) {
            dot.addEventListener("click", function() {
                show(index);
                start();
            });
        });

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    });

    document.querySelectorAll("[data-filter-form]").forEach(function(form) {
        var scope = form.closest("main") || document;
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
        var searchInput = form.querySelector("[data-search-input]");
        var typeFilter = form.querySelector("[data-type-filter]");
        var yearFilter = form.querySelector("[data-year-filter]");
        var emptyState = scope.querySelector("[data-empty-state]");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");

        if (query && searchInput && !searchInput.value) {
            searchInput.value = query;
        }

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applyFilters() {
            var keyword = normalize(searchInput ? searchInput.value : "");
            var typeValue = normalize(typeFilter ? typeFilter.value : "");
            var yearValue = normalize(yearFilter ? yearFilter.value : "");
            var visible = 0;

            cards.forEach(function(card) {
                var title = normalize(card.getAttribute("data-title"));
                var tags = normalize(card.getAttribute("data-tags"));
                var type = normalize(card.getAttribute("data-type"));
                var year = normalize(card.getAttribute("data-year"));
                var region = normalize(card.getAttribute("data-region"));
                var matchKeyword = !keyword || title.indexOf(keyword) !== -1 || tags.indexOf(keyword) !== -1 || region.indexOf(keyword) !== -1;
                var matchType = !typeValue || type.indexOf(typeValue) !== -1;
                var matchYear = !yearValue || year.indexOf(yearValue) !== -1;
                var match = matchKeyword && matchType && matchYear;

                card.hidden = !match;

                if (match) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("show", visible === 0);
            }
        }

        ["input", "change"].forEach(function(eventName) {
            form.addEventListener(eventName, applyFilters);
        });

        form.addEventListener("submit", function(event) {
            event.preventDefault();
            applyFilters();
        });

        applyFilters();
    });
})();
