// src/telegram/telegram.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PhotoService {
    private token = process.env.TELEGRAM_BOT_TOKEN;

    async image(userId: number)
    {
        try {
            const photosResponse = await axios.get(`https://api.telegram.org/bot${this.token}/getUserProfilePhotos`, {
              params: { user_id: userId, limit: 1 },
            });
            const photos = photosResponse.data.result;
      
            if (photos.total_count === 0) {
              throw new HttpException('No profile photo found', HttpStatus.NOT_FOUND);
            }
      
            const fileId = photos.photos[0][0].file_id;
      
            const fileResponse = await axios.get(`https://api.telegram.org/bot${this.token}/getFile`, {
              params: { file_id: fileId },
            });
            const filePath = fileResponse.data.result.file_path;
      
            const url = `https://api.telegram.org/file/bot${this.token}/${filePath}`;
            return url;
          } catch (error) {
            throw new HttpException('Error fetching the profile photo', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
