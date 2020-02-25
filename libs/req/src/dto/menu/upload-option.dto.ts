import { IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { stringify } from 'querystring';

export class DtoUploadOption {
  @ApiProperty() @IsNumber()
  public readonly g_id: number;
  @ApiProperty() @IsString()
  public readonly name: string;
  @ApiProperty() @IsNumber()
  public readonly price: number;

  constructor(payload) {
    Object.assign(this, payload);
  }

  public get(): string {
    return stringify({
      name: this.name,
      price: this.price,
    });
  }
}
