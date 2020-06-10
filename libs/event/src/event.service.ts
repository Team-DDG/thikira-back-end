import { AuthService } from '@app/auth';
import { Event } from '@app/entity';
import { DtoUploadEvent, ResGetEventList } from '@app/type';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class EventService {
  @InjectRepository(Event, 'mysql')
  private readonly event_repo: Repository<Event>;
  @Inject()
  private readonly auth_service: AuthService;

  public async upload(payload: DtoUploadEvent): Promise<void> {
    const event: Event = new Event();
    Object.assign(event, payload);

    await this.event_repo.insert(event);
  }

  public async getList(): Promise<ResGetEventList[]> {
    return this.event_repo.find({ select: ['banner_image', 'main_image'] });
  }

  // only use in test

  public async get(): Promise<Event> {
    return this.event_repo.findOne();
  }

  public async remove(e_id: number): Promise<void> {
    await this.event_repo.delete(e_id);
  }
}
