const fs = require("fs");
const path = require("path");

const storeDir = path.join(__dirname, "..", "uploads");
const storeFile = path.join(storeDir, "pending-migrations.json");

function ensureStore() {
  if (!fs.existsSync(storeDir)) fs.mkdirSync(storeDir, { recursive: true });
  if (!fs.existsSync(storeFile)) fs.writeFileSync(storeFile, "[]");
}

function readAll() {
  ensureStore();
  const raw = fs.readFileSync(storeFile, "utf8");
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeAll(items) {
  ensureStore();
  fs.writeFileSync(storeFile, JSON.stringify(items));
}

function add(item) {
  const items = readAll();
  const idx = items.findIndex((x) => x.key === item.key);
  if (idx === -1) {
    items.push(item);
  } else {
    items[idx] = { ...items[idx], ...item };
  }
  writeAll(items);
}

function remove(key) {
  const items = readAll().filter((x) => x.key !== key);
  writeAll(items);
}

function list() {
  return readAll();
}

module.exports = { add, remove, list };
