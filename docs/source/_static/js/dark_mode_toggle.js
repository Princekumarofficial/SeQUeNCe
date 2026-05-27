// Dark mode toggle functionality for Sphinx RTD theme
(function() {
    const DARK_MODE_KEY = 'sphinx-dark-mode';
    const html = document.documentElement;

    // Safe storage helpers — wrap localStorage access in try/catch
    function safeGetItem(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    }

    // Determine initial dark mode state
    function getDarkModePreference() {
        // Check storage first (safe wrapper)
        const saved = safeGetItem(DARK_MODE_KEY);
        if (saved !== null) {
            return saved === 'true';
        }
        // Fall back to system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // Apply dark mode class immediately to avoid FOUC before rendering starts
    const initialDarkMode = getDarkModePreference();
    if (initialDarkMode) {
        html.classList.add('dark-mode');
    } else {
        html.classList.remove('dark-mode');
    }

    // Swap images with data-dark attribute based on current mode
    function swapImages(isDark) {
        try {
            const imgs = document.querySelectorAll('img[data-dark]');
            imgs.forEach(function(img){
                if (isDark) {
                    if (!img.dataset.lightSrc) img.dataset.lightSrc = img.src;
                    img.src = img.dataset.dark;
                } else {
                    if (img.dataset.lightSrc) img.src = img.dataset.lightSrc;
                }
            });
        } catch(e) {
            // ignore image swap errors
        }
    }

    // Apply dark mode (class and images)
    function applyDarkMode(isDark) {
        if (isDark) {
            html.classList.add('dark-mode');
        } else {
            html.classList.remove('dark-mode');
        }
        swapImages(isDark);
    }

    // Persist preference only on explicit user action
    function safeSetItem(key, value) {
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            return false;
        }
    }

    function persistPreference(isDark) {
        safeSetItem(DARK_MODE_KEY, isDark);
    }

    // Create and insert toggle button
    function createToggleButton() {
        const button = document.createElement('button');
        button.id = 'dark-mode-toggle';
        button.className = 'dark-mode-toggle';
        button.setAttribute('aria-label', 'Toggle dark mode');
        button.setAttribute('title', 'Toggle dark mode');
        button.innerHTML = html.classList.contains('dark-mode') ? '☀️' : '🌙';
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const isDarkMode = html.classList.contains('dark-mode');
            const newMode = !isDarkMode;
            applyDarkMode(newMode);
            // persist because this was an explicit user action
            persistPreference(newMode);
            button.innerHTML = newMode ? '☀️' : '🌙';
        });

        return button;
    }

    // Insert toggle button into page
    function insertToggleButton() {
        // Remove existing button if present
        const existing = document.getElementById('dark-mode-toggle');
        if (existing) {
            existing.remove();
        }

        const button = createToggleButton();
        document.body.appendChild(button);
    }

    // Listen for system preference changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
            if (safeGetItem(DARK_MODE_KEY) === null) {
                applyDarkMode(e.matches);
            }
        });
    }

    // Initialize when DOM is ready
    function ready() {
        // Run image swap (class was already applied immediately in head)
        swapImages(html.classList.contains('dark-mode'));
        insertToggleButton();
    }

    if (document.readyState !== 'loading') {
        ready();
    } else {
        document.addEventListener('DOMContentLoaded', ready);
    }
})();
