import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DtoEditPassword {
  @ApiProperty()  @IsString()
  public readonly password: string;
}
