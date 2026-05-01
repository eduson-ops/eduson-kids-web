import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { GuestToken } from './guest-token.entity';
import { GuestService } from './guest.service';
import { GuestController } from './guest.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GuestToken]), JwtModule.register({})],
  controllers: [GuestController],
  providers: [GuestService],
  exports: [GuestService],
})
export class GuestModule {}
