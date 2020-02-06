import { UtilService } from '@app/util';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group, Menu, MenuCategory, Option, Restaurant, User } from './entity';

@Injectable()
export class DBService {
  constructor(@InjectRepository(Restaurant)
              private readonly restaurant_repo: Repository<Restaurant>,
              @InjectRepository(User)
              private readonly user_repo: Repository<User>,
              @InjectRepository(Menu)
              private readonly menu_repo: Repository<Menu>,
              @InjectRepository(MenuCategory)
              private readonly menu_category_repo: Repository<MenuCategory>,
              @InjectRepository(Option)
              private readonly option_repo: Repository<Option>,
              @InjectRepository(Group)
              private readonly group_repo: Repository<Group>,
              private readonly util_service: UtilService,
  ) {
  }

  public async insert_restaurant(restaurant: Restaurant) {
    await this.restaurant_repo.insert(restaurant);
  }

  public async find_restaurant_by_id(id: number): Promise<Restaurant> {
    return new Restaurant(await this.restaurant_repo.findOne(id));
  }

  public async find_restaurant_by_email(email: string): Promise<Restaurant> {
    return new Restaurant(await this.restaurant_repo.findOne({ email }));
  }

  public async update_restaurant(email: string, payload): Promise<void> {
    if (payload.password) {
      payload.password = await this.util_service.encode(payload.password);
    }
    await this.restaurant_repo.update({ email }, payload);
  }

  public async delete_restaurant(email: string): Promise<void> {
    await this.restaurant_repo.delete({ email });
  }



  public async insert_user(user: User) {
    await this.user_repo.insert(user);
  }

  public async find_user_by_id(id: number) {
    return this.user_repo.findOne(id);
  }

  public async find_user_by_email(email: string) {
    return this.user_repo.findOne({ email });
  }

  public async update_user(email: string, payload): Promise<void> {
    if (payload.password) {
      payload.password = await this.util_service.encode(payload.password);
    }
    await this.user_repo.update({ email }, payload);
  }

  public async delete_user(email: string): Promise<void> {
    await this.user_repo.delete({ email });
  }



  public async insert_menu_category(menu_category: MenuCategory) {
    await this.menu_category_repo.insert(menu_category);
  }

  public async find_menu_category_by_id(id: number): Promise<MenuCategory> {
    return new MenuCategory(await this.menu_category_repo.findOne(id));
  }

  public async find_menu_category_by_name(name: string): Promise<MenuCategory> {
    return new MenuCategory(await this.menu_category_repo.findOne({ name }));
  }

  public async find_menu_categories_by_restaurant(restaurant: Restaurant): Promise<MenuCategory[]> {
    const menu_categories: MenuCategory[] = await this.menu_category_repo.find({ where: { restaurant } });
    const result: MenuCategory[] = new Array<MenuCategory>();
    for (let value of menu_categories) {
      result.push(new MenuCategory(value));
    }
    return result;
  }

  public async update_menu_category(id: number, payload): Promise<void> {
    await this.menu_category_repo.update(id, payload);
  }

  public async delete_menu_category(id: number): Promise<void> {
    await this.menu_category_repo.delete(id);
  }



  public async insert_menu(menu: Menu | Menu[]) {
    await this.menu_repo.insert(menu);
  }

  public async find_menu_by_id(id: number): Promise<Menu> {
    return new Menu(await this.menu_repo.findOne(id));
  }

  public async find_menu_by_name(name: string): Promise<Menu> {
    return new Menu(await this.menu_repo.findOne({ name }));
  }

  public async update_menu(id: number, payload): Promise<void> {
    await this.menu_repo.update(id, payload);
  }

  public async delete_menu(id: number): Promise<void> {
    await this.menu_repo.delete(id);
  }



  public async insert_group(group: Group | Group[]) {
    await this.group_repo.insert(group);
  }

  public async find_group_by_id(id: number): Promise<Group> {
    return new Group(await this.group_repo.findOne(id));
  }

  public async find_group_by_name(name: string): Promise<Group> {
    return new Group(await this.group_repo.findOne({ name }));
  }

  public async update_group(id: number, payload): Promise<void> {
    await this.group_repo.update(id, payload);
  }

  public async delete_group(id: number): Promise<void> {
    await this.group_repo.delete(id);
  }



  public async insert_option(option: Option | Option[]) {
    await this.option_repo.insert(option);
  }

  public async find_option_by_id(id: number): Promise<Option> {
    return new Option(await this.option_repo.findOne(id));
  }

  public async find_option_by_name(name: string): Promise<Option> {
    return new Option(await this.option_repo.findOne({ name }));
  }

  public async update_option(id: number, payload): Promise<void> {
    await this.option_repo.update(id, payload);
  }

  public async delete_option(id: number): Promise<void> {
    await this.option_repo.delete(id);
  }
}
