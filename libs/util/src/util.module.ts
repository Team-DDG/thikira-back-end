import { ConfigModule } from '@app/config';
import { Module } from '@nestjs/common';
import { UtilService } from './util.service';

@Module({
  exports: [UtilService],
  imports: [ConfigModule],
  providers: [UtilService],
})
export class UtilModule {}
