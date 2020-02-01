import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu, MenuCategory, Option } from './entity';

@Injectable()
export class MenuService {
  constructor(@InjectRepository(Menu)
              public readonly menu_repo: Repository<Menu>,
              @InjectRepository(MenuCategory)
              public readonly menu_category_repo: Repository<MenuCategory>,
              @InjectRepository(Option)
              public readonly option_repo: Repository<Option>,
  ) {
  }

  public async find_menu_by_id(id: number): Promise<Menu> {
    return new Menu(await this.menu_repo.findOne(id));
  }

  public async find_menu_by_name(name: string): Promise<Menu> {
    return new Menu(await this.menu_repo.findOne({ name }));
  }

  public async delete_menu(id: number): Promise<void> {
    await this.menu_repo.delete(id);
  }

  public async update_menu(id: number, payload): Promise<void> {
    await this.menu_repo.update(id, payload);
  }

  public async insert_menu(menu: Menu) {
    await this.menu_repo.insert(menu);
  }

  public async find_menu_category_by_id(id: number): Promise<Menu> {
    return new Menu(await this.menu_category_repo.findOne(id));
  }

  public async find_menu_category_by_name(name: string): Promise<Menu> {
    return new Menu(await this.menu_category_repo.findOne({ name }));
  }

  public async delete_menu_category(id: number): Promise<void> {
    await this.menu_category_repo.delete(id);
  }

  public async update_menu_category(id: number, payload): Promise<void> {
    await this.menu_category_repo.update(id, payload);
  }

  public async insert_menu_category(menu_category: MenuCategory) {
    await this.menu_category_repo.insert(menu_category);
  }

  public async find_option_by_id(id: number): Promise<Menu> {
    return new Menu(await this.option_repo.findOne(id));
  }

  public async find_option_by_name(name: string): Promise<Menu> {
    return new Menu(await this.option_repo.findOne({ name }));
  }

  public async delete_option(id: number): Promise<void> {
    await this.option_repo.delete(id);
  }

  public async update_option(id: number, payload): Promise<void> {
    await this.option_repo.update(id, payload);
  }

  public async insert_option(option: Option | Option[]) {
    await this.option_repo.insert(option);
  }
}
