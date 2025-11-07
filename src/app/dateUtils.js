/**
 * Get the localized month name in Portuguese
 * @param {string|number} monthNum - Month number (1-12) as string or number
 * @returns {string} Month name in Portuguese
 */
export function getMonthName(monthNum) {
  const date = new Date(2000, monthNum - 1, 1);
  return date.toLocaleDateString('pt-PT', { month: 'long' });
}

/**
 * Format a date string in the format YYYY-MM-DD to Portuguese format
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date in Portuguese
 */
export function formatDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'long',
  });
}

/**
 * Group dates by year and month
 * @param {Array} datesWithCounts - Array of objects with date and count properties
 * @returns {Object} Grouped dates by year and month
 */
export function groupDatesByYearMonth(datesWithCounts) {
  const grouped = {};

  datesWithCounts.forEach(({ date, count }) => {
    const [year, month] = date.split('-');

    if (!grouped[year]) {
      grouped[year] = {};
    }
    if (!grouped[year][month]) {
      grouped[year][month] = [];
    }

    grouped[year][month].push({ date, count });
  });

  return grouped;
}

/**
 * Group articles by year and month
 * @param {Array} articles - Array of article objects with date property
 * @returns {Object} Grouped articles by year and month
 */
export function groupArticlesByYearMonth(articles) {
  const grouped = {};

  articles.forEach((article) => {
    // Skip articles with invalid or missing dates
    if (!article.date) {
      console.warn('Article missing date:', article.title);
      return;
    }

    const date = new Date(article.date);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Article has invalid date:', article.title, article.date);
      return;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    if (!grouped[year]) {
      grouped[year] = {};
    }
    if (!grouped[year][month]) {
      grouped[year][month] = {
        count: 0,
        dateStr: `${year}-${month}`,
        articles: []
      };
    }

    grouped[year][month].count++;
    grouped[year][month].articles.push(article);
  });

  return grouped;
}

