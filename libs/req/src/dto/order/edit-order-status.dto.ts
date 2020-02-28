import { ApiProperty } from '@nestjs/swagger';
import { EnumOrderStatus } from '@app/db';
import { IsString } from 'class-validator';

export class DtoEditOrderStatus {
  @ApiProperty({ enum: EnumOrderStatus, type: 'enum' })
  @IsString()
  public readonly status: EnumOrderStatus;
  @ApiProperty() @IsString()
  public readonly od_id: string;
}
