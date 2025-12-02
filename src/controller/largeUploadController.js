const { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand } = require("@aws-sdk/client-s3");
const { v4: uuid } = require("uuid");
const crypto = require("crypto");

const s3 = new S3Client({
  region: process.env.B2_REGION,
  endpoint: process.env.B2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY
  },
  forcePathStyle: true
});

exports.startLargeUpload = async (req, res) => {
  try {
    console.log("Upload route hit");
    const { fileName, mimeType } = req.body;

    const key = `files/${uuid()}-${fileName.replace(/\s/g, "_")}`;

    const command = new CreateMultipartUploadCommand({
      Bucket: process.env.B2_BUCKET,
      Key: key,
      ContentType: mimeType
    });

    const result = await s3.send(command);

    return res.status(200).json({
      uploadId: result.UploadId,
      key
    });

  } catch (err) {
    res.status(500).json({ message: "Init error", error: err.message });
  }
};

exports.uploadLargePart = async (req, res) => {
  try {
    const { uploadId, key, partNumber } = req.query;

    // FIX: Do not stream 'req'. Use req.body directly because express.raw parsed it.
    const buffer = req.body; 

    // Safety check: ensure buffer exists
    if (!buffer || buffer.length === 0) {
        return res.status(400).json({ message: "Empty request body received" });
    }

    // Calculate MD5 (Backblaze/S3 recommends this for data integrity)
    const md5 = crypto.createHash("md5").update(buffer).digest("base64");

    const command = new UploadPartCommand({
      Bucket: process.env.B2_BUCKET,
      Key: key,
      UploadId: uploadId,
      PartNumber: Number(partNumber),
      Body: buffer,
      ContentMD5: md5,
      ContentLength: buffer.length
    });

    const response = await s3.send(command);

    res.json({
      ETag: response.ETag.replace(/"/g, ""),
      PartNumber: Number(partNumber),
      Size: buffer.length
    });
  } catch (err) {
    console.error("Chunk upload failed:", err);
    res.status(500).json({ message: "Chunk upload failed", error: err.message });
  }
};

exports.completeLargeUpload = async (req, res) => {
  try {
    const { uploadId, key, parts } = req.body;

    const command = new CompleteMultipartUploadCommand({
      Bucket: process.env.B2_BUCKET,
      Key: key,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts }
    });

    await s3.send(command);

    const fileUrl = `${process.env.B2_DOWNLOAD_URL}/file/${process.env.B2_BUCKET}/${key}`;

    res.status(200).json({ fileUrl });

  } catch (err) {
    res.status(500).json({ message: "Merge failed", error: err.message });
  }
};