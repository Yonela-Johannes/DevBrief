/**
 * DevBrief - Statistics & Metrics Component
 */

const StatsComponent = {
    update(allArticles = [], filteredArticles = []) {
        const totalElem = document.getElementById('statTotalCount');
        const sourceElem = document.getElementById('statSourceCount');
        const updatedElem = document.getElementById('statLastUpdated');
        const headerLiveBadge = document.getElementById('headerLiveText');

        if (!totalElem || !sourceElem || !updatedElem) return;

        const isFiltered = FilterService.hasActiveFilters();

        // Total articles count
        if (isFiltered) {
            totalElem.textContent = `${filteredArticles.length.toLocaleString()} / ${allArticles.length.toLocaleString()}`;
        } else {
            totalElem.textContent = allArticles.length.toLocaleString();
        }

        // Unique sources count
        const activeSources = new Set(filteredArticles.map(a => a.source));
        const totalSources = new Set(allArticles.map(a => a.source));

        if (isFiltered) {
            sourceElem.textContent = `${activeSources.size} / ${totalSources.size}`;
        } else {
            sourceElem.textContent = totalSources.size;
        }

        // Last updated time
        const latestTime = DataService.getLatestTimestamp();
        if (latestTime) {
            const relTime = Utils.formatRelativeTime(latestTime);
            updatedElem.textContent = relTime;
            if (headerLiveBadge) {
                headerLiveBadge.textContent = `Updated ${relTime}`;
            }
        } else {
            updatedElem.textContent = '—';
            if (headerLiveBadge) {
                headerLiveBadge.textContent = 'Live Feed';
            }
        }
    }
};
