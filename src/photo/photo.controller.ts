import { Controller, Get, HttpException, HttpStatus, Param, Res } from '@nestjs/common';
import { PhotoService } from './photo.service';
import { Response } from 'express';
import axios from 'axios';

@Controller('photo')
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @Get(":id")
  async image(
    @Param('id') id: number,
    @Res() res
  )
  {
    try {
      const photoUrl = await this.photoService.image(id);
      const imageResponse = await axios.get(photoUrl, { responseType: 'stream' });
      res.setHeader('Content-Type', imageResponse.headers['content-type']);
      imageResponse.data.pipe(res);
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.getStatus()).send(error.message);
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server error');
      }
    }
  }
}
