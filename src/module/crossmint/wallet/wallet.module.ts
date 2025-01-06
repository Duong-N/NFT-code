import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserWallet } from './entity/user-wallet.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserWallet])],
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}
