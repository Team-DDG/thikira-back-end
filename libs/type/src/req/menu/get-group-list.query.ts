import { IsNumberString } from 'class-validator';

export class QueryGetGroupList {
  @IsNumberString()
  public readonly m_id: string;
}
