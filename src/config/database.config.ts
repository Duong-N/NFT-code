/* eslint-disable prettier/prettier */
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserWallet } from 'src/module/crossmint/wallet/entity/user-wallet.entity';

export const databaseConfig = ( configService : ConfigService ): TypeOrmModuleOptions => ({
  type: 'mysql',
  host: configService.get<string>('DB_host'),
  port: configService.get<number>('DB_port'),
  username: configService.get<string>('DB_username'),
  password: configService.get<string>('DB_password'),
  database: configService.get<string>('DB_database'),
  entities: [UserWallet],
  synchronize: true,
});
