import { IsNumber } from 'class-validator';

export class QueryGetCoupon {
  @IsNumber()
  public readonly r_id: number;
}
