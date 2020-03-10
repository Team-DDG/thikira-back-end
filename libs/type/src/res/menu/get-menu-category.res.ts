import { ApiProperty } from '@nestjs/swagger';
import { stringify } from 'querystring';

export class ResGetMenuCategory {
  @ApiProperty() public readonly mc_id: number;
  @ApiProperty() public readonly name: string;

  public is_empty() {
    return !this.name;
  }

  constructor(menu_category) {
    Object.assign(this, menu_category);
  }

  public get(): string {
    return stringify({
      name: this.name,
    });
  }
}
