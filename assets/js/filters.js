/**
 * DevBrief - Filtering & State Management Module
 */

const FilterService = {
    searchTerm: '',
    selectedSources: new Set(),
    activeCategory: 'all',

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

            // Source filter (if any sources selected, must match one of them)
            if (this.selectedSources.size > 0 && !this.selectedSources.has(article.source)) {
                return false;
            }

            // Search filter (title or URL)
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
