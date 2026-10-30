/**
 * DevBrief - Article Feed & Card Rendering Component
 */

const ArticlesComponent = {
    pageSize: 48,
    displayedCount: 48,
    currentFilteredArticles: [],

    renderSkeletons(container, count = 6) {
        if (!container) return;
        let html = '<div class="skeleton-grid">';
        for (let i = 0; i < count; i++) {
            html += `
                <div class="skeleton-card">
                    <div class="skeleton-line" style="width: 40%; height: 16px;"></div>
                    <div class="skeleton-line" style="width: 90%; height: 24px;"></div>
                    <div class="skeleton-line" style="width: 70%; height: 24px;"></div>
                    <div class="skeleton-line" style="width: 50%; height: 14px; margin-top: auto;"></div>
                </div>
            `;
        }
        html += '</div>';
        container.innerHTML = html;
    },

    renderFeed(container, articles = [], resetPage = true) {
        if (!container) return;

        this.currentFilteredArticles = articles;
        if (resetPage) {
            this.displayedCount = this.pageSize;
        }

        if (articles.length === 0) {
            this.renderEmptyState(container);
            return;
        }

        const visibleArticles = articles.slice(0, this.displayedCount);
        const cardsHTML = visibleArticles.map(art => this.createCardHTML(art)).join('');

        let loadMoreHTML = '';
        if (articles.length > this.displayedCount) {
            const remaining = articles.length - this.displayedCount;
            loadMoreHTML = `
                <div style="text-align: center; margin-top: 32px;">
                    <button type="button" class="state-action-btn" id="loadMoreArticlesBtn">
                        Load More Articles (${remaining.toLocaleString()} remaining)
                    </button>
                </div>
            `;
        }

        container.innerHTML = `<div class="article-grid">${cardsHTML}</div>${loadMoreHTML}`;

        // Wire load more button
        const loadMoreBtn = document.getElementById('loadMoreArticlesBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.displayedCount += this.pageSize;
                this.renderFeed(container, this.currentFilteredArticles, false);
            });
        }
    },

    createCardHTML(article) {
        const titleSafe = Utils.escapeHTML(article.title);
        const sourceSafe = Utils.escapeHTML(article.source);
        const urlSafe = Utils.isValidUrl(article.url) ? Utils.escapeHTML(article.url) : '#';
        const hostName = Utils.getDomainHost(article.url);
        const relTime = Utils.formatRelativeTime(article.timestamp);
        const catMeta = DataService.categoriesMeta[article.category] || { label: article.category, icon: '📌' };

        return `
            <article class="article-card">
                <div class="article-card-top">
                    <div class="article-badges">
                        <span class="badge badge-source">${sourceSafe}</span>
                        <span class="badge badge-category" data-cat="${article.category}">${catMeta.icon} ${catMeta.label}</span>
                    </div>
                    <h2 class="article-title">
                        <a href="${urlSafe}" target="_blank" rel="noopener noreferrer" class="article-title-link">
                            ${titleSafe}
                        </a>
                    </h2>
                </div>
                <div class="article-footer">
                    <div class="article-meta-left">
                        ${hostName ? `<span class="article-host" title="Source domain"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>${Utils.escapeHTML(hostName)}</span>` : ''}
                        <span class="article-time"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${relTime}</span>
                    </div>
                    <a href="${urlSafe}" target="_blank" rel="noopener noreferrer" class="article-read-btn" aria-label="Read ${titleSafe}">
                        Read <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                    </a>
                </div>
            </article>
        `;
    },

    renderEmptyState(container) {
        container.innerHTML = `
            <div class="state-container">
                <div class="state-icon">🔍</div>
                <h3 class="state-title">No articles match your criteria</h3>
                <p class="state-desc">Try clearing your search query or selecting different news sources and categories.</p>
                <button class="state-action-btn" id="resetFiltersBtn">Reset Filters</button>
            </div>
        `;

        const btn = document.getElementById('resetFiltersBtn');
        if (btn) {
            btn.addEventListener('click', () => {
                App.resetFilters();
            });
        }
    },

    renderErrorState(container, message) {
        container.innerHTML = `
            <div class="state-container">
                <div class="state-icon">⚠️</div>
                <h3 class="state-title">Unable to load news feed</h3>
                <p class="state-desc">${Utils.escapeHTML(message || 'Failed to fetch article data.')} Please make sure <code>data.json</code> exists and your local server is running.</p>
                <button class="state-action-btn" onclick="location.reload()">Retry Loading</button>
            </div>
        `;
    }
};
