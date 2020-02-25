import { ApiProperty } from '@nestjs/swagger';
import { Restaurant } from '@app/db';
import { stringify } from 'querystring';

export class ResLoadRestaurant {
  @ApiProperty() public readonly add_parcel: string;
  @ApiProperty() public readonly add_street: string;
  @ApiProperty() public readonly area: string;
  @ApiProperty() public readonly category: string;
  @ApiProperty() public readonly close_time: string;
  @ApiProperty() public readonly create_time: Date;
  @ApiProperty() public readonly day_off: string;
  @ApiProperty() public readonly description: string;
  @ApiProperty() public readonly image: string;
  @ApiProperty() public readonly min_price: number;
  @ApiProperty() public readonly name: string;
  @ApiProperty() public readonly offline_payment: boolean;
  @ApiProperty() public readonly online_payment: boolean;
  @ApiProperty() public readonly open_time: string;
  @ApiProperty() public readonly phone: string;

  constructor(restaurant?: Restaurant) {
    if (restaurant !== undefined) {
      if (restaurant instanceof Restaurant) {
        this.add_parcel = restaurant.r_add_parcel;
        this.add_street = restaurant.r_add_street;
        this.area = restaurant.r_area;
        this.category = restaurant.r_category;
        this.close_time = restaurant.r_close_time;
        this.create_time = restaurant.r_create_time;
        this.description = restaurant.r_description;
        this.image = restaurant.r_image;
        this.min_price = restaurant.r_min_price;
        this.name = restaurant.r_name;
        this.day_off = restaurant.r_day_off;
        this.online_payment = restaurant.r_online_payment;
        this.offline_payment = restaurant.r_offline_payment;
        this.open_time = restaurant.r_open_time;
        this.phone = restaurant.r_phone;
      }
    }
  }

  public get_info(): string {
    return stringify({
      area: this.area,
      close_time: this.close_time,
      day_off: this.day_off,
      description: this.description,
      image: this.image,
      min_price: this.min_price,
      name: this.name,
      offline_payment: this.offline_payment,
      online_payment: this.online_payment,
      open_time: this.open_time,
      phone: this.phone,
    });
  }

  public get_address(): string {
    return stringify({
      add_parcel: this.add_parcel,
      add_street: this.add_street,
    });
  }
}
