import { ApiProperty } from '@nestjs/swagger';

export class ResReplyReview {
  @ApiProperty()
  public readonly rr_id: number;
  @ApiProperty()
  public readonly content: string;
  @ApiProperty()
  public readonly create_time: Date;
  @ApiProperty()
  public readonly edit_time?: Date;
  @ApiProperty()
  public readonly is_edited: boolean;
}

export class ResGetReviewList {
  @ApiProperty()
  public readonly rv_id: number;
  @ApiProperty()
  public readonly content: string;
  @ApiProperty()
  public readonly create_time: Date;
  @ApiProperty()
  public readonly edit_time?: Date;
  @ApiProperty()
  public readonly image?: string;
  @ApiProperty()
  public readonly is_edited: boolean;
  @ApiProperty()
  public readonly star: number;
  @ApiProperty({ type: ResReplyReview })
  public readonly reply_review?: ResReplyReview;
}
