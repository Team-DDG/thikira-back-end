import { ApiProperty } from '@nestjs/swagger';
import { BaseReviewClass } from '../../etc/base-review.class';

export class ResGetReviewListByRestaurant extends BaseReviewClass {
  @ApiProperty()
  public readonly u_id: number;
}
