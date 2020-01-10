import { ConfigModule, ConfigService } from '@app/config';
import { Module } from '@nestjs/common';
import { MongoService } from './mongo.service';

@Module({
  exports: [MongoService],
  imports: [ConfigModule],
  providers: [{
    inject: [ConfigService],
    provide: MongoService,
    useFactory(config: ConfigService) {
      return new MongoService(config.MONGODB_URI).connect();
    },
  }],
})
export class MongoModule {
}
