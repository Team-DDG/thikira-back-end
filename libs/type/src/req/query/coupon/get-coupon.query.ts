import { IsNumberString } from 'class-validator';

export class QueryGetCoupon {
  @IsNumberString()
  public readonly restaurantId: string;
}
