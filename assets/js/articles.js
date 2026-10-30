/**
 * DevBrief - Article Feed & View Rendering Component (Serene Design System)
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

    /**
     * Render Featured Hero Section
     */
    renderFeaturedHero(container, article) {
        if (!container) return;
        if (!article) {
            container.innerHTML = '';
            container.style.display = 'none';
            return;
        }

        const titleSafe = Utils.escapeHTML(article.title);
        const sourceSafe = Utils.escapeHTML(article.source);
        const dateFormatted = Utils.formatFullDate(article.timestamp);
        const urlSafe = Utils.isValidUrl(article.url) ? Utils.escapeHTML(article.url) : '#';
        const catMeta = DataService.categoriesMeta[article.category] || { label: article.category, icon: '📌' };

        container.style.display = 'block';
        container.innerHTML = `
            <div class="featured-hero-card">
                <div class="featured-content">
                    <div class="featured-top">
                        <div class="featured-badges">
                            <span class="badge-category" data-cat="${article.category}">${catMeta.icon} ${catMeta.label}</span>
                            <span style="font-size: 0.75rem; color: var(--foreground-muted); font-family: var(--font-mono);">${article.readingTime}</span>
                        </div>
                        <h2 class="featured-title">
                            <a href="#article/${article.slug}">
                                ${titleSafe}
                            </a>
                        </h2>
                        <p class="featured-desc">${Utils.escapeHTML(article.excerpt)}</p>
                    </div>
                    <div class="featured-footer">
                        <span>Reported by <strong>${sourceSafe}</strong> • ${dateFormatted}</span>
                        <a href="#article/${article.slug}" class="btn-primary-action" style="font-size: 0.825rem; padding: 6px 14px;">
                            Read Article →
                        </a>
                    </div>
                </div>
                <div class="featured-visual">
                    <div class="featured-visual-mark">S</div>
                </div>
            </div>
        `;
    },

    /**
     * Render Articles Feed (Grid or List view)
     */
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
        const isListMode = FilterService.viewMode === 'list';

        const cardsHTML = visibleArticles
            .map(art => isListMode ? this.createListCardHTML(art) : this.createGridCardHTML(art))
            .join('');

        let loadMoreHTML = '';
        if (articles.length > this.displayedCount) {
            const remaining = articles.length - this.displayedCount;
            loadMoreHTML = `
                <div style="text-align: center; margin-top: 36px;">
                    <button type="button" class="state-action-btn" id="loadMoreArticlesBtn">
                        Load More Articles (${remaining.toLocaleString()} remaining)
                    </button>
                </div>
            `;
        }

        const wrapperClass = isListMode ? 'article-list' : 'article-grid';
        container.innerHTML = `<div class="${wrapperClass}">${cardsHTML}</div>${loadMoreHTML}`;

        // Wire Load More Button
        const loadMoreBtn = document.getElementById('loadMoreArticlesBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.displayedCount += this.pageSize;
                this.renderFeed(container, this.currentFilteredArticles, false);
            });
        }
    },

    /**
     * BlogCard Grid Style
     */
    createGridCardHTML(article) {
        const titleSafe = Utils.escapeHTML(article.title);
        const sourceSafe = Utils.escapeHTML(article.source);
        const dateFormatted = Utils.formatFullDate(article.timestamp);
        const catMeta = DataService.categoriesMeta[article.category] || { label: article.category, icon: '📌' };

        return `
            <article class="article-card-grid" onclick="location.hash='#article/${article.slug}'">
                <div class="article-card-top">
                    <div class="article-meta-header">
                        <div class="article-source-group">
                            <div class="article-source-avatar">${sourceSafe.charAt(0)}</div>
                            <span class="article-source-name">${sourceSafe}</span>
                        </div>
                        <span class="article-date">${dateFormatted}</span>
                    </div>

                    <div class="card-divider"></div>

                    <h3 class="article-title-grid">
                        ${titleSafe}
                    </h3>
                </div>

                <div class="article-card-bottom">
                    <span class="badge-category" data-cat="${article.category}">${catMeta.label}</span>
                    <span class="read-link-action">
                        Read
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                    </span>
                </div>
            </article>
        `;
    },

    /**
     * Post List Style
     */
    createListCardHTML(article) {
        const titleSafe = Utils.escapeHTML(article.title);
        const sourceSafe = Utils.escapeHTML(article.source);
        const dateFormatted = Utils.formatFullDate(article.timestamp);

        return `
            <article class="article-card-list" onclick="location.hash='#article/${article.slug}'">
                <div class="article-list-icon">${sourceSafe.charAt(0)}</div>
                <div class="article-list-content">
                    <h3 class="article-title-list">${titleSafe}</h3>
                    <div class="article-list-meta">
                        <span>Source: ${sourceSafe}</span>
                        <span>•</span>
                        <span>${article.readingTime}</span>
                    </div>
                </div>
                <div class="article-list-right">
                    <span style="font-size: 0.725rem; font-family: var(--font-mono); color: var(--foreground-muted); margin-bottom: 2px;">${dateFormatted}</span>
                    <span class="article-list-read">Read Article →</span>
                </div>
            </article>
        `;
    },

    /**
     * Single Article Reader View
     */
    renderReaderView(container, article, related = []) {
        if (!container || !article) return;

        const titleSafe = Utils.escapeHTML(article.title);
        const sourceSafe = Utils.escapeHTML(article.source);
        const urlSafe = Utils.isValidUrl(article.url) ? Utils.escapeHTML(article.url) : '#';
        const dateFormatted = Utils.formatFullDate(article.timestamp);
        const hostName = Utils.getDomainHost(article.url);
        const catMeta = DataService.categoriesMeta[article.category] || { label: article.category, icon: '📌' };

        let relatedHTML = '';
        if (related.length > 0) {
            relatedHTML = `
                <div style="margin-top: 48px;">
                    <h3 style="font-size: 1.15rem; font-weight: 700; margin-bottom: 20px;">Related Tech Stories</h3>
                    <div class="article-grid">
                        ${related.map(art => this.createGridCardHTML(art)).join('')}
                    </div>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="prose-container reader-view">
                <button type="button" class="back-btn" onclick="location.hash='#feed'">
                    ← Back to News Feed
                </button>

                <header class="reader-header">
                    <div class="reader-meta-bar">
                        <span class="badge-category" data-cat="${article.category}">${catMeta.icon} ${catMeta.label}</span>
                        <span style="font-size: 0.8rem; color: var(--foreground-muted); font-family: var(--font-mono);">${article.readingTime}</span>
                        <span style="font-size: 0.8rem; color: var(--foreground-muted);">•</span>
                        <span style="font-size: 0.8rem; color: var(--foreground-muted); font-family: var(--font-mono);">${dateFormatted}</span>
                    </div>

                    <h1 class="reader-title">${titleSafe}</h1>

                    <div class="reader-author-box">
                        <div class="article-source-avatar" style="width:28px; height:28px; font-size: 0.85rem;">${sourceSafe.charAt(0)}</div>
                        <span>Originally published on <strong>${sourceSafe}</strong> ${hostName ? `(${hostName})` : ''}</span>
                    </div>
                </header>

                <div class="reader-prose-card">
                    <p style="margin-bottom: 16px;">${Utils.escapeHTML(article.excerpt)}</p>
                    <p>DevBrief curates stories directly from original technology channels. To read the full, unedited publication with discussions and comments, open the original article link below.</p>
                </div>

                <div class="reader-callout-box">
                    <div>
                        <div class="reader-callout-title">Read Full Article on ${sourceSafe}</div>
                        <div class="reader-callout-desc">Opens original external page in a new secure browser tab.</div>
                    </div>
                    <a href="${urlSafe}" target="_blank" rel="noopener noreferrer" class="btn-primary-action">
                        Open Original Story ↗
                    </a>
                </div>

                ${relatedHTML}
            </div>
        `;
    },

    /**
     * About Page View
     */
    renderAboutView(container) {
        if (!container) return;

        container.innerHTML = `
            <div class="prose-container about-view">
                <div class="about-hero">
                    <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--brand); font-weight: 700; margin-bottom: 8px;">About DevBrief</div>
                    <h1 style="font-family: var(--font-serif); font-size: 2.5rem; font-weight: 700; margin-bottom: 12px; letter-spacing: -0.02em;">A Living Record of Technology & Engineering</h1>
                    <p style="font-size: 1.1rem; color: var(--foreground-soft); line-height: 1.6;">DevBrief is a developer-focused technology aggregator that collects, normalizes, and curates technical discussions, product releases, and engineering research across the web into a clean editorial experience.</p>
                </div>

                <div class="about-card">
                    <h2 class="about-section-title">Core Philosophy</h2>
                    <p class="about-p">Modern developers spend hours scanning dozens of fragmented platforms — Hacker News, DEV Community, TechCrunch, Product Hunt, Reddit, and specialized RSS feeds. DevBrief unifies these streams into a single, high-signal, zero-noise publication system.</p>
                    <p class="about-p">We prioritize readability, typography, fast performance, and direct attribution back to the original authors and publications.</p>
                </div>

                <div class="about-card">
                    <h2 class="about-section-title">Supported Publications</h2>
                    <ul style="list-style: disc; margin-left: 20px; font-size: 0.95rem; color: var(--foreground-soft); line-height: 1.8;">
                        <li><strong>Hacker News:</strong> Top & newest submissions in tech and startups</li>
                        <li><strong>DEV Community:</strong> In-depth tutorials and developer articles</li>
                        <li><strong>Product Hunt:</strong> New product launches and tool announcements</li>
                        <li><strong>TechCrunch:</strong> Venture capital and startup business news</li>
                        <li><strong>Smashing Magazine & CSS-Tricks:</strong> Web engineering, UI/UX, and front-end development</li>
                        <li><strong>Reddit (r/programming & r/technology):</strong> Community software discussions</li>
                    </ul>
                </div>

                <div class="about-card">
                    <h2 class="about-section-title">Architecture & Privacy</h2>
                    <p class="about-p">DevBrief operates on a lightweight Python scraping pipeline that periodically fetches, deduplicates, and commits structured JSON data. The web frontend runs completely in vanilla HTML5, CSS3, and JavaScript without third-party tracking scripts or heavy frontend framework overhead.</p>
                </div>
            </div>
        `;
    },

    renderEmptyState(container) {
        container.innerHTML = `
            <div class="state-container">
                <div class="state-icon">🔍</div>
                <h3 class="state-title">No stories match your filter criteria</h3>
                <p class="state-desc">Try clearing your search query or selecting different sources and categories.</p>
                <button class="state-action-btn" id="resetFiltersBtn">Reset All Filters</button>
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
                <p class="state-desc">${Utils.escapeHTML(message || 'Failed to fetch article dataset.')} Please ensure <code>data.json</code> exists in the root directory.</p>
                <button class="state-action-btn" onclick="location.reload()">Retry Loading</button>
            </div>
        `;
    }
};
