import { RestaurantModule } from '@app/restaurant';
import { UtilModule, UtilService } from '@app/util';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppGuard } from './app.guard';

@Module({
  imports: [RestaurantModule, UtilModule],
  providers: [{
    inject: [UtilService],
    provide: APP_GUARD,
    useClass: AppGuard,
  }]
})
export class AppModule {
}
