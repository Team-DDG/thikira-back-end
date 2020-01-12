import { MongoModule } from '@app/mongo';
import { UtilModule } from '@app/util';
import { Test, TestingModule } from '@nestjs/testing';
import { RestaurantService } from './restaurant.service';

describe('RestaurantService', () => {
  let service: RestaurantService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [MongoModule, UtilModule],
      providers: [RestaurantService],
    }).compile();

    service = module.get<RestaurantService>(RestaurantService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
