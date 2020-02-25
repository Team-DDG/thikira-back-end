import { ApiProperty } from '@nestjs/swagger';
import { User } from '@app/db';
import { stringify } from 'querystring';

export class ResLoadUser {
  @ApiProperty() public readonly add_parcel: string;
  @ApiProperty() public readonly add_street: string;
  @ApiProperty() public readonly create_time: Date;
  @ApiProperty() public readonly nickname: string;
  @ApiProperty() public readonly phone: string;

  constructor(user?: User) {
    if (user !== undefined) {
      if (user instanceof User) {
        this.add_parcel = user.u_add_parcel;
        this.add_street = user.u_add_street;
        this.create_time = user.u_create_time;
        this.nickname = user.u_nickname;
        this.phone = user.u_phone;
      }
    }
  }

  public get_info(): string {
    return stringify({
      nickname: this.nickname,
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
