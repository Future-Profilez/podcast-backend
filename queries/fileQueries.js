const prisma = require("../prismaconfig");

exports.createFile = async (data) => {
  const { name, size, uuid, link } = data;
  const result = await prisma.$queryRaw`
    INSERT INTO "Files" (name, size, uuid, link)
    VALUES (${name}, ${size}, ${uuid}, ${link})
    RETURNING *;
  `;
  return result;
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