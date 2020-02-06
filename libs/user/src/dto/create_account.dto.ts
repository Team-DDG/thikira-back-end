import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumberString, IsString } from 'class-validator';

export class DtoCreateAccount {
  @ApiProperty({
    description: '닉네임',
    example: 'jepanglee',
  })
  @IsString()
  public readonly nickname: string;

  @ApiProperty({
    description: '전화번호',
    example: '01012312312',
  })
  @IsNumberString()
  public readonly phone: string;

  @ApiProperty({
    description: '이메일',
    example: 'asdf@gmail.com',
  })
  @IsEmail()
  public readonly email: string;

  @ApiProperty({
    description: '비밀번호',
    example: 'adfasdf123',
  })
  @IsString()
  public readonly password: string;
}
