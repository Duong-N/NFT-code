import { Body, Controller, Post } from '@nestjs/common';
import { NFTService } from './nft.service';

@Controller('NFT')
export class NFTController {
  constructor(private readonly nftService: NFTService) {}
  @Post('mint')
  async mintNFT(@Body() body: { metadataCid: string; walletAddress: string }) {
    return await this.nftService.mintNFT(body.metadataCid, body.walletAddress);
  }
  @Post('transfer')
  async transferNFT(
    @Body()
    body: {
      fromAddress: string;
      toAddress: string;
      tokenId: string;
      contractAddress: string;
    }
  ) {
    const { fromAddress, toAddress, tokenId, contractAddress } = body;
    return this.nftService.transferNFT(
      fromAddress,
      toAddress,
      tokenId,
      contractAddress
    );
  }
  @Post('approve')
  async approveTransaction(
    @Body()
    body: {
      walletLocator: string;
      transactionId: string;
      signer: string;
      signature: string;
    }
  ) {
    const { walletLocator, transactionId, signer, signature } = body;
    return await this.nftService.approveTransaction(
      walletLocator,
      transactionId,
      signer,
      signature
    );
  }
}
