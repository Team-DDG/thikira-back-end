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

  public async find_user_by_email(email: string) {
    return new User(await this.user_repo.findOne({ email }));
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

  public async find_menu_category_by_name(name: string, restaurant: Restaurant): Promise<MenuCategory> {
    return new MenuCategory(await this.menu_category_repo.findOne({ name, restaurant }));
  }

  public async find_menu_categories_by_restaurant(restaurant: Restaurant): Promise<MenuCategory[]> {
    const menu_categories: MenuCategory[] = await this.menu_category_repo.find({ where: { restaurant } });
    const result: MenuCategory[] = new Array<MenuCategory>();
    for (let value of menu_categories) {
      result.push(new MenuCategory(value));
    }
    return result;
  }

  public async update_menu_category(menu_category: MenuCategory): Promise<void> {
    await this.menu_category_repo.update(menu_category.id, menu_category);
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

  public async find_menu_by_name(name: string, menu_category): Promise<Menu> {
    return new Menu(await this.menu_repo.findOne({ name, menu_category }));
  }

  public async find_menus_by_menu_category(menu_category: MenuCategory): Promise<Menu[]> {
    const menus: Menu[] = await this.menu_repo.find({ menu_category });
    const result: Menu[] = new Array<Menu>();
    for (let value of menus) {
      result.push(new Menu({ ...value, group: new Array<Group>() }));
    }
    return result;
  }

  public async update_menu(menu: Menu): Promise<void> {
    await this.menu_repo.update(menu.id, menu);
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

  public async find_group_by_name(name: string, menu: Menu): Promise<Group> {
    return new Group(await this.group_repo.findOne({ name, menu }));
  }

  public async find_groups_by_menu(menu: Menu): Promise<Group[]> {
    const groups: Group[] = await this.group_repo.find({ where: { menu } });
    const result: Group[] = new Array<Group>();
    for (let value of groups) {
      result.push(new Group({ ...value, option: new Array<Option>() }));
    }
    return result;
  }

  public async update_group(group: Group): Promise<void> {
    await this.group_repo.update(group.id, group);
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

  public async find_option_by_name(name: string, group: Group): Promise<Option> {
    return new Option(await this.option_repo.findOne({ name, group }));
  }

  public async find_options_by_group(group: Group): Promise<Option[]> {
    const options: Option[] = await this.option_repo.find({ where: { group } });
    const result: Option[] = new Array<Option>();
    for (let value of options) {
      result.push(new Option(value));
    }
    return result;
  }

  public async update_option(option: Option): Promise<void> {
    await this.option_repo.update(option.id, option);
  }

  public async delete_option(id: number): Promise<void> {
    await this.option_repo.delete(id);
  }
}