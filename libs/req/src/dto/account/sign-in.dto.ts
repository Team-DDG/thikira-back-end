import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DtoSignIn {
  @ApiProperty() @IsEmail()
  public readonly email: string;
  @ApiProperty() @IsString()
  public readonly password: string;
}
