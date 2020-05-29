import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumberString, IsString } from 'class-validator';

export class DtoCreateUser {
  @ApiProperty() @IsEmail()
  public readonly email: string;
  @ApiProperty() @IsString()
  public readonly nickname: string;
  @ApiProperty() @IsString()
  public readonly password: string;
  @ApiProperty() @IsNumberString()
  public readonly phone: string;
}
