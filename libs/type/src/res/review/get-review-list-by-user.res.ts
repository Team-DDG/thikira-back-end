import { ApiProperty } from '@nestjs/swagger';
import { BaseReviewClass } from '../../etc/base-review.class';

export class ResGetReviewListByUser extends BaseReviewClass {
  @ApiProperty()
  public readonly r_id: number;
}
