import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinataSDK } from 'pinata-web3';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PinataService {
  private readonly pinata: PinataSDK;

  constructor(private readonly configService: ConfigService) {
    this.pinata = new PinataSDK({
      pinataJwt: this.configService.get<string>('PINATA_JWT'),
      pinataGateway: this.configService.get<string>('PINATA_GATEWAY'),
    });
  }

  async uploadImage(filePath: string): Promise<any> {
    try {
      // Read the image file from the specified path
      const fileName = path.basename(filePath);
      const fileContent = fs.readFileSync(filePath);

      // Create a file object
      const imageFile = new File([fileContent], fileName, {
        type: 'image/png',
      });

      // Upload image to Pinata
      const result = await this.pinata.upload.file(imageFile);
      console.log('Image uploaded to Pinata:', result);

      // Return the CID (Content Identifier)
      return result.IpfsHash;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  async uploadMetadata(imageCid: string): Promise<any> {
    try {
      // Create NFT metadata
      const metadata = {
        name: 'My First NFT',
        description: 'This is a test NFT created with Pinata',
        image: `ipfs://${imageCid}`, // Using the CID from image upload
      };

      // Upload metadata to Pinata
      const result = await this.pinata.upload.json(metadata);
      console.log('Metadata uploaded to Pinata:', result);

      // Return the metadata CID
      return result.IpfsHash;
    } catch (error) {
      console.error('Error uploading metadata:', error);
      throw error;
    }
  }
}
