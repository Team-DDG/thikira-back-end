import { RestaurantModule } from '@app/restaurant';
import { Module } from '@nestjs/common';

@Module({
  imports: [RestaurantModule],
})
export class AppModule {
}
