import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { stringify } from 'querystring';

export class DtoUploadMenuCategory {
  @ApiProperty() @IsString()
  public readonly name: string;

  constructor(payload) {
    Object.assign(this, payload);
  }

  public get(): string {
    return stringify({
      name: this.name,
    });
  }
}
