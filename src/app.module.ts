import { RestaurantModule } from '@app/restaurant';
import { UserModule } from '@app/user';
import { Module } from '@nestjs/common';

@Module({
  imports: [UserModule, RestaurantModule],
})
export class AppModule {
}
