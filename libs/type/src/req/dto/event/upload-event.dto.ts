import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DtoUploadEvent {
  @ApiProperty() @IsString()
  public bannerImage: string;
  @ApiProperty() @IsString()
  public mainImage: string;
}
