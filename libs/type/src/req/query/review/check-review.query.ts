import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export class QueryCheckReview {
  @ApiProperty() @IsNumberString()
  public readonly r_id: string;
}
