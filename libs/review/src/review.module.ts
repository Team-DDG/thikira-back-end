import { AuthModule } from '@app/auth';
import { mongodbEntities, mysqlEntities } from '@app/entity';
import { UserModule } from '@app/user';
import { UtilModule } from '@app/util';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantReviewController } from './restaurant-review.controller';
import { ReviewService } from './review.service';
import { UserReviewController } from './user-review.controller';

@Module({
  controllers: [RestaurantReviewController, UserReviewController],
  exports: [ReviewService],
  imports: [
    AuthModule,
    TypeOrmModule.forFeature(mysqlEntities, 'mysql'),
    TypeOrmModule.forFeature(mongodbEntities, 'mongodb'),
    UserModule, UtilModule,
  ],
  providers: [ReviewService],
})
export class ReviewModule {
}
