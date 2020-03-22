import { Injectable } from '@nestjs/common';

@Injectable()
export class TestUtilService {
  public static make_comparable(param_1: {}, param_2: {}, delete_key: string[]): {}[] {
    const data_1: object = { ...param_1 };
    const data_2: object = { ...param_2 };
    for (const e of delete_key) {
      Reflect.deleteProperty(data_1, e);
      Reflect.deleteProperty(data_2, e);
    }
    return [data_1, data_2];
  }
}
