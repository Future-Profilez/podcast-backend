const multer = require('multer');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

// ✅ Backblaze B2 S3-compatible client
const s3Client = new S3Client({
  region: process.env.B2_REGION, // Example: "us-west-002"
  endpoint: process.env.B2_ENDPOINT, // Example: "https://s3.us-west-002.backblazeb2.com"
  credentials: {
    accessKeyId: process.env.B2_KEY_ID,
    secretAccessKey: process.env.B2_APPLICATION_KEY,
  },
});

const upload = multer({ storage: multer.memoryStorage() });

const uploadFileToSpaces = async (file) => {
  try {
    const fileName = `${uuidv4()}-${file.originalname.replaceAll(" ", "_")}`;
    const folder = 'files';

    const uploadParams = {
      Bucket: process.env.B2_BUCKET, // B2 bucket name
      Key: `${folder}/${fileName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // ✅ Construct Backblaze file URL
    const fileUrl = `${process.env.B2_ENDPOINT}/${folder}/${fileName}`;
    return fileUrl;
  } catch (err) {
    console.error('Upload error:', err.message);
    return null;
  }
};

const deleteFileFromSpaces = async (fileUrl) => {
  try {
    const urlParts = fileUrl.split('/');
    const bucketIndex = urlParts.indexOf(process.env.B2_BUCKET);
    const fileKey = urlParts.slice(bucketIndex + 1).join('/'); // extract path after bucket

    const deleteParams = {
      Bucket: process.env.B2_BUCKET,
      Key: fileKey,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);
    return true;
  } catch (err) {
    console.error('Delete error:', err.message);
    return false;
  }
};

module.exports = { upload, uploadFileToSpaces, deleteFileFromSpaces };