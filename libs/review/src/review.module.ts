import { mongodb_entities, mysql_entities } from '@app/entity';
import { Module } from '@nestjs/common';
import { RestaurantReviewController } from './restaurant-review.controller';
import { ReviewService } from './review.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserReviewController } from './user-review.controller';
import { UtilModule } from '@app/util';

@Module({
  controllers: [RestaurantReviewController, UserReviewController],
  exports: [ReviewService],
  imports: [
    TypeOrmModule.forFeature(mysql_entities, 'mysql'),
    TypeOrmModule.forFeature(mongodb_entities, 'mongodb'),
    UtilModule,
  ],
  providers: [ReviewService],
})
export class ReviewModule {
}
