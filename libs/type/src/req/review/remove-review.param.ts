import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export class ParamRemoveReview {
  @ApiProperty() @IsNumberString()
  public readonly r_id: string;
}
