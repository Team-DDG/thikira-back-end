import { Column, CreateDateColumn } from 'typeorm';

export class BaseAccountClass {
  @CreateDateColumn()
  public create_time: Date;
  @Column()
  public email: string;
  @Column()
  public password: string;
  @Column({ nullable: true })
  public road_address: string = null;
  @Column({ nullable: true })
  public address: string = null;
}
