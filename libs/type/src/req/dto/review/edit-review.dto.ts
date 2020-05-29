import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class DtoEditReview {
  @ApiProperty() @IsString() @IsOptional()
  public readonly content?: string;
  @ApiProperty() @IsString() @IsOptional()
  public readonly image?: string;
  @ApiProperty() @IsNumber() @IsOptional()
  public readonly star?: number;
}
