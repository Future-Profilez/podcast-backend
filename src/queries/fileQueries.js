const prisma = require("../prismaconfig");

exports.getAllPodcasts = async () => {
  //   const result = await prisma.$queryRaw`
  //     SELECT * FROM "Podcast";
  // `;
  const result = await prisma.podcast.findMany();
  return result;
};

exports.getAllPodcastswithFiles = async () => {
  const result = await prisma.podcast.findMany({
    include: {
      files: true, // Will include all associated files or empty array if none
    },
    orderBy: {
      createdAt: "asc", // Optional: latest first
    },
  });
  // const result = await prisma.$queryRaw`
  //   SELECT
  //     p.*,
  //     COALESCE(json_agg(f.*) FILTER (WHERE f.id IS NOT NULL), '[]') AS files
  //   FROM
  //     "Podcast" p
  //   LEFT JOIN
  //     "Files" f ON f."podcastId" = p.id
  //   GROUP BY
  //     p.id
  //   ORDER BY
  //     p."createdAt" DESC;
  // `;
  return result;
};

exports.getPodcastDetail = async (uuid) => {
  const result = await prisma.podcast.findUnique({
    where: {
      uuid: uuid,
    },
    include: {
      files: {
        orderBy: {
          createdAt: "asc", // Oldest first
        },
      },
    },
  });
  // const result = await prisma.$queryRaw`
  //   SELECT
  //     p.*,
  //     COALESCE(json_agg(f.*) FILTER (WHERE f.id IS NOT NULL), '[]') AS files
  //   FROM
  //     "Podcast" p
  //   LEFT JOIN
  //     "Files" f ON p.id = f."podcastId"
  //   WHERE
  //     p.uuid = ${uuid}
  //   GROUP BY
  //     p.id;
  // `;
  return result;
};

exports.updatefiles = async (uuid, data) => {
  // const result = await prisma.$queryRaw`
  // UPDATE "Files" SET VALEUS WHERE uuid=${uuid}`;
  const result = await prisma.files.update({
    where: { uuid },
    data,
  });
  return result;
};

exports.deletefile = async (uuid) => {
  // const result = await prisma.$queryRaw`
  // DELETE FROM "FILES" WHERE uuid=${uuid}`;
  const result = await prisma.files.delete({
    where: { uuid },
  });
  return result;
};
