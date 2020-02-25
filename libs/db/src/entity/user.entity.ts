import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { stringify } from 'querystring';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public readonly u_id: number;
  @Column()
  public readonly u_email: string;
  @Column()
  public readonly u_phone: string;
  @Column({ nullable: true })
  public readonly u_add_street?: string = null;
  @Column({ nullable: true })
  public readonly u_add_parcel?: string = null;
  @Column()
  public readonly u_password: string;
  @Column()
  public readonly u_nickname: string;
  @CreateDateColumn()
  public readonly u_create_time: Date;

  public is_empty(): boolean {
    return !this.u_email;
  }

  constructor(user?) {
    if (user !== undefined) {
      if (user instanceof User) {
        Object.assign(this, user);
      } else {
        this.u_email = user.email;
        this.u_phone = user.phone;
        this.u_password = user.password;
        this.u_nickname = user.nickname;
      }
    }
  }

  public get_info(): string {
    return stringify({
      nickname: this.u_nickname,
      phone: this.u_phone,
    });
  }

  public get_address(): string {
    return stringify({
      add_parcel: this.u_add_parcel,
      add_street: this.u_add_street,
    });
  }
}
