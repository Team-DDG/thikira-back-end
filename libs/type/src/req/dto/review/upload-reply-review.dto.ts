import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DtoUploadReplyReview {
  @ApiProperty() @IsNumber()
  public readonly rv_id: number;
  @ApiProperty() @IsString()
  public readonly content: string;
}
