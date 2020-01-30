import { CheckEmailDto } from '@app/util';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User)
              private readonly users: Repository<User>,
  ) {
  }

  private async findUserById(id: number) {
    return this.users.findOne(id);
  }

  private async findUserByEmail(email: string) {
    return this.users.findOne({ email });
  }

  public async check_user(payload: CheckEmailDto): Promise<void> {
    const foundUser = await this.findUserByEmail(payload.email);
    if (foundUser) {
      throw new ConflictException();
    }
  }
}
