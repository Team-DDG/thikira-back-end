import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsNumberString, IsOptional, IsString, IsUrl } from 'class-validator';

export class DtoEditRestaurantInfo {
  @ApiProperty() @IsString() @IsOptional()
  public readonly area?: string;
  @ApiProperty() @IsString() @IsOptional()
  public readonly closeTime?: string;
  @ApiProperty() @IsString() @IsOptional()
  public readonly dayOff?: string;
  @ApiProperty() @IsString() @IsOptional()
  public readonly description?: string;
  @ApiProperty() @IsUrl() @IsOptional()
  public readonly image?: string;
  @ApiProperty() @IsNumber() @IsOptional()
  public readonly minPrice?: number;
  @ApiProperty() @IsString() @IsOptional()
  public readonly name?: string;
  @ApiProperty() @IsBoolean() @IsOptional()
  public readonly offlinePayment?: boolean;
  @ApiProperty() @IsBoolean() @IsOptional()
  public readonly onlinePayment?: boolean;
  @ApiProperty() @IsString() @IsOptional()
  public readonly openTime?: string;
  @ApiProperty() @IsNumberString() @IsOptional()
  public readonly phone?: string;
}
