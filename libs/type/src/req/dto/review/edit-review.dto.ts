import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DtoEditReview {
  @ApiProperty() @IsString() @IsOptional()
  public readonly content?: string;
  @ApiProperty() @IsString() @IsOptional()
  public readonly image?: string;
  @ApiProperty() @IsNumber() @IsOptional()
  public readonly star?: number;
}
