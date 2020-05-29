import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsNumber, IsNumberString, IsString, IsUrl } from 'class-validator';

export class DtoCreateRestaurant {
  @ApiProperty() @IsString()
  public readonly area: string;
  @ApiProperty() @IsString()
  public readonly add_street: string;
  @ApiProperty() @IsString()
  public readonly add_parcel: string;
  @ApiProperty() @IsString()
  public readonly category: string;
  @ApiProperty() @IsString()
  public readonly close_time: string;
  @ApiProperty() @IsString()
  public readonly description: string;
  @ApiProperty() @IsEmail()
  public readonly email: string;
  @ApiProperty() @IsUrl()
  public readonly image: string;
  @ApiProperty() @IsNumber()
  public readonly min_price: number;
  @ApiProperty() @IsString()
  public readonly name: string;
  @ApiProperty() @IsBoolean()
  public readonly online_payment: boolean;
  @ApiProperty() @IsBoolean()
  public readonly offline_payment: boolean;
  @ApiProperty() @IsString()
  public readonly open_time: string;
  @ApiProperty() @IsNumberString()
  public readonly phone: string;
  @ApiProperty() @IsString()
  public readonly day_off: string;
  @ApiProperty() @IsString()
  public readonly password: string;
}
