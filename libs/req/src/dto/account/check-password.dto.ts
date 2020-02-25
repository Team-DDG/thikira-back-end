import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DtoCheckPassword {
  @ApiProperty()  @IsString()
  public readonly password: string;
}
