import { IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DtoUploadReview {
  @ApiProperty() @IsNumber()
  public readonly r_id: number;
  @ApiProperty() @IsString()
  public readonly content: string;
  @ApiProperty() @IsUrl() @IsOptional()
  public readonly image?: string;
  @ApiProperty() @IsNumber()
  public readonly star: number;
}
