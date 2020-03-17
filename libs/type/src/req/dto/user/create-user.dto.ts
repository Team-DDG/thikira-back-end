import { IsEmail, IsNumberString, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DtoCreateUser {
  @ApiProperty() @IsString()
  public readonly nickname: string;
  @ApiProperty() @IsNumberString()
  public readonly phone: string;
  @ApiProperty() @IsEmail()
  public readonly email: string;
  @ApiProperty() @IsString()
  public readonly password: string;
}
