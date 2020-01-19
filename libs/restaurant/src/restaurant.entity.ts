import { ObjectId } from 'mongodb';

export class Restaurant {
  public readonly _id: ObjectId;
  public readonly image: string;
  public readonly phone: string;
  public readonly add_street: string;
  public readonly add_parcel: string;
  public readonly area: string[];
  public readonly category: ObjectId;
  public readonly min_price: number;
  public readonly day_off: string;
  public readonly online_payment: boolean;
  public readonly offline_payment: boolean;
  public readonly open_time: string;
  public readonly close_time: string;
  public readonly description: string;
  public readonly email: string;
  public readonly password: string;

  constructor(restaurant) {
    Object.assign(this, restaurant);
  }

  public isEmpty(): boolean {
    return !this.email;
  }
}
