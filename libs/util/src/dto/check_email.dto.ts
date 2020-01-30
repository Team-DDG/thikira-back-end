import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class CheckEmailDto {
  @ApiProperty({
    description: '이메일',
    example: 'asdf@gmail.com',
  })
  @IsEmail()
  public readonly email: string;
}
