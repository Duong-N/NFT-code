import { Body, Controller, Post } from '@nestjs/common';
import { PinataService } from './pinata.service';

@Controller('pinata')
export class PinataController {
  constructor(private readonly pinataService: PinataService) {}

  @Post('upload-image')
  async uploadImage(@Body('filePath') filePath: string): Promise<any> {
    const imageCid = await this.pinataService.uploadImage(filePath);
    return {
      message: 'Image uploaded successfully!',
      imageCid: imageCid,
    };
  }
  @Post('upload-metadata')
  async uploadMetadata(@Body('imageCid') imageCid: string): Promise<any> {
    const metadataCid = await this.pinataService.uploadMetadata(imageCid);
    return {
      message: 'Metadata uploaded successfully!',
      metadataCid: metadataCid,
    };
  }
}
