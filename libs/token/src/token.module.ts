import { ConfigModule } from '@app/config';
import { Module } from '@nestjs/common';
import { TokenService } from './token.service';

@Module({
  imports: [ConfigModule],
  providers: [TokenService],
  exports: [TokenService],
})
export class TokenModule {}
