import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

export class DtoUploadReview {
  @ApiProperty() @IsNumber()
  public readonly restaurantId: number;
  @ApiProperty() @IsString()
  public readonly content: string;
  @ApiProperty() @IsUrl() @IsOptional()
  public readonly image?: string;
  @ApiProperty() @IsNumber()
  public readonly star: number;
}
