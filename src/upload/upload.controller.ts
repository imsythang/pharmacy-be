import cloudinary from '@/lib/cloudinary';
import { Request, Response } from 'express';

export const uploadImage = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file;
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'pharmacy-news', // Tạo folder trên Cloudinary
    });
    return res.json({ url: result.secure_url });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Upload failed' });
  }
};
