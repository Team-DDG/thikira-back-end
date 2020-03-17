import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DtoUploadMenuCategory {
  @ApiProperty() @IsString()
  public readonly name: string;
}
