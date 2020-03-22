import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class ResGetReviewStatistic {
  @ApiProperty() @IsNumber()
  public readonly zero: number;
  @ApiProperty() @IsNumber()
  public readonly one: number;
  @ApiProperty() @IsNumber()
  public readonly two: number;
  @ApiProperty() @IsNumber()
  public readonly three: number;
  @ApiProperty() @IsNumber()
  public readonly four: number;
  @ApiProperty() @IsNumber()
  public readonly five: number;
  @ApiProperty() @IsNumber()
  public readonly mean: number;
}
