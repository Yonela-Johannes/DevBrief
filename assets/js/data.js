/**
 * DevBrief - Data Fetching & Normalization Module
 */

const DataService = {
    articles: [],

    // Static category mapping rules based on source keyword
    categoryRules: [
        { key: 'Hacker News', category: 'technology' },
        { key: 'Dev.to', category: 'development' },
        { key: 'Product Hunt', category: 'products' },
        { key: 'TechCrunch', category: 'startups' },
        { key: 'Smashing Magazine', category: 'web-design' },
        { key: 'CSS-Tricks', category: 'web-design' },
        { key: 'Reddit', category: 'community' },
        { key: 'arXiv', category: 'research-ai' }
    ],

    // Metadata for categories
    categoriesMeta: {
        'all': { label: 'All Stories', icon: '📰' },
        'technology': { label: 'Technology', icon: '💻' },
        'development': { label: 'Development', icon: '⚙️' },
        'products': { label: 'Products', icon: '🚀' },
        'startups': { label: 'Startups', icon: '🏢' },
        'web-design': { label: 'Web & Design', icon: '🎨' },
        'community': { label: 'Community', icon: '💬' },
        'research-ai': { label: 'Research & AI', icon: '🔬' }
    },

    /**
     * Normalize source names for clean display
     */
    normalizeSourceName(rawSource = '') {
        const s = rawSource.trim();
        const lower = s.toLowerCase();
        if (lower.includes('product hunt')) return 'Product Hunt';
        if (lower.includes('smashing magazine')) return 'Smashing Magazine';
        if (lower.includes('css-tricks')) return 'CSS-Tricks';
        if (lower.includes('techcrunch')) return 'TechCrunch';
        if (lower.includes('dev.to')) return 'Dev.to';
        if (lower.includes('hacker news')) return 'Hacker News';
        if (lower.includes('reddit')) return 'Reddit';
        return s || 'Tech Stream';
    },

    /**
     * Infer category based on source name
     */
    inferCategory(sourceStr = '') {
        for (const rule of this.categoryRules) {
            if (sourceStr.toLowerCase().includes(rule.key.toLowerCase())) {
                return rule.category;
            }
        }
        return 'technology'; // Default category fallback
    },

    /**
     * Fetch data.json from the server and normalize entries
     */
    async loadArticles() {
        try {
            const response = await fetch('data.json', { cache: 'no-cache' });
            if (!response.ok) {
                throw new Error(`HTTP error status: ${response.status}`);
            }

            const rawData = await response.json();
            if (!Array.isArray(rawData)) {
                throw new Error('Data format error: expected array of articles');
            }

            // Normalize each article item safely
            this.articles = rawData
                .filter(item => item && typeof item === 'object' && item.title && item.url)
                .map((item, id) => {
                    const sourceName = this.normalizeSourceName(item.source || '');
                    const category = item.category || this.inferCategory(sourceName);
                    const cleanTitle = String(item.title).trim();
                    const slug = `art-${id}-${Utils.createSlug(cleanTitle)}`;
                    const excerpt = item.description || item.excerpt || `Latest story reported by ${sourceName}. Explore full context, discussion, and source code.`;
                    const readingTime = Utils.calculateReadingTime(cleanTitle + ' ' + excerpt);

                    return {
                        id: `art-${id}`,
                        slug: slug,
                        title: cleanTitle,
                        url: String(item.url).trim(),
                        source: sourceName,
                        category: category,
                        excerpt: excerpt,
                        readingTime: readingTime,
                        timestamp: item.timestamp || new Date().toISOString()
                    };
                });

            // Sort articles newest first
            this.articles.sort((a, b) => {
                const timeA = new Date(a.timestamp).getTime() || 0;
                const timeB = new Date(b.timestamp).getTime() || 0;
                return timeB - timeA;
            });

            return { success: true, articles: this.articles };
        } catch (error) {
            console.error('DataService loadArticles failed:', error);
            return { success: false, error: error.message };
        }
    },

    getFeaturedArticle() {
        return this.articles.length > 0 ? this.articles[0] : null;
    },

    getArticleBySlug(slugKey) {
        if (!slugKey) return null;
        return this.articles.find(a => a.slug === slugKey || a.id === slugKey) || null;
    },

    getRelatedArticles(currentArticle, limit = 3) {
        if (!currentArticle) return [];
        return this.articles
            .filter(a => a.slug !== currentArticle.slug && (a.category === currentArticle.category || a.source === currentArticle.source))
            .slice(0, limit);
    },

    getUniqueSources() {
        const sources = new Set(this.articles.map(a => a.source));
        return Array.from(sources).sort();
    },

    getAvailableCategories() {
        const catSet = new Set(this.articles.map(a => a.category));
        return ['all', ...Array.from(catSet)];
    },

    getLatestTimestamp() {
        if (this.articles.length === 0) return null;
        return this.articles[0].timestamp || null;
    }
};
