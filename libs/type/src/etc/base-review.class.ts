import { ApiProperty } from '@nestjs/swagger';

export class ResReplyReview {
  @ApiProperty()
  public readonly content: string;
  @ApiProperty()
  public readonly create_time: Date;
  @ApiProperty()
  public readonly edit_time?: Date;
  @ApiProperty()
  public readonly is_edited: boolean;
}

export class BaseReviewClass {
  @ApiProperty()
  public content: string;
  @ApiProperty()
  public create_time: Date;
  @ApiProperty()
  public edit_time?: Date;
  @ApiProperty()
  public image?: string;
  @ApiProperty()
  public is_edited: boolean;
  @ApiProperty()
  public star: number;
  @ApiProperty({ type: ResReplyReview })
  public readonly reply_review?: ResReplyReview;
}
