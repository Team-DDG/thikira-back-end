import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export class ParamRemoveReplyReview {
  @ApiProperty() @IsNumberString()
  public readonly u_id: string;
}
