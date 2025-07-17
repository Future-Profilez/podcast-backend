const multer = require('multer');
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { v4: uuidv4 } = require('uuid');

// ✅ Correct AWS S3 credentials
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({ storage: multer.memoryStorage() });

const uploadFileToSpaces = async (file) => {
  try {
    const fileName = `${uuidv4()}-${file.originalname.replaceAll(" ", "_")}`;
    const folder = 'files'; // 👈 changed from uploads to files

    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${folder}/${fileName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
      // ACL: 'public-read', // keep removed for Bucket Owner Enforced
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // ✅ Construct S3 public URL
    const fileUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${folder}/${fileName}`;
    return fileUrl;
  } catch (err) {
    console.error('Upload error:', err.message);
    return null;
  }
};

const deleteFileFromSpaces = async (fileUrl) => {
  try {
    const urlParts = fileUrl.split('/');
    const fileKey = urlParts.slice(urlParts.indexOf('files')).join('/'); // 👈 updated from 'uploads' to 'files'

    const deleteParams = {
      Bucket: process.env.S3_BUCKET_NAME,
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