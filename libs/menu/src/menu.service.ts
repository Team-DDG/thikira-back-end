import { UtilService } from '@app/util';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu, MenuCategory, Option } from './entity';

@Injectable()
export class MenuService {
  constructor(@InjectRepository(Menu)
              private readonly menus: Repository<Menu>,
              @InjectRepository(MenuCategory)
              private readonly menu_categories: Repository<MenuCategory>,
              @InjectRepository(Option)
              private readonly options: Repository<Option>,
              private readonly util: UtilService,
  ) {
  }

  private async find_menu_by_id(id: number): Promise<Menu> {
    return new Menu(await this.menus.findOne(id));
  }

  private async find_menu_by_name(name: string): Promise<Menu> {
    return new Menu(await this.menus.findOne({ name }));
  }

  private async delete_menu(id: number): Promise<void> {
    await this.menus.delete(id);
  }

  private async update_menu(id: number, payload): Promise<void> {
    if (payload.password) {
      payload.password = await this.util.encode(payload.password);
    }
    await this.menus.update(id, payload);
  }

  private async insert_menu(menu: Menu) {
    await this.menus.insert(menu);
  }

  private async find_menu_category_by_id(id: number): Promise<Menu> {
    return new Menu(await this.menu_categories.findOne(id));
  }

  private async find_menu_category_by_name(name: string): Promise<Menu> {
    return new Menu(await this.menu_categories.findOne({ name }));
  }

  private async delete_menu_category(id: number): Promise<void> {
    await this.menu_categories.delete(id);
  }

  private async update_menu_category(id: number, payload): Promise<void> {
    if (payload.password) {
      payload.password = await this.util.encode(payload.password);
    }
    await this.menu_categories.update(id, payload);
  }

  private async insert_menu_category(menu_category: Menu) {
    await this.menu_categories.insert(menu_category);
  }

  private async find_option_by_id(id: number): Promise<Menu> {
    return new Menu(await this.options.findOne(id));
  }

  private async find_option_by_name(name: string): Promise<Menu> {
    return new Menu(await this.options.findOne({ name }));
  }

  private async delete_option(id: number): Promise<void> {
    await this.options.delete(id);
  }

  private async update_option(id: number, payload): Promise<void> {
    if (payload.password) {
      payload.password = await this.util.encode(payload.password);
    }
    await this.options.update(id, payload);
  }

  private async insert_option(option: Menu) {
    await this.options.insert(option);
  }
}
