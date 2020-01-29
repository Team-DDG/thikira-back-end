import { Restaurant } from '@app/restaurant';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckEmailDto } from '../../restaurant/src/dto';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User)
              public readonly users: Repository<User>) {
  }

  private async find_user_by_email(email: string) {
    return new User(this.users.findOne({ email }));
  }

  public async check_email(payload: CheckEmailDto): Promise<void> {
    const found_user: User = await this.find_user_by_email(payload.email);
    if (!found_user.isEmpty()) {
      throw new ConflictException();
    }
  }
}
