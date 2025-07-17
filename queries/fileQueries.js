const prisma = require("../prismaconfig");

exports.getAllPodcasts = async () => {
  const result = await prisma.$queryRaw`
    SELECT * FROM "Podcast";
  `;
  console.log("result", result);
  return result[0];
};

exports.getAllFiles = async () => {
  const result = await prisma.$queryRaw`
    SELECT * FROM "Files";
`;
  return result[0];
};

exports.getFile = async (uuid) => {
  const result = await prisma.$queryRaw`
    SELECT * FROM "Files" WHERE uuid=${uuid};
  `;
  return result[0];
};