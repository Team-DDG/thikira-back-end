import { ConfigModule, ConfigService } from '@app/config';
import { Test, TestingModule } from '@nestjs/testing';
import { MongoService } from './mongo.service';

describe('MongoService', () => {
  let service: MongoService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [{
        inject: [ConfigService],
        provide: MongoService,
        useFactory(config: ConfigService) {
          return new MongoService(config.MONGODB_URI).connect();
        },
      }],
    }).compile();

    service = module.get<MongoService>(MongoService);
  });

  afterAll(async () => {
    await service.close();
  });

  it('should get database and collection from MongoDB', () => {
    expect(service.db().collection('test')).toBeTruthy();
  });
});
