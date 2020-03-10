import { IsString } from 'class-validator';

export class ParamRemoveMenu {
  @IsString()
  public readonly m_id: string;
}
