import { EnumOrderStatus } from '@app/entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DtoEditOrderStatus {
  @ApiProperty() @IsString()
  public readonly od_id: string;
  @ApiProperty({ enum: EnumOrderStatus, type: 'enum' })
  @IsString()
  public readonly status: EnumOrderStatus;
}
