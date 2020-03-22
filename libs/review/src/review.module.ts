import { DBModule } from '@app/db';
import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { TypeModule } from '@app/type';
import { UtilModule } from '@app/util';

@Module({
  exports: [ReviewService],
  imports: [DBModule, TypeModule, UtilModule],
  providers: [ReviewService],
})
export class ReviewModule {
}
