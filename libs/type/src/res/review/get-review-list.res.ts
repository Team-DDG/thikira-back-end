import { ApiProperty } from '@nestjs/swagger';
import { BaseReviewClass } from '../../etc/base-review.class';

export class ResGetReviewList extends BaseReviewClass {
  @ApiProperty()
  public readonly u_id: number;
  @ApiProperty()
  public readonly r_id: number;
}
