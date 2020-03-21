import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public u_id: number;
  @Column({ nullable: true })
  public add_street: string = null;
  @Column({ nullable: true })
  public add_parcel: string = null;
  @Column()
  public email: string;
  @Column()
  public phone: string;
  @Column()
  public password: string;
  @Column()
  public nickname: string;
  @CreateDateColumn()
  public create_time: Date;
}
