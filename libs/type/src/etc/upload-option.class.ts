import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadOptionClass {
  @ApiProperty() @IsString()
  public readonly name: string;
  @ApiProperty() @IsNumber()
  public readonly price: number;
}
