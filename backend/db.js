import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const file = join(__dirname, 'db.json');
const adapter = new JSONFile(file);
const db = new Low(adapter, { urls: [], clicks: [] });

await db.read();
db.data ||= { urls: [], clicks: [] };

// save DB
async function save() {
  await db.write();
}

// list all URLs
async function listUrls() {
  return db.data.urls;
}

// get single URL
async function getUrl(shortcode) {
  return db.data.urls.find(u => u.shortcode === shortcode);
}

// insert new URL
async function insertUrl(urlObj) {
  db.data.urls.push(urlObj);
  await save();
}

// insert click
async function insertClick(clickObj) {
  db.data.clicks.push(clickObj);
  await save();
}

// list clicks for a shortcode
async function listClicksFor(shortcode) {
  return db.data.clicks.filter(c => c.shortcode === shortcode);
}

// count clicks grouped by shortcode
async function countClicksByShortcode() {
  const counts = {};
  for (const c of db.data.clicks) {
    counts[c.shortcode] = (counts[c.shortcode] || 0) + 1;
  }
  return counts;
}

export default {
  listUrls,
  getUrl,
  insertUrl,
  insertClick,
  listClicksFor,
  countClicksByShortcode
};
