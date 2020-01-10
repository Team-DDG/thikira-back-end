import { RestaurantModule } from '@app/restaurant';
import { UserModule } from '@app/user';
import { UtilModule } from '@app/util';
import { Module } from '@nestjs/common';

@Module({
  imports: [UserModule, RestaurantModule, UtilModule],
})
export class AppModule {
}
