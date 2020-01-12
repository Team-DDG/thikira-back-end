import { MongoModule, MongoService } from '@app/mongo';
import { UtilModule } from '@app/util';
import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantService } from './restaurant.service';

describe('RestaurantService', () => {
  let service: RestaurantService;
  let mongo: MongoService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [MongoModule, UtilModule],
      providers: [RestaurantService],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);
    mongo = module.get<MongoService>(MongoService);
  });

  afterAll(async () => {
    await mongo.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
