import { ConfigModule } from '@app/config';
import { Module } from '@nestjs/common';
import { UtilService } from './util.service';

@Module({
  imports: [ConfigModule],
  providers: [UtilService],
  exports: [UtilService],
})
export class UtilModule {}
