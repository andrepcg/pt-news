import { promises as fs } from 'fs';

export async function listOfDates() {
  const path = `${process.cwd()}/articles`;
  console.log(path);
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
