import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserWallet } from './entity/user-wallet.entity';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class WalletService {
  private readonly crossmintApiUrl: string;
  private readonly crossmintApiKey: string;

  constructor(
    @InjectRepository(UserWallet)
    private readonly userWalletRepo: Repository<UserWallet>,
    private readonly configService: ConfigService
  ) {
    this.crossmintApiUrl = this.configService.get<string>('API_URL');
    this.crossmintApiKey = this.configService.get<string>('API_KEY');
  }

  async createWallet(email: string): Promise<string> {
    try {
      console.log('Preparing payload for wallet creation...');

      const payload = {
        linkedUser: `email:${email}`,
        type: 'evm-smart-wallet',
        config: {
          adminSigner: {
            type: 'evm-keypair',
            address: '0x1234567890123456789012345678901234567890',
          },
        },
        chain: 'base-sepolia',
      };

      console.log('Sending request to create wallet with payload:', payload);

      // send to  Crossmint API
      const response = await axios.post(this.crossmintApiUrl, payload, {
        headers: {
          'X-API-KEY': this.crossmintApiKey,
          'Content-Type': 'application/json',
        },
      });

      console.log('Received response from API:', response.data);

      if (response.data && response.data.address) {
        const walletAddress = response.data.address;

        // save to db
        const wallet = this.userWalletRepo.create({
          email,
          walletAddress,
        });

        await this.userWalletRepo.save(wallet);

        console.log('Wallet created and saved successfully:', walletAddress);
        return walletAddress;
      } else {
        console.error(
          'Failed to create wallet, no walletAddress in response:',
          response.data
        );
        throw new HttpException(
          'Failed to create custodial wallet',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    } catch (error: any) {
      console.error('Error occurred while creating wallet:', error);

      throw new HttpException(
        error.response?.data || 'Error creating custodial wallet',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
