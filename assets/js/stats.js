/**
 * DevBrief — Statistics Component
 */

const StatsComponent = {
    update(allArticles = [], filteredArticles = []) {
        const totalElem = document.getElementById('statTotalCount');
        const sourceElem = document.getElementById('statSourceCount');
        const updatedElem = document.getElementById('statLastUpdated');

        if (!totalElem || !sourceElem || !updatedElem) return;

        const isFiltered = FilterService.hasActiveFilters();

        if (isFiltered) {
            totalElem.textContent = `${filteredArticles.length.toLocaleString()} / ${allArticles.length.toLocaleString()}`;
        } else {
            totalElem.textContent = allArticles.length.toLocaleString();
        }

        const activeSources = new Set(filteredArticles.map(a => a.source));
        const totalSources = new Set(allArticles.map(a => a.source));

        if (isFiltered) {
            sourceElem.textContent = `${activeSources.size} / ${totalSources.size}`;
        } else {
            sourceElem.textContent = totalSources.size;
        }

        const latestTime = DataService.getLatestTimestamp();
        if (latestTime) {
            updatedElem.textContent = Utils.formatRelativeTime(latestTime);
        } else {
            updatedElem.textContent = '—';
        }
    }
};
