const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.$connect()
  .then(() => console.log("✅ Connected to PostgreSQL via Prisma"))
  .catch((err) => console.error("❌ Prisma connection failed:", err));

module.exports = prisma;