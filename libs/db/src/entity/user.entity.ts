import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public readonly u_id: number;
  @Column()
  public email: string;
  @Column()
  public phone: string;
  @Column({ nullable: true })
  public add_street: string = null;
  @Column({ nullable: true })
  public add_parcel: string = null;
  @Column()
  public password: string;
  @Column()
  public nickname: string;
  @CreateDateColumn()
  public readonly create_time: Date;
}
