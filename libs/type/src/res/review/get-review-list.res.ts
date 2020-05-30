import { ApiProperty } from '@nestjs/swagger';

export class ResReplyReview {
  @ApiProperty()
  public readonly restaurantId: number;
  @ApiProperty()
  public readonly content: string;
  @ApiProperty()
  public readonly createTime: Date;
  @ApiProperty()
  public readonly editTime?: Date;
  @ApiProperty()
  public readonly isEdited: boolean;
}

export class ResGetReviewList {
  @ApiProperty()
  public readonly reviewId: number;
  @ApiProperty()
  public readonly content: string;
  @ApiProperty()
  public readonly createTime: Date;
  @ApiProperty()
  public readonly editTime?: Date;
  @ApiProperty()
  public readonly image?: string;
  @ApiProperty()
  public readonly isEdited: boolean;
  @ApiProperty()
  public readonly star: number;
  @ApiProperty({ type: ResReplyReview })
  public readonly replyReview?: ResReplyReview;
}
