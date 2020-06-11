import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilService {
  public static parseIds(ids: string): number[] {
    return ids.split(',').map((e_id: string): number => {
      return parseInt(e_id);
    });
  }
}
