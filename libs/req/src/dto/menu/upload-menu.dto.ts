import { IsArray, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DtoUploadGroup } from './upload-group.dto';
import { stringify } from 'querystring';

export class DtoUploadMenu {
  @ApiProperty() @IsString()
  public readonly description: string;
  @ApiProperty() @IsUrl()
  public readonly image: string;
  @ApiProperty() @IsNumber()
  public readonly mc_id: number;
  @ApiProperty() @IsString()
  public readonly name: string;
  @ApiProperty() @IsNumber()
  public readonly price: number;
  @ApiProperty()  @IsArray()  @IsOptional()
  public readonly group?: DtoUploadGroup[];

  constructor(payload) {
    Object.assign(this, payload);
  }

  public get(): string {
    return stringify({
      description: this.description,
      image: this.image,
      name: this.name,
      price: this.price,
    });
  }
}
