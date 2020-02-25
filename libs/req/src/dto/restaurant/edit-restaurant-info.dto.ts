import { IsBoolean, IsNumber, IsNumberString, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DtoEditRestaurantInfo {
  @ApiProperty() @IsUrl() @IsOptional()
  public readonly image?: string;
  @ApiProperty() @IsString() @IsOptional()
  public readonly name?: string;
  @ApiProperty() @IsNumberString() @IsOptional()
  public readonly phone?: string;
  @ApiProperty() @IsString() @IsOptional()
  public readonly area?: string;
  @ApiProperty() @IsNumber() @IsOptional()
  public readonly min_price?: number;
  @ApiProperty() @IsString() @IsOptional()
  public readonly day_off?: string;
  @ApiProperty() @IsBoolean() @IsOptional()
  public readonly online_payment?: boolean;
  @ApiProperty() @IsBoolean() @IsOptional()
  public readonly offline_payment?: boolean;
  @ApiProperty() @IsString() @IsOptional()
  public readonly open_time?: string;
  @ApiProperty() @IsString() @IsOptional()
  public readonly close_time?: string;
  @ApiProperty() @IsString() @IsOptional()
  public readonly description?: string;
}
