/**
 * DevBrief — Editorial Utilities
 */

const Utils = {
    /**
     * Escape HTML special characters
     */
    escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    /**
     * Create a URL slug from title
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
     * Extract host/domain name cleanly
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
     * Validate if string is safe external URL
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
     * Format timestamp to a relative time
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
     * Format date string (e.g. "Mar 8, 2026")
     */
    formatFullDate(dateInput) {
        const date = new Date(dateInput);
        if (isNaN(date.getTime())) return '—';

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    },

    /**
     * Debounce function calls
     */
    debounce(fn, delay = 200) {
        let timeoutId;
        return function (...args) {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn.apply(this, args), delay);
        };
    }
};
