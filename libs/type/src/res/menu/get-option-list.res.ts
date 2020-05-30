import { ApiProperty } from '@nestjs/swagger';

export class ResGetOptionList {
  @ApiProperty()
  public readonly name: string;
  @ApiProperty()
  public readonly optionId: number;
  @ApiProperty()
  public readonly price: number;
}
