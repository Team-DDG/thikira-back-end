import { IsNumberString } from 'class-validator';

export class QueryGetCoupon {
  @IsNumberString()
  public readonly r_id: string;
}
