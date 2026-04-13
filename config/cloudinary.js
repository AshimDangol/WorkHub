require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadFile = async (fileBuffer, fileName, folder = 'workforcehub') => {
  try {
    const result = await cloudinary.uploader.upload(fileBuffer, {
      folder,
      resource_type: 'auto',
      public_id: fileName
    });
    return { success: true, url: result.secure_url, publicId: result.public_id };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return { success: false, error: error.message };
  }
};

const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return { success: true, message: 'File deleted successfully' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = { uploadFile, deleteFile };
