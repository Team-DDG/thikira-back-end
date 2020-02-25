import { IsString } from 'class-validator';

export class QueryCheckEmail {
  @IsString()
  public readonly email: string;
}
