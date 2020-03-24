import { Module } from '@nestjs/common';
import { TestUtilService } from './test-util.service';

@Module({
  exports: [TestUtilService],
  providers: [TestUtilService],
})
export class TestUtilModule {
}
