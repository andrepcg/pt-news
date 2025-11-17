import { promises as fs } from 'fs';
import path from 'path';

// Normalize a string for comparison (remove accents and lowercase)
function normalizeForComparison(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove diacritics/accents
}

// Calculate Levenshtein distance between two strings
function levenshteinDistance(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[len1][len2];
}

// Calculate Jaro-Winkler similarity (0 to 1, higher is more similar)
function jaroWinklerSimilarity(str1, str2) {
  const len1 = str1.length;
  const len2 = str2.length;

  if (len1 === 0 && len2 === 0) return 1;
  if (len1 === 0 || len2 === 0) return 0;

  const matchWindow = Math.floor(Math.max(len1, len2) / 2) - 1;
  const str1Matches = new Array(len1).fill(false);
  const str2Matches = new Array(len2).fill(false);

  let matches = 0;
  let transpositions = 0;

  // Find matches
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, len2);

    for (let j = start; j < end; j++) {
      if (str2Matches[j] || str1[i] !== str2[j]) continue;
      str1Matches[i] = true;
      str2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0;

  // Count transpositions
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!str1Matches[i]) continue;
    while (!str2Matches[k]) k++;
    if (str1[i] !== str2[k]) transpositions++;
    k++;
  }

  const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;

  // Jaro-Winkler modification (give more weight to matching prefixes)
  const prefixLength = Math.min(4, Math.min(len1, len2));
  let commonPrefix = 0;
  for (let i = 0; i < prefixLength; i++) {
    if (str1[i] === str2[i]) commonPrefix++;
    else break;
  }

  return jaro + commonPrefix * 0.1 * (1 - jaro);
}

// Calculate similarity between two strings based on chosen method
function calculateSimilarity(str1, str2, method = 'jaro-winkler') {
  const normalized1 = normalizeForComparison(str1);
  const normalized2 = normalizeForComparison(str2);

  if (normalized1 === normalized2) return 1; // Exact match (ignoring case/accents)

  if (method === 'levenshtein') {
    const distance = levenshteinDistance(normalized1, normalized2);
    const maxLen = Math.max(normalized1.length, normalized2.length);
    return 1 - (distance / maxLen); // Convert to similarity score (0 to 1)
  } else {
    return jaroWinklerSimilarity(normalized1, normalized2);
  }
}

// Count accents in a string
function countAccents(str) {
  const normalized = str.normalize('NFD');
  const accents = normalized.match(/[\u0300-\u036f]/g);
  return accents ? accents.length : 0;
}

// Count uppercase letters
function countUppercase(str) {
  return (str.match(/[A-ZÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞ]/g) || []).length;
}

// Choose the best canonical form among similar tags
function chooseCanonicalTag(tags) {
  // Sort by:
  // 1. Prefer tags with accents (more specific)
  // 2. Prefer title case over all lowercase or all uppercase
  // 3. Prefer more common casing patterns
  return tags.sort((a, b) => {
    const accentsA = countAccents(a);
    const accentsB = countAccents(b);

    // Prefer accented versions
    if (accentsA !== accentsB) {
      return accentsB - accentsA;
    }

    // Check if it's all uppercase
    const isAllUpperA = a === a.toUpperCase() && a.length > 1;
    const isAllUpperB = b === b.toUpperCase() && b.length > 1;

    // Check if it's all lowercase
    const isAllLowerA = a === a.toLowerCase();
    const isAllLowerB = b === b.toLowerCase();

    // Prefer title case over all lowercase or all uppercase
    if (!isAllUpperA && !isAllLowerA && (isAllUpperB || isAllLowerB)) {
      return -1;
    }
    if ((isAllUpperA || isAllLowerA) && !isAllUpperB && !isAllLowerB) {
      return 1;
    }

    // Prefer uppercase count (for acronyms like SATA)
    const upperA = countUppercase(a);
    const upperB = countUppercase(b);

    // If one is an acronym (all uppercase), prefer it
    if (isAllUpperA && !isAllUpperB) return -1;
    if (isAllUpperB && !isAllUpperA) return 1;

    // Otherwise prefer the one with more uppercase letters (likely proper nouns)
    if (upperA !== upperB) {
      return upperB - upperA;
    }

    // Prefer longer (more specific)
    return b.length - a.length;
  })[0];
}

async function getAllArticleFiles() {
  const articlesPath = path.join(process.cwd(), 'articles');
  const dates = await fs.readdir(articlesPath, { withFileTypes: true });
  const dateDirectories = dates.filter(d => d.isDirectory()).map(d => d.name);

  const files = [];
  for (const date of dateDirectories) {
    const datePath = path.join(articlesPath, date);
    const dateFiles = await fs.readdir(datePath);
    for (const file of dateFiles) {
      if (file.endsWith('.json')) {
        files.push(path.join(datePath, file));
      }
    }
  }

  return files;
}

async function analyzeAllTags() {
  const files = await getAllArticleFiles();
  const tagGroups = new Map(); // normalized -> Set of original forms

  console.log(`Analyzing ${files.length} article files...`);

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    const articles = JSON.parse(content);

    for (const article of articles) {
      if (article.tags && Array.isArray(article.tags)) {
        for (const tag of article.tags) {
          const normalized = normalizeForComparison(tag);
          if (!tagGroups.has(normalized)) {
            tagGroups.set(normalized, new Set());
          }
          tagGroups.get(normalized).add(tag);
        }
      }
    }
  }

  return tagGroups;
}

async function createTagMapping(tagGroups, options = {}) {
  const { fuzzyThreshold = 0, similarityMethod = 'jaro-winkler' } = options;
  const mapping = new Map(); // original tag -> canonical tag
  const duplicates = [];

  // Step 1: Handle exact matches (case/accent differences)
  for (const [normalized, originalTags] of tagGroups.entries()) {
    const tags = Array.from(originalTags);

    if (tags.length > 1) {
      // We have duplicates
      const canonical = chooseCanonicalTag(tags);
      duplicates.push({
        normalized,
        variants: tags,
        canonical,
        matchType: 'exact'
      });

      // Map all variants to the canonical form
      for (const tag of tags) {
        if (tag !== canonical) {
          mapping.set(tag, canonical);
        }
      }
    }
  }

  // Step 2: Handle fuzzy matches if threshold is set
  if (fuzzyThreshold > 0) {
    console.log(`\nApplying fuzzy matching with ${similarityMethod} similarity (threshold: ${fuzzyThreshold})...`);

    // Get all unique tags (canonical forms from step 1, plus standalone tags)
    const allTags = new Set();
    for (const [normalized, originalTags] of tagGroups.entries()) {
      const tags = Array.from(originalTags);
      if (tags.length > 1) {
        // Add the canonical form
        const canonical = chooseCanonicalTag(tags);
        allTags.add(canonical);
      } else {
        // Add the standalone tag
        allTags.add(tags[0]);
      }
    }

    const tagArray = Array.from(allTags);
    const fuzzyGroups = [];
    const processed = new Set();

    // Compare each tag with every other tag
    for (let i = 0; i < tagArray.length; i++) {
      if (processed.has(tagArray[i])) continue;

      const similarTags = [tagArray[i]];

      for (let j = i + 1; j < tagArray.length; j++) {
        if (processed.has(tagArray[j])) continue;

        const similarity = calculateSimilarity(tagArray[i], tagArray[j], similarityMethod);

        if (similarity >= fuzzyThreshold) {
          similarTags.push(tagArray[j]);
          processed.add(tagArray[j]);
        }
      }

      if (similarTags.length > 1) {
        processed.add(tagArray[i]);
        const canonical = chooseCanonicalTag(similarTags);

        fuzzyGroups.push({
          variants: similarTags,
          canonical,
          matchType: 'fuzzy'
        });

        // Update mapping for fuzzy matches
        for (const tag of similarTags) {
          if (tag !== canonical) {
            // If this tag is already a canonical from exact matching,
            // we need to remap all its variants
            const variantsToRemap = [];
            for (const [variant, canonicalTag] of mapping.entries()) {
              if (canonicalTag === tag) {
                variantsToRemap.push(variant);
              }
            }

            // Remap variants
            for (const variant of variantsToRemap) {
              mapping.set(variant, canonical);
            }

            // Add the tag itself to mapping
            mapping.set(tag, canonical);
          }
        }
      }
    }

    // Add fuzzy groups to duplicates
    duplicates.push(...fuzzyGroups);

    if (fuzzyGroups.length > 0) {
      console.log(`Found ${fuzzyGroups.length} additional fuzzy match groups`);
    } else {
      console.log('No additional fuzzy matches found');
    }
  }

  return { mapping, duplicates };
}

async function previewChanges(mapping) {
  if (mapping.size === 0) {
    return { filesToUpdate: [], totalArticles: 0, changes: [] };
  }

  const files = await getAllArticleFiles();
  const filesToUpdate = [];
  const changes = [];
  let totalArticlesAffected = 0;

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    const articles = JSON.parse(content);
    let fileModified = false;
    const fileChanges = [];

    for (let i = 0; i < articles.length; i++) {
      const article = articles[i];
      if (article.tags && Array.isArray(article.tags)) {
        const originalTags = [...article.tags];
        const newTags = [...new Set(article.tags.map(tag => mapping.get(tag) || tag))];

        // Check if anything changed
        if (JSON.stringify(originalTags.sort()) !== JSON.stringify(newTags.sort())) {
          fileModified = true;
          totalArticlesAffected++;

          // Record the change
          const tagChanges = originalTags
            .filter(tag => mapping.has(tag))
            .map(tag => ({ from: tag, to: mapping.get(tag) }));

          fileChanges.push({
            articleIndex: i,
            title: article.title || 'Untitled',
            originalTags,
            newTags,
            tagChanges
          });
        }
      }
    }

    if (fileModified) {
      filesToUpdate.push(file);
      changes.push({
        file,
        changes: fileChanges
      });
    }
  }

  return { filesToUpdate, totalArticles: totalArticlesAffected, changes };
}

async function updateArticleFiles(mapping) {
  if (mapping.size === 0) {
    console.log('No duplicate tags found to merge.');
    return 0;
  }

  const files = await getAllArticleFiles();
  let updatedCount = 0;

  console.log(`\nUpdating ${files.length} article files...`);

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8');
    const articles = JSON.parse(content);
    let modified = false;

    for (const article of articles) {
      if (article.tags && Array.isArray(article.tags)) {
        const originalTags = [...article.tags];

        // Replace tags with canonical forms and deduplicate
        article.tags = [...new Set(article.tags.map(tag => mapping.get(tag) || tag))];

        // Check if anything changed
        if (JSON.stringify(originalTags.sort()) !== JSON.stringify(article.tags.sort())) {
          modified = true;
        }
      }
    }

    if (modified) {
      await fs.writeFile(file, JSON.stringify(articles, null, 2), 'utf8');
      updatedCount++;
    }
  }

  return updatedCount;
}

function parseArguments() {
  const args = {
    apply: false,
    fuzzyThreshold: 0,
    similarityMethod: 'jaro-winkler',
    help: false
  };

  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];

    if (arg === '--apply') {
      args.apply = true;
    } else if (arg === '--fuzzy-threshold' || arg === '-t') {
      args.fuzzyThreshold = parseFloat(process.argv[++i]);
      if (isNaN(args.fuzzyThreshold) || args.fuzzyThreshold < 0 || args.fuzzyThreshold > 1) {
        console.error('Error: Fuzzy threshold must be a number between 0 and 1');
        process.exit(1);
      }
    } else if (arg === '--similarity-method' || arg === '-m') {
      args.similarityMethod = process.argv[++i];
      if (!['jaro-winkler', 'levenshtein'].includes(args.similarityMethod)) {
        console.error('Error: Similarity method must be either "jaro-winkler" or "levenshtein"');
        process.exit(1);
      }
    } else if (arg === '--help' || arg === '-h') {
      args.help = true;
    }
  }

  return args;
}

function printHelp() {
  console.log(`
Usage: node scripts/merge-duplicate-tags.mjs [OPTIONS]

Finds and merges duplicate tags across all article JSON files.

OPTIONS:
  --apply                    Apply changes to files (default: dry-run mode)

  -t, --fuzzy-threshold N    Enable fuzzy matching with similarity threshold (0-1)
                             0 = disabled (default)
                             0.85-0.95 = recommended range
                             Examples:
                               0.85 - will match "Sporting" and "Spotting"
                               0.95 - more conservative, stricter matching

  -m, --similarity-method M  Similarity algorithm to use (default: jaro-winkler)
                             Options: jaro-winkler, levenshtein
                             - jaro-winkler: Better for short strings, weights prefix matches
                             - levenshtein: Edit distance based, simpler algorithm

  -h, --help                 Show this help message

EXAMPLES:
  # Dry run - show what would change
  node scripts/merge-duplicate-tags.mjs

  # Apply exact matching (case/accent differences only)
  node scripts/merge-duplicate-tags.mjs --apply

  # Preview with fuzzy matching (85% similarity threshold)
  node scripts/merge-duplicate-tags.mjs --fuzzy-threshold 0.85

  # Apply changes with fuzzy matching using Levenshtein distance
  node scripts/merge-duplicate-tags.mjs --apply -t 0.90 -m levenshtein
`);
}

async function main() {
  const args = parseArguments();

  if (args.help) {
    printHelp();
    return;
  }

  if (args.apply) {
    console.log('🚀 APPLY MODE: Changes will be written to files\n');
  } else {
    console.log('👀 DRY RUN MODE: No files will be modified');
    console.log('   Run with --apply flag to apply changes\n');
  }

  if (args.fuzzyThreshold > 0) {
    console.log(`🔍 Fuzzy matching enabled:`);
    console.log(`   • Threshold: ${args.fuzzyThreshold}`);
    console.log(`   • Method: ${args.similarityMethod}\n`);
  }

  console.log('Starting duplicate tag analysis...\n');

  // Step 1: Analyze all tags
  const tagGroups = await analyzeAllTags();

  // Step 2: Create mapping
  const { mapping, duplicates } = await createTagMapping(tagGroups, {
    fuzzyThreshold: args.fuzzyThreshold,
    similarityMethod: args.similarityMethod
  });

  // Step 3: Display findings
  if (duplicates.length > 0) {
    const exactMatches = duplicates.filter(d => d.matchType === 'exact');
    const fuzzyMatches = duplicates.filter(d => d.matchType === 'fuzzy');

    console.log(`\nFound ${duplicates.length} groups of duplicate tags:`);
    if (exactMatches.length > 0) {
      console.log(`  • ${exactMatches.length} exact matches (case/accent differences)`);
    }
    if (fuzzyMatches.length > 0) {
      console.log(`  • ${fuzzyMatches.length} fuzzy matches (similarity threshold)`);
    }
    console.log();

    // Display exact matches first
    if (exactMatches.length > 0) {
      console.log('📝 Exact matches:\n');
      exactMatches
        .sort((a, b) => b.variants.length - a.variants.length)
        .forEach(({ variants, canonical }, index) => {
          console.log(`${index + 1}. "${canonical}" ← [${variants.filter(v => v !== canonical).map(v => `"${v}"`).join(', ')}]`);
        });
    }

    // Display fuzzy matches separately
    if (fuzzyMatches.length > 0) {
      console.log(`\n🔍 Fuzzy matches (⚠️  review carefully):\n`);
      fuzzyMatches
        .sort((a, b) => b.variants.length - a.variants.length)
        .forEach(({ variants, canonical }, index) => {
          console.log(`${index + 1}. "${canonical}" ← [${variants.filter(v => v !== canonical).map(v => `"${v}"`).join(', ')}]`);
        });
    }

    console.log(`\nTotal tag variants to merge: ${mapping.size}`);

    // Step 4: Preview changes
    console.log('\nAnalyzing impact on article files...');
    const { filesToUpdate, totalArticles, changes } = await previewChanges(mapping);

    console.log(`\n📊 Impact Summary:`);
    console.log(`   • Files to update: ${filesToUpdate.length}`);
    console.log(`   • Articles affected: ${totalArticles}`);
    console.log(`   • Tag variants to merge: ${mapping.size}`);

    if (args.apply) {
      // Step 5: Apply changes
      console.log('\nApplying changes to article files...');
      const updatedCount = await updateArticleFiles(mapping);

      console.log(`\n✅ Success!`);
      console.log(`   • Updated ${updatedCount} article files`);
      console.log(`   • Merged ${mapping.size} duplicate tags into their canonical forms`);
    } else {
      console.log(`\n💡 To apply these changes, run:`);
      const fuzzyArgs = args.fuzzyThreshold > 0 ? ` -t ${args.fuzzyThreshold} -m ${args.similarityMethod}` : '';
      console.log(`   node scripts/merge-duplicate-tags.mjs --apply${fuzzyArgs}`);
    }
  } else {
    console.log('✨ No duplicate tags found!');
  }
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});

