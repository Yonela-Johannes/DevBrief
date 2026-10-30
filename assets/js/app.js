/**
 * DevBrief — Main Application Controller & Router (Light Mode Edition)
 */

const App = {
    async init() {
        const feedContainer = document.getElementById('newsFeedContainer');
        ArticlesComponent.renderSkeletons(feedContainer, 5);

        // Load dataset
        const result = await DataService.loadArticles();
        if (!result.success) {
            ArticlesComponent.renderErrorState(feedContainer, result.error);
            return;
        }

        // Initialize UI
        this.renderCategoryTabs();
        this.renderSourceDropdown();
        this.setupEventListeners();
        this.setupRouter();

        // Initial Route Render
        this.handleRoute();
    },

    /**
     * Hash Router
     */
    setupRouter() {
        window.addEventListener('hashchange', () => this.handleRoute());
    },

    handleRoute() {
        const hash = window.location.hash || '#feed';
        const leadSection = document.getElementById('leadStoryContainer');
        const controlSection = document.getElementById('controlBarSection');
        const categorySection = document.getElementById('categoryNavSection');
        const feedContainer = document.getElementById('newsFeedContainer');
        const feedHeader = document.getElementById('storiesHeaderBlock');

        // Update Nav Link Active State
        document.querySelectorAll('.nav-link').forEach(link => {
            const href = link.getAttribute('href');
            const isActive = (hash === '#feed' && href === '#feed') ||
                             (hash === '#about' && href === '#about') ||
                             (hash.startsWith('#article/') && href === '#feed');
            link.classList.toggle('active', isActive);
        });

        if (hash.startsWith('#article/')) {
            const slug = hash.replace('#article/', '');
            const article = DataService.getArticleBySlug(slug);
            const related = DataService.getRelatedStories(article, 3);

            if (leadSection) leadSection.style.display = 'none';
            if (controlSection) controlSection.style.display = 'none';
            if (categorySection) categorySection.style.display = 'none';
            if (feedHeader) feedHeader.style.display = 'none';

            if (article) {
                ArticlesComponent.renderReaderView(feedContainer, article, related);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                ArticlesComponent.renderErrorState(feedContainer, 'Story not found.');
            }
        } else if (hash === '#about') {
            if (leadSection) leadSection.style.display = 'none';
            if (controlSection) controlSection.style.display = 'none';
            if (categorySection) categorySection.style.display = 'none';
            if (feedHeader) feedHeader.style.display = 'none';

            ArticlesComponent.renderAboutView(feedContainer);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Main Feed View
            if (controlSection) controlSection.style.display = 'flex';
            if (categorySection) categorySection.style.display = 'flex';
            if (feedHeader) feedHeader.style.display = 'flex';

            this.applyAndRender();
        }
    },

    /**
     * Category Navigation
     */
    renderCategoryTabs() {
        const container = document.getElementById('categoryTabsContainer');
        if (!container) return;

        const categories = DataService.getAvailableCategories();

        container.innerHTML = categories.map(catKey => {
            const meta = DataService.categoriesMeta[catKey] || { label: catKey };
            const count = catKey === 'all'
                ? DataService.articles.length
                : DataService.articles.filter(a => a.category === catKey).length;

            const isActive = FilterService.activeCategory === catKey;

            return `
                <button type="button" class="category-tab ${isActive ? 'active' : ''}" data-category="${catKey}">
                    <span>${meta.label}</span>
                    <span class="category-tab-count">${count.toLocaleString()}</span>
                </button>
            `;
        }).join('');

        container.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                FilterService.setCategory(tab.dataset.category);
                this.updateCategoryTabsUI();
                this.applyAndRender();
            });
        });
    },

    updateCategoryTabsUI() {
        const container = document.getElementById('categoryTabsContainer');
        if (!container) return;

        container.querySelectorAll('.category-tab').forEach(tab => {
            const isActive = tab.dataset.category === FilterService.activeCategory;
            tab.classList.toggle('active', isActive);
        });
    },

    /**
     * Source Filter Dropdown
     */
    renderSourceDropdown() {
        const bodyContainer = document.getElementById('sourceDropdownBody');
        if (!bodyContainer) return;

        const sources = DataService.getUniqueSources();

        bodyContainer.innerHTML = sources.map(sourceName => {
            const count = DataService.articles.filter(a => a.source === sourceName).length;
            const isChecked = FilterService.selectedSources.has(sourceName);

            return `
                <label class="dropdown-item">
                    <input type="checkbox" value="${Utils.escapeHTML(sourceName)}" ${isChecked ? 'checked' : ''} class="source-checkbox">
                    <span>${Utils.escapeHTML(sourceName)}</span>
                    <span class="dropdown-item-count">${count.toLocaleString()}</span>
                </label>
            `;
        }).join('');

        bodyContainer.querySelectorAll('.source-checkbox').forEach(chk => {
            chk.addEventListener('change', (e) => {
                FilterService.toggleSource(e.target.value, e.target.checked);
                this.updateDropdownToggleUI();
                this.renderActiveFilterChips();
                this.applyAndRender();
            });
        });
    },

    updateDropdownToggleUI() {
        const toggleBtn = document.getElementById('sourceDropdownToggle');
        const badge = document.getElementById('sourceDropdownBadge');
        if (!toggleBtn || !badge) return;

        const count = FilterService.selectedSources.size;
        if (count > 0) {
            toggleBtn.classList.add('active');
            badge.textContent = count;
            badge.style.display = 'inline-block';
        } else {
            toggleBtn.classList.remove('active');
            badge.style.display = 'none';
        }
    },

    /**
     * Active Filter Chips
     */
    renderActiveFilterChips() {
        const container = document.getElementById('activeFilterChips');
        if (!container) return;

        const chips = [];

        if (FilterService.selectedSources.size > 0) {
            FilterService.selectedSources.forEach(src => {
                chips.push(`
                    <span class="filter-chip">
                        <span>Source: ${Utils.escapeHTML(src)}</span>
                        <button type="button" class="filter-chip-remove" data-remove-source="${Utils.escapeHTML(src)}" aria-label="Remove filter">✕</button>
                    </span>
                `);
            });
        }

        if (FilterService.searchTerm !== '') {
            chips.push(`
                <span class="filter-chip">
                    <span>Search: "${Utils.escapeHTML(FilterService.searchTerm)}"</span>
                    <button type="button" class="filter-chip-remove" data-remove-search="true" aria-label="Remove search">✕</button>
                </span>
            `);
        }

        if (chips.length > 0) {
            container.innerHTML = `
                <span class="active-filters-label">Active:</span>
                ${chips.join('')}
                <button type="button" class="clear-all-filters-btn" id="clearAllFiltersBtn">Clear all</button>
            `;
            container.style.display = 'flex';

            container.querySelectorAll('[data-remove-source]').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const src = e.currentTarget.dataset.removeSource;
                    FilterService.toggleSource(src, false);
                    this.syncSourceCheckboxes();
                    this.updateDropdownToggleUI();
                    this.renderActiveFilterChips();
                    this.applyAndRender();
                });
            });

            const removeSearchBtn = container.querySelector('[data-remove-search]');
            if (removeSearchBtn) {
                removeSearchBtn.addEventListener('click', () => {
                    FilterService.setSearchTerm('');
                    const input = document.getElementById('searchInput');
                    if (input) input.value = '';
                    this.toggleSearchClearBtn(false);
                    this.renderActiveFilterChips();
                    this.applyAndRender();
                });
            }

            const clearAllBtn = document.getElementById('clearAllFiltersBtn');
            if (clearAllBtn) {
                clearAllBtn.addEventListener('click', () => this.resetFilters());
            }
        } else {
            container.innerHTML = '';
            container.style.display = 'none';
        }
    },

    syncSourceCheckboxes() {
        document.querySelectorAll('.source-checkbox').forEach(chk => {
            chk.checked = FilterService.selectedSources.has(chk.value);
        });
    },

    toggleSearchClearBtn(show) {
        const btn = document.getElementById('searchClearBtn');
        if (btn) {
            btn.classList.toggle('visible', show);
        }
    },

    /**
     * Event Listeners
     */
    setupEventListeners() {
        // Search Input
        const searchInput = document.getElementById('searchInput');
        const searchClearBtn = document.getElementById('searchClearBtn');

        if (searchInput) {
            const debouncedSearch = Utils.debounce((val) => {
                FilterService.setSearchTerm(val);
                this.toggleSearchClearBtn(val.length > 0);
                this.renderActiveFilterChips();
                this.applyAndRender();
            }, 180);

            searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));
        }

        if (searchClearBtn) {
            searchClearBtn.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                FilterService.setSearchTerm('');
                this.toggleSearchClearBtn(false);
                this.renderActiveFilterChips();
                this.applyAndRender();
                if (searchInput) searchInput.focus();
            });
        }

        // Source Dropdown Toggle
        const dropdownToggle = document.getElementById('sourceDropdownToggle');
        const dropdownMenu = document.getElementById('sourceDropdownMenu');

        if (dropdownToggle && dropdownMenu) {
            dropdownToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdownMenu.classList.toggle('open');
            });

            document.addEventListener('click', (e) => {
                if (!e.target.closest('#sourceDropdownContainer')) {
                    dropdownMenu.classList.remove('open');
                }
            });
        }

        // Dropdown Actions
        const selectAllBtn = document.getElementById('selectAllSourcesBtn');
        const clearSourcesBtn = document.getElementById('clearSourcesBtn');

        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                FilterService.selectAllSources(DataService.getUniqueSources());
                this.syncSourceCheckboxes();
                this.updateDropdownToggleUI();
                this.renderActiveFilterChips();
                this.applyAndRender();
            });
        }

        if (clearSourcesBtn) {
            clearSourcesBtn.addEventListener('click', () => {
                FilterService.clearSources();
                this.syncSourceCheckboxes();
                this.updateDropdownToggleUI();
                this.renderActiveFilterChips();
                this.applyAndRender();
            });
        }

        // Global Keyboard Shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && document.activeElement !== searchInput) {
                e.preventDefault();
                if (searchInput) searchInput.focus();
            } else if (e.key === 'Escape') {
                if (dropdownMenu) dropdownMenu.classList.remove('open');
                if (document.activeElement === searchInput && searchInput.value !== '') {
                    searchInput.value = '';
                    FilterService.setSearchTerm('');
                    this.toggleSearchClearBtn(false);
                    this.renderActiveFilterChips();
                    this.applyAndRender();
                }
            }
        });
    },

    /**
     * Reset Filters
     */
    resetFilters() {
        FilterService.resetAll();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';

        this.toggleSearchClearBtn(false);
        this.syncSourceCheckboxes();
        this.updateDropdownToggleUI();
        this.updateCategoryTabsUI();
        this.renderActiveFilterChips();
        this.applyAndRender();
    },

    /**
     * Apply active filters & re-render
     */
    applyAndRender() {
        if (window.location.hash.startsWith('#article/') || window.location.hash === '#about') {
            return;
        }

        const filteredArticles = FilterService.applyFilters(DataService.articles);
        const leadContainer = document.getElementById('leadStoryContainer');

        // Render Lead Story if no active filters
        if (!FilterService.hasActiveFilters() && DataService.articles.length > 0) {
            ArticlesComponent.renderLeadStory(leadContainer, DataService.getLeadStory());
        } else if (leadContainer) {
            leadContainer.style.display = 'none';
        }

        // Update Feed Header Count
        const feedCountElem = document.getElementById('storiesCountText');
        if (feedCountElem) {
            feedCountElem.textContent = `${filteredArticles.length.toLocaleString()} stories`;
        }

        // Update Stats Component
        StatsComponent.update(DataService.articles, filteredArticles);

        // Render Feed
        const feedContainer = document.getElementById('newsFeedContainer');
        ArticlesComponent.renderFeed(feedContainer, filteredArticles);
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => App.init());
