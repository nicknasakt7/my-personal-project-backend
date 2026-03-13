import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { TypeConfigService } from 'src/config/type-config.service';

import streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  constructor(private readonly typeConfigService: TypeConfigService) {
    cloudinary.config({
      cloud_name: typeConfigService.get('CLOUDINARY_CLOUD_NAME'),
      api_key: typeConfigService.get('CLOUDINARY_API_KEY'),
      api_secret: typeConfigService.get('CLOUDINARY_API_SECRET')
    });
  }

  upload(file: Express.Multer.File): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'avatars' },
        (error, result) => {
          if (error || !result) {
            reject(new Error('Cloudinary upload failed'));
            return;
          }
          resolve(result);
        }
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
  async delete(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }
}
