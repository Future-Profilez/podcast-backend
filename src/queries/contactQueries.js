const prisma = require("../prismaconfig");



exports.contactAdd = async (data) => {
    const { email, name, message } = data;
    const record = await prisma.$queryRaw`
    INSERT INTO "contact"  (name, email, message)
    VALUES (${name}, ${email}, ${message})
    RETURNING *;`;
    return record;
}

exports.ContactGet = async () => {
    const record = await prisma.$queryRaw`
    SELECT * FROM "contact"`;
    return record;
}