import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNumber, IsNumberString, IsString, IsUrl } from 'class-validator';

export class DtoCreateRestaurant {
  @ApiProperty() @IsString()
  public readonly area: string;
  @ApiProperty() @IsString()
  public readonly roadAddress: string;
  @ApiProperty() @IsString()
  public readonly address: string;
  @ApiProperty() @IsString()
  public readonly category: string;
  @ApiProperty() @IsString()
  public readonly closeTime: string;
  @ApiProperty() @IsString()
  public readonly description: string;
  @ApiProperty() @IsEmail()
  public readonly email: string;
  @ApiProperty() @IsUrl()
  public readonly image: string;
  @ApiProperty() @IsNumber()
  public readonly minPrice: number;
  @ApiProperty() @IsString()
  public readonly name: string;
  @ApiProperty() @IsBoolean()
  public readonly onlinePayment: boolean;
  @ApiProperty() @IsBoolean()
  public readonly offlinePayment: boolean;
  @ApiProperty() @IsString()
  public readonly openTime: string;
  @ApiProperty() @IsNumberString()
  public readonly phone: string;
  @ApiProperty() @IsString()
  public readonly dayOff: string;
  @ApiProperty() @IsString()
  public readonly password: string;
}
