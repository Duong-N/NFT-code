import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { encodeFunctionData } from 'viem';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface CrossmintErrorResponse {
  message: string;
  data?: any;
}

@Injectable()
export class NFTService {
  private readonly API_MINT_URL: string;
  private readonly chain: string;
  private readonly crossmintApiKey: string;
  private readonly API_URL: string;

  constructor(private readonly configService: ConfigService) {
    this.API_MINT_URL =
      'https://staging.crossmint.com/api/2022-06-09/collections/default/nfts';
    this.chain = 'base-sepolia';
    this.crossmintApiKey = this.configService.get<string>('API_KEY');
    this.API_URL = this.configService.get<string>('API_URL');
  }

  async mintNFT(metadataCid: string, walletAddress: string): Promise<any> {
    try {
      const recipient = `polygon-amoy:${walletAddress}`;
      const payload = {
        recipient: recipient,
        metadata: `https://${metadataCid}.ipfs.nftstorage.link/`,
        chain: this.chain,
      };

      const response = await axios.post(this.API_MINT_URL, payload, {
        headers: {
          'x-api-key': this.crossmintApiKey,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const errorMessage = error.response?.data?.message || error.message;
        console.error('Error minting NFT:', errorMessage);
        throw new BadRequestException(errorMessage || 'Failed to mint NFT');
      }
      throw new BadRequestException('Failed to mint NFT');
    }
  }
  encodeTransferData(
    fromAddress: string,
    toAddress: string,
    tokenId: string
  ): string {
    return encodeFunctionData({
      abi: [
        {
          name: 'transferFrom',
          type: 'function',
          inputs: [
            { name: 'from', type: 'address' },
            { name: 'to', type: 'address' },
            { name: 'tokenId', type: 'uint256' },
          ],
          outputs: [],
          stateMutability: 'nonpayable',
        },
      ],
      args: [fromAddress, toAddress, tokenId],
    });
  }
  async sendTransferTransaction(
    data: string,
    fromAddress: string,
    contractAddress: string
  ): Promise<any> {
    const response = await fetch(
      `${this.configService.get<string>('API_URL')}/${fromAddress}/transactions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.crossmintApiKey,
        },
        body: JSON.stringify({
          params: {
            calls: [
              {
                to: contractAddress,
                value: '0',
                data: data,
              },
            ],
            chain: 'base-sepolia',
          },
        }),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      throw new Error(`Failed to transfer NFT: ${result.message}`);
    }

    return result;
  }
  async transferNFT(
    fromAddress: string,
    toAddress: string,
    tokenId: string,
    contractAddress: string
  ): Promise<any> {
    // hash
    const data = this.encodeTransferData(fromAddress, toAddress, tokenId);

    // send
    return this.sendTransferTransaction(data, fromAddress, contractAddress);
  }
  async approveTransaction(
    walletLocator: string, // i think the wallet of the sender
    transactionId: string, // when you create the transaction it will apear (exp:c889e2f5-cca5-4fce-9e6d-796595e5278d)
    signer: string,
    signature: string
  ): Promise<any> {
    try {
      // create body request for approval
      const payload = {
        approvals: [
          {
            signer: signer, // Address (exp: evm-keypair:0x1234...)
            signature: signature, // signature (create from wallet)
          },
        ],
      };

      // sendsend request approval t0 API
      const response = await axios.post(
        `${this.API_URL}/${walletLocator}/transactions/${transactionId}/approvals`,
        payload,
        {
          headers: {
            'X-API-KEY': this.crossmintApiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Failed to approve transaction');
    }
  }
}
