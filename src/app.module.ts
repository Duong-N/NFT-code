import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './config/database.module';
import { WalletModule } from './module/crossmint/wallet/wallet.module';
import { PinataModule } from './module/pinata/pinata.module';
import { NFTModule } from './module/crossmint/nft_mint/nft.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    WalletModule,
    PinataModule,
    NFTModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
