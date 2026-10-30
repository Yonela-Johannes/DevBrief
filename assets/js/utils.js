/**
 * DevBrief - Serene Utility Functions
 */

const Utils = {
    /**
     * Escape HTML special characters to prevent XSS
     */
    escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Create a URL-friendly slug from title
     */
    createSlug(text) {
        if (!text) return 'story';
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')
            .slice(0, 60);
    },

    /**
     * Extract host/domain name from a URL cleanly
     */
    getDomainHost(urlStr) {
        if (!urlStr) return '';
        try {
            const parsed = new URL(urlStr);
            return parsed.hostname.replace(/^www\./, '');
        } catch (e) {
            return '';
        }
    },

    /**
     * Validate if a string is a safe external http/https URL
     */
    isValidUrl(urlStr) {
        if (!urlStr) return false;
        try {
            const parsed = new URL(urlStr);
            return parsed.protocol === 'http:' || parsed.protocol === 'https:';
        } catch (e) {
            return false;
        }
    },

    /**
     * Calculate estimated reading time for an article
     */
    calculateReadingTime(text = '') {
        const words = text.trim().split(/\s+/).length || 1;
        const minutes = Math.ceil(words / 200);
        return `${Math.max(1, minutes)} min read`;
    },

    /**
     * Format timestamp to a human-readable relative or formatted date
     */
    formatRelativeTime(dateInput) {
        if (!dateInput) return 'Recently';

        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return 'Recently';

        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 0 || diffInSeconds < 60) return 'Just now';

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return this.formatFullDate(date);
    },

    /**
     * Format date to short readable date string (e.g. "8 Mar 2026")
     */
    formatFullDate(dateInput) {
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return '—';

        return date.toLocaleDateString('en-ZA', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    },

    /**
     * Debounce function calls for search inputs
     */
    debounce(fn, delay = 200) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    },

    /**
     * Theme management (Light vs Dark mode)
     */
    getSavedTheme() {
        return localStorage.getItem('devbrief-theme') || 'dark';
    },

    setSavedTheme(theme) {
        localStorage.setItem('devbrief-theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
    }
};
