import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public readonly id: number;
  @Column()
  public readonly email: string;
  @Column()
  public readonly phone: string;
  @Column()
  public readonly add_street: string;
  @Column()
  public readonly add_parcel: string;
  @Column()
  public readonly password: string;
  @Column()
  public readonly nickname: string;
  @CreateDateColumn()
  public readonly create_time: Date;

  constructor(restaurant) {
    Object.assign(this, restaurant);
  }

  public isEmpty(): boolean {
    return !this.email;
  }
}
