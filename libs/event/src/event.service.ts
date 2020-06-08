import { AuthService } from '@app/auth';
import { Event } from '@app/entity';
import { DtoUploadEvent, ResGetEventList } from '@app/type';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class EventService {
  @InjectRepository(Event, 'mysql')
  private readonly eventRepo: Repository<Event>;
  @Inject()
  private readonly tokenService: AuthService;

  public async upload(token: string, payload: DtoUploadEvent): Promise<void> {
    this.tokenService.parseToken(token);

    const event: Event = new Event();
    Object.assign(event, payload);

    await this.eventRepo.insert(event);
  }

  public async getList(): Promise<ResGetEventList[]> {
    return this.eventRepo.find({ select: ['bannerImage', 'mainImage'] });
  }

  // only use in test

  public async get(): Promise<Event> {
    return this.eventRepo.findOne();
  }

  public async remove(eventId: number): Promise<void> {
    await this.eventRepo.delete(eventId);
  }
}
