import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class DtoUploadReplyReview {
  @ApiProperty() @IsNumber()
  public readonly u_id: number;
  @ApiProperty() @IsString()
  public readonly content: string;
}
