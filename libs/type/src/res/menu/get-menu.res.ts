import { ApiProperty } from '@nestjs/swagger';
import { Menu } from '@app/db';
import { ResGetGroup } from './get-group.res';
import { stringify } from 'querystring';

export class ResGetMenu {
  @ApiProperty() public readonly description: string;
  @ApiProperty() public readonly group?: ResGetGroup[];
  @ApiProperty() public readonly image: string;
  @ApiProperty() public readonly m_id: number;
  @ApiProperty() public readonly name: string;
  @ApiProperty() public readonly price: number;

  constructor(menu?) {
    if (menu !== undefined) {
      if (menu instanceof Menu) {
        this.m_id = menu.m_id;
        this.name = menu.m_name;
        this.price = menu.m_price;
        this.description = menu.m_description;
        this.image = menu.m_image;
        this.group = new Array<ResGetGroup>();
      } else {
        Object.assign(this, menu);
      }
    }
  }

  public is_empty() {
    return !this.name;
  }

  public get(): string {
    return stringify({
      description: this.description,
      image: this.image,
      name: this.name,
      price: this.price,
    });
  }
}
