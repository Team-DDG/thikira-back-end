import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class DtoSignIn {
  @ApiProperty({
    description: '이메일',
    example: 'asdf@gmail.com',
  })
  @IsEmail()
  public readonly email: string;

  @ApiProperty({
    description: '비밀번호',
    example: 'asdfasdf1234',
  })
  @IsString()
  public readonly password: string;
}
