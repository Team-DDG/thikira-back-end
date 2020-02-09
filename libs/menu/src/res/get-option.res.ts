import { ApiProperty } from '@nestjs/swagger';

export class ResGetOption {
  @ApiProperty({
    description: '옵션 아이디',
    example: 0,
  })
  public readonly option_id: number;
  @ApiProperty({
    description: '옵션 이름',
    example: '순살',
  })
  public readonly name: string;
  @ApiProperty({
    description: '가격',
    example: 1000,
  })
  public readonly price: number;

  constructor(payload?) {
    if (payload !== undefined) {
      const option_data = { option_id: payload.id, ...payload, id: undefined };
      delete option_data.id;
      Object.assign(this, option_data);
    }
  }
}
