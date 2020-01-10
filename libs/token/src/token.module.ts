import { ConfigModule } from '@app/config';
import { Module } from '@nestjs/common';
import { TokenService } from './token.service';

@Module({
  exports: [TokenService],
  imports: [ConfigModule],
  providers: [TokenService],
})
export class TokenModule {}
