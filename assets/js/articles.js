/**
 * DevBrief — Editorial Rendering Component
 */

const ArticlesComponent = {
    pageSize: 40,
    displayedCount: 40,
    currentFilteredArticles: [],

    renderSkeletons(container, count = 5) {
        if (!container) return;
        let html = '<div class="skeleton-list">';
        for (let i = 0; i < count; i++) {
            html += `
                <div class="skeleton-row">
                    <div class="skeleton-line" style="width: 85%;"></div>
                    <div class="skeleton-line" style="width: 35%; height: 12px;"></div>
                </div>
            `;
        }
        html += '</div>';
        container.innerHTML = html;
    },

    /**
     * Render Lead Story Spotlight
     */
    renderLeadStory(container, story) {
        if (!container) return;
        if (!story) {
            container.innerHTML = '';
            container.style.display = 'none';
            return;
        }

        const titleSafe = Utils.escapeHTML(story.title);
        const sourceSafe = Utils.escapeHTML(story.source);
        const hostName = Utils.getDomainHost(story.url);
        const relTime = Utils.formatRelativeTime(story.timestamp);
        const catMeta = DataService.categoriesMeta[story.category] || { label: story.category };

        container.style.display = 'block';
        container.innerHTML = `
            <div class="lead-story">
                <div class="lead-meta">
                    <span>Lead Story</span>
                    <span>•</span>
                    <span>${catMeta.label}</span>
                </div>
                <h2 class="lead-title">
                    <a href="#article/${story.slug}">${titleSafe}</a>
                </h2>
                <p class="lead-excerpt">${Utils.escapeHTML(story.excerpt)}</p>
                <div class="lead-footer">
                    <span class="lead-footer-source">${sourceSafe}</span>
                    ${hostName ? `<span>(${Utils.escapeHTML(hostName)})</span>` : ''}
                    <span>•</span>
                    <span>${relTime}</span>
                    <span>•</span>
                    <a href="#article/${story.slug}" style="color: var(--accent); font-weight: 600;">Read story →</a>
                </div>
            </div>
        `;
    },

    /**
     * Render Editorial Stories Feed
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
        const rowsHTML = visibleArticles.map(art => this.createStoryRowHTML(art)).join('');

        let loadMoreHTML = '';
        if (articles.length > this.displayedCount) {
            const remaining = articles.length - this.displayedCount;
            loadMoreHTML = `
                <div style="text-align: center; margin-top: 32px;">
                    <button type="button" class="state-btn" id="loadMoreBtn">
                        Load More Stories (${remaining.toLocaleString()} remaining)
                    </button>
                </div>
            `;
        }

        container.innerHTML = `<div class="stories-list">${rowsHTML}</div>${loadMoreHTML}`;

        const loadMoreBtn = document.getElementById('loadMoreBtn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.displayedCount += this.pageSize;
                this.renderFeed(container, this.currentFilteredArticles, false);
            });
        }
    },

    /**
     * Editorial Story Row HTML
     */
    createStoryRowHTML(article) {
        const titleSafe = Utils.escapeHTML(article.title);
        const sourceSafe = Utils.escapeHTML(article.source);
        const hostName = Utils.getDomainHost(article.url);
        const relTime = Utils.formatRelativeTime(article.timestamp);
        const catMeta = DataService.categoriesMeta[article.category] || { label: article.category };

        return `
            <article class="story-row" onclick="location.hash='#article/${article.slug}'">
                <h3 class="story-title">${titleSafe}</h3>
                <div class="story-meta">
                    <span class="story-source">${sourceSafe}</span>
                    ${hostName ? `<span class="story-domain">${Utils.escapeHTML(hostName)}</span>` : ''}
                    <span>•</span>
                    <span class="story-time">${relTime}</span>
                    <span>•</span>
                    <span class="story-category-tag">${catMeta.label}</span>
                </div>
            </article>
        `;
    },

    /**
     * Article Reader View
     */
    renderReaderView(container, article, related = []) {
        if (!container || !article) return;

        const titleSafe = Utils.escapeHTML(article.title);
        const sourceSafe = Utils.escapeHTML(article.source);
        const urlSafe = Utils.isValidUrl(article.url) ? Utils.escapeHTML(article.url) : '#';
        const dateFormatted = Utils.formatFullDate(article.timestamp);
        const hostName = Utils.getDomainHost(article.url);
        const catMeta = DataService.categoriesMeta[article.category] || { label: article.category };

        let relatedHTML = '';
        if (related.length > 0) {
            relatedHTML = `
                <div style="margin-top: 40px; border-top: 1px solid var(--border); padding-top: 24px;">
                    <h3 style="font-family: var(--font-serif); font-size: 1.15rem; font-weight: 700; margin-bottom: 16px;">Related Stories</h3>
                    <div class="stories-list">
                        ${related.map(art => this.createStoryRowHTML(art)).join('')}
                    </div>
                </div>
            `;
        }

        container.innerHTML = `
            <div class="reading-container reader-view">
                <button type="button" class="back-btn" onclick="location.hash='#feed'">
                    ← Back to Stories
                </button>

                <header class="reader-header">
                    <div class="reader-meta-bar">
                        <span>${catMeta.label}</span>
                        <span>•</span>
                        <span>${dateFormatted}</span>
                    </div>

                    <h1 class="reader-title">${titleSafe}</h1>

                    <div class="reader-source-info">
                        Originally published by <strong>${sourceSafe}</strong> ${hostName ? `(${hostName})` : ''}
                    </div>
                </header>

                <div class="reader-prose">
                    <p style="margin-bottom: 16px;">${Utils.escapeHTML(article.excerpt)}</p>
                    <p>DevBrief curates stories directly from original technical publications and developer communities. Open the link below to read the original article and participate in discussions.</p>
                </div>

                <div class="reader-callout">
                    <div>
                        <div style="font-weight: 700; color: var(--text-main); margin-bottom: 4px;">Read Full Publication on ${sourceSafe}</div>
                        <div style="font-size: 0.85rem; color: var(--text-muted);">Opens original external story in a new tab.</div>
                    </div>
                    <a href="${urlSafe}" target="_blank" rel="noopener noreferrer" class="btn-read-external">
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
            <div class="reading-container about-view">
                <h1 class="about-title">About DevBrief</h1>
                <p class="about-lead">DevBrief is an independent, developer-focused technology aggregator that collects and organizes news, engineering discussions, and software releases across the web.</p>

                <div class="about-block">
                    <h2 class="about-subtitle">Why DevBrief exists</h2>
                    <p class="about-text">Technology news is scattered across dozens of platforms — Hacker News, DEV Community, TechCrunch, Product Hunt, Reddit, and specialized RSS feeds. DevBrief brings these streams together into a clean, editorial interface focused purely on reading.</p>
                </div>

                <div class="about-block">
                    <h2 class="about-subtitle">How it works</h2>
                    <p class="about-text">A background Python scraper periodically collects public headlines, deduplicates them by URL, and normalizes them into structured JSON. The web frontend runs completely on vanilla HTML, CSS, and JavaScript with zero third-party tracking or framework overhead.</p>
                </div>

                <div class="about-block">
                    <h2 class="about-subtitle">Source attribution</h2>
                    <p class="about-text">Every story on DevBrief links directly to its original publisher. We preserve original titles, sources, and publication dates without replacing original content or hiding sources behind redirects.</p>
                </div>
            </div>
        `;
    },

    renderEmptyState(container) {
        container.innerHTML = `
            <div class="state-box">
                <div class="state-title">No stories found</div>
                <div class="state-desc">No articles match your search or active filter selections.</div>
                <button type="button" class="state-btn" id="resetFiltersBtn">Reset Filters</button>
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
            <div class="state-box">
                <div class="state-title">Unable to load news feed</div>
                <div class="state-desc">${Utils.escapeHTML(message || 'Failed to fetch article data.')} Please verify that <code>data.json</code> exists.</div>
                <button type="button" class="state-btn" onclick="location.reload()">Reload Page</button>
            </div>
        `;
    }
};
