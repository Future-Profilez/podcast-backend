// const prisma = require("../prismaconfig");

// exports.createUser = async (data) => {
//   const { name, email, password } = data;
//   try {
//     const result = await prisma.$queryRaw`
//       INSERT INTO "User" (name, email, password)
//       VALUES (${name}, ${email}, ${password})
//       RETURNING *;
//     `;
//     console.log("result",result);
//     return result;
//   } catch (error) {
//     console.log("error", error);
//     return null;
//   }
// };
const prisma = require("../prismaconfig");

exports.createUser = async (data) => {
  const { name, email, password } = data;
  const result = await prisma.$queryRaw`
    INSERT INTO "User" (name, email, password)
    VALUES (${name}, ${email}, ${password})
    RETURNING *;
  `;
  return result;
};

exports.getUser = async (data) => {
  const { email } = data;
  const result = await prisma.$queryRaw`
    SELECT * FROM "User" WHERE email=${email};
  `;
  return result[0];
};