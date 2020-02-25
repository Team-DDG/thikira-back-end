import { User } from '@app/db';
import { ApiProperty } from '@nestjs/swagger';
import { stringify } from "querystring";

export class ResLoadUser {
  @ApiProperty()
  public readonly phone: string;
  @ApiProperty()
  public readonly add_street: string;
  @ApiProperty()
  public readonly add_parcel: string;
  @ApiProperty()
  public readonly create_time: Date;
  @ApiProperty()
  public readonly nickname: string;

  constructor(user?: User) {
    if (user !== undefined) {
      if (user instanceof User) {
        this.phone = user.u_phone;
        this.add_street = user.u_add_street;
        this.add_parcel = user.u_add_parcel;
        this.create_time = user.u_create_time;
        this.nickname = user.u_nickname;
      }
    }
  }

  public get_info(): string {
    return stringify({
      phone: this.phone,
      nickname: this.nickname,
    });
  }

  public get_address(): string {
    return stringify({
      add_street: this.add_street,
      add_parcel: this.add_parcel,
    });
  }
}
