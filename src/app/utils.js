import { promises as fs } from 'fs';

export async function listOfDates() {
  const path = `${process.cwd()}/articles`;
  let entries;
  try {
    entries = await fs.readdir(path, { withFileTypes: true });
  } catch (e) {
    console.error(e);
    return [];
  }
  // Only include directories (subfolders)
  return entries.filter(dirent => dirent.isDirectory()).map(dirent => dirent.name);
}

const SUMMARY_FILE = 'summary.md';

export async function getSummary(date) {
  const path = `${process.cwd()}/articles/${date}/${SUMMARY_FILE}`;
  try {
    const content = await fs.readFile(path, 'utf8');
    return content;
  } catch (e) {
    return null;
  }
}

export async function loadArticles(date) {
  const path = `${process.cwd()}/articles/${date}`;
  let files;
  try {
    files = await fs.readdir(path);
  } catch (e) {
    console.error(e);
    return [];
  }
  const articles = [];
  const seenTitles = new Set();

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const content = await fs.readFile(`${path}/${file}`, 'utf8');

    const articles_file = JSON.parse(content);
    articles_file.forEach(article => {
      // Check if the article is already in the list
      if (!seenTitles.has(article.title)) {
        articles.push(article);
        seenTitles.add(article.title);
      }
    })
  }
  // sort articles by date
  return articles.sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateA - dateB;
  });
}

export async function getAllArticles() {
  const dates = await listOfDates();
  let allArticles = [];
  for (const date of dates) {
    const articlesFromDate = await loadArticles(date);
    allArticles = allArticles.concat(articlesFromDate);
  }
  // Deduplicate articles based on title, just in case loadArticles doesn't cover all cases
  // (though it should with the current implementation)
  const seenTitles = new Set();
  const uniqueArticles = allArticles.filter(article => {
    if (seenTitles.has(article.title)) {
      return false;
    }
    seenTitles.add(article.title);
    return true;
  });
  return uniqueArticles;
}

export async function getAllTagsWithFrequency() {
  const articles = await getAllArticles();
  const tagFrequency = {};

  articles.forEach(article => {
    if (article.tags && Array.isArray(article.tags)) {
      article.tags.forEach(tag => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      });
    }
  });

  return Object.entries(tagFrequency)
    .map(([tag, frequency]) => ({ tag, frequency }))
    .sort((a, b) => b.frequency - a.frequency);
}

export async function getArticlesByTag(tag) {
  const articles = await getAllArticles();
  return articles
    .filter(article => article.tags && article.tags.includes(tag))
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by most recent first
}
