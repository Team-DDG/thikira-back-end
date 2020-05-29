import { Module } from '@nestjs/common';
import { config, ConfigService } from './config.service';

@Module({
  exports: [ConfigService],
  providers: [{
    provide: ConfigService,
    useValue: config,
  }],
})
export class ConfigModule {
}
