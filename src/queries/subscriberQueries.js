const prisma = require("../prismaconfig");

exports.subscriberadd = async (email) => {
    const result = await prisma.$queryRaw`
    INSERT INTO "subscriber" (email) VALUES (${email}) RETURNING *;
    `;
    return result;
}


exports.subscriberget = async () => {
    const result = await prisma.$queryRaw`
    SELECT * FROM "subscriber" `;
    return result ;
}