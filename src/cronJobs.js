const cron = require("node-cron");
const prisma = require("./prismaconfig");
const path = require("path");
const fs = require("fs");
const os = require("os");

const { convertVideoToAudio } = require("./utils/audioConverter");
const { uploadFileToSpaces } = require("./utils/FileUploader");

module.exports = () => {
  // ⏱ Runs every minute
  cron.schedule("*/10 * * * *", async () => {
    console.log("🎧 Audio conversion cron running...");

    try {
      // 1️⃣ Fetch episodes pending audio conversion
      const episodes = await prisma.episode.findMany({
        where: {
          audio: null,
          link: { not: null },
          isDeleted: false,
        },
        take: 2, // ✅ Small batches = stable FFmpeg
        orderBy: { createdAt: "asc" },
      });

      if (!episodes.length) {
        console.log("✅ No episodes pending audio conversion");
        return;
      }

      // 2️⃣ Create OS-safe temp directory
      const tempDir = path.join(os.tmpdir(), "podcast-audio");

      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      for (const episode of episodes) {
        const tempAudioPath = path.join(
          tempDir,
          `${episode.uuid}.mp3`
        );

        try {
          console.log(`🔄 Processing episode: ${episode.uuid}`);

          // 3️⃣ Convert video → audio
          await convertVideoToAudio(episode.link, tempAudioPath);

          // 4️⃣ Upload audio file
          const audioUrl = await uploadFileToSpaces({
            path: tempAudioPath,
            mimeType: "audio/mpeg",
            folder: "episode-audios",
          });

          // 5️⃣ Update episode record
          await prisma.episode.update({
            where: { id: episode.id },
            data: { audio: audioUrl },
          });

          console.log(`✅ Audio created for episode ${episode.uuid}`);
        } catch (episodeErr) {
          console.error(
            `❌ Failed for episode ${episode.uuid}`,
            episodeErr
          );
        } finally {
          // 6️⃣ Always cleanup temp file
          if (fs.existsSync(tempAudioPath)) {
            fs.unlinkSync(tempAudioPath);
          }
        }
      }
    } catch (error) {
      console.error("❌ Error in audio cron job:", error);
    }
  });
};
