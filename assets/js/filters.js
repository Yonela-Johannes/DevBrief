/**
 * DevBrief - Filtering & View State Management Module
 */

const FilterService = {
    searchTerm: '',
    selectedSources: new Set(),
    activeCategory: 'all',
    viewMode: localStorage.getItem('devbrief-view-mode') || 'grid', // 'grid' or 'list'
    currentRoute: 'feed', // 'feed', 'article', 'about'
    activeArticleSlug: null,

    setViewMode(mode) {
        if (mode === 'grid' || mode === 'list') {
            this.viewMode = mode;
            localStorage.setItem('devbrief-view-mode', mode);
        }
    },

    setSearchTerm(term) {
        this.searchTerm = (term || '').trim().toLowerCase();
    },

    toggleSource(source, isSelected) {
        if (isSelected) {
            this.selectedSources.add(source);
        } else {
            this.selectedSources.delete(source);
        }
    },

    clearSources() {
        this.selectedSources.clear();
    },

    selectAllSources(sourcesList = []) {
        this.selectedSources = new Set(sourcesList);
    },

    setCategory(cat) {
        this.activeCategory = cat || 'all';
    },

    resetAll() {
        this.searchTerm = '';
        this.selectedSources.clear();
        this.activeCategory = 'all';
    },

    hasActiveFilters() {
        return this.searchTerm !== '' || this.selectedSources.size > 0 || this.activeCategory !== 'all';
    },

    /**
     * Apply current active filters to an array of articles
     */
    applyFilters(articles = []) {
        return articles.filter(article => {
            // Category filter
            if (this.activeCategory !== 'all' && article.category !== this.activeCategory) {
                return false;
            }

            // Source filter
            if (this.selectedSources.size > 0 && !this.selectedSources.has(article.source)) {
                return false;
            }

            // Search filter
            if (this.searchTerm !== '') {
                const titleMatch = article.title.toLowerCase().includes(this.searchTerm);
                const urlMatch = article.url.toLowerCase().includes(this.searchTerm);
                const sourceMatch = article.source.toLowerCase().includes(this.searchTerm);
                if (!titleMatch && !urlMatch && !sourceMatch) {
                    return false;
                }
            }

            return true;
        });
    }
};
