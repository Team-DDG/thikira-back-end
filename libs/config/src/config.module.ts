import { ConfigService, config } from './config.service';
import { Module } from '@nestjs/common';

@Module({
  exports: [ConfigService],
  providers: [{
    provide: ConfigService,
    useValue: config,
  }],
})
export class ConfigModule {
}
