import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu, MenuCategory, Option } from './entity';

@Injectable()
export class MenuService {
  constructor(@InjectRepository(Menu)
              public readonly menus: Repository<Menu>,
              @InjectRepository(MenuCategory)
              public readonly menu_categories: Repository<MenuCategory>,
              @InjectRepository(Option)
              public readonly options: Repository<Option>,
  ) {
  }

  public async find_menu_by_id(id: number): Promise<Menu> {
    return new Menu(await this.menus.findOne(id));
  }

  public async find_menu_by_name(name: string): Promise<Menu> {
    return new Menu(await this.menus.findOne({ name }));
  }

  public async delete_menu(id: number): Promise<void> {
    await this.menus.delete(id);
  }

  public async update_menu(id: number, payload): Promise<void> {
    await this.menus.update(id, payload);
  }

  public async insert_menu(menu: Menu) {
    await this.menus.insert(menu);
  }

  public async find_menu_category_by_id(id: number): Promise<Menu> {
    return new Menu(await this.menu_categories.findOne(id));
  }

  public async find_menu_category_by_name(name: string): Promise<Menu> {
    return new Menu(await this.menu_categories.findOne({ name }));
  }

  public async delete_menu_category(id: number): Promise<void> {
    await this.menu_categories.delete(id);
  }

  public async update_menu_category(id: number, payload): Promise<void> {
    await this.menu_categories.update(id, payload);
  }

  public async insert_menu_category(menu_category: MenuCategory) {
    await this.menu_categories.insert(menu_category);
  }

  public async find_option_by_id(id: number): Promise<Menu> {
    return new Menu(await this.options.findOne(id));
  }

  public async find_option_by_name(name: string): Promise<Menu> {
    return new Menu(await this.options.findOne({ name }));
  }

  public async delete_option(id: number): Promise<void> {
    await this.options.delete(id);
  }

  public async update_option(id: number, payload): Promise<void> {
    await this.options.update(id, payload);
  }

  public async insert_option(option: Option | Option[]) {
    await this.options.insert(option);
  }
}
