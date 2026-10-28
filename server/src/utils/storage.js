const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const { isCloudinaryConfigured } = require('../middleware/upload');

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const uploadsDir = path.join(__dirname, '../../uploads');

const uploadToCloudinary = (fileBuffer, originalname) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'do-today-attachments',
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

const processUploadedFiles = async (files, req) => {
  if (!files || files.length === 0) return [];

  const attachments = [];

  if (isCloudinaryConfigured()) {
    for (const file of files) {
      const result = await uploadToCloudinary(file.buffer, file.originalname);
      attachments.push({
        filename: file.originalname,
        url: result.secure_url,
        mimeType: file.mimetype,
        size: file.size,
        publicId: result.public_id,
      });
    }
  } else {
    for (const file of files) {
      attachments.push({
        filename: file.originalname,
        url: `/uploads/${file.filename}`,
        mimeType: file.mimetype,
        size: file.size,
        publicId: file.filename,
      });
    }
  }

  return attachments;
};

const deleteAttachmentFile = async (attachment) => {
  if (!attachment || !attachment.publicId) return;

  try {
    if (isCloudinaryConfigured()) {
      await cloudinary.uploader.destroy(attachment.publicId, {
        resource_type: attachment.mimeType.startsWith('image/') ? 'image' : 'raw',
      });
    } else {
      const filePath = path.join(uploadsDir, attachment.publicId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (err) {
    console.error(`Error deleting attachment ${attachment.publicId}:`, err.message);
  }
};

module.exports = {
  processUploadedFiles,
  deleteAttachmentFile,
};

