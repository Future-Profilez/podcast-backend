const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const rootDir = path.join(__dirname, "..", "uploads");
const tmpDir = path.join(rootDir, "tmp");

const sessions = new Map();

function ensureDirs() {
  fs.mkdirSync(tmpDir, { recursive: true });
}

function initSession(fileName, mimeType) {
  ensureDirs();
  const uploadId = uuid();
  const safeName = fileName.replace(/\s/g, "_");
  const key = `files/${uuid()}-${safeName}`;
  const tmpPath = path.join(tmpDir, `${uploadId}.part`);
  fs.closeSync(fs.openSync(tmpPath, "a"));
  sessions.set(uploadId, { key, mimeType, tmpPath, size: 0, parts: 0 });
  return { uploadId, key };
}

function appendPart(uploadId, buffer) {
  const s = sessions.get(uploadId);
  if (!s) throw new Error("Invalid upload session");
  fs.appendFileSync(s.tmpPath, buffer);
  s.size += buffer.length;
  s.parts += 1;
  return { size: buffer.length, parts: s.parts };
}

function completeSession(uploadId) {
  const s = sessions.get(uploadId);
  if (!s) throw new Error("Invalid upload session");
  const finalPath = path.join(rootDir, s.key.replace(/^files\//, ""));
  const finalDir = path.dirname(finalPath);
  fs.mkdirSync(finalDir, { recursive: true });
  fs.renameSync(s.tmpPath, finalPath);
  sessions.delete(uploadId);
  return { key: s.key };
}

function hasSession(uploadId) {
  return sessions.has(uploadId);
}

module.exports = { initSession, appendPart, completeSession, hasSession };
