import { UtilService } from '@app/util';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group, Menu, MenuCategory, Option } from './entity';

@Injectable()
export class MenuService {
  constructor(@InjectRepository(Menu)
              private readonly menu_repo: Repository<Menu>,
              @InjectRepository(MenuCategory)
              private readonly menu_category_repo: Repository<MenuCategory>,
              @InjectRepository(Option)
              private readonly option_repo: Repository<Option>,
              @InjectRepository(Group)
              private readonly group_repo: Repository<Group>,
              private readonly util: UtilService,
  ) {
  }

  private async find_menu_category_by_id(id: number): Promise<Menu> {
    return new Menu(await this.menu_category_repo.findOne(id));
  }

  private async find_menu_category_by_name(name: string): Promise<Menu> {
    return new Menu(await this.menu_category_repo.findOne({ name }));
  }

  private async delete_menu_category(id: number): Promise<void> {
    await this.menu_category_repo.delete(id);
  }

  private async update_menu_category(id: number, payload): Promise<void> {
    await this.menu_category_repo.update(id, payload);
  }

  private async insert_menu_category(menu_category: MenuCategory) {
    await this.menu_category_repo.insert(menu_category);
  }

  private async find_menu_by_id(id: number): Promise<Menu> {
    return new Menu(await this.menu_repo.findOne(id));
  }

  private async find_menu_by_name(name: string): Promise<Menu> {
    return new Menu(await this.menu_repo.findOne({ name }));
  }

  private async delete_menu(id: number): Promise<void> {
    await this.menu_repo.delete(id);
  }

  private async update_menu(id: number, payload): Promise<void> {
    await this.menu_repo.update(id, payload);
  }

  private async insert_menu(menu: Menu) {
    await this.menu_repo.insert(menu);
  }

  private async find_group_by_id(id: number): Promise<Menu> {
    return new Menu(await this.group_repo.findOne(id));
  }

  private async find_group_by_name(name: string): Promise<Menu> {
    return new Menu(await this.group_repo.findOne({ name }));
  }

  private async delete_group(id: number): Promise<void> {
    await this.group_repo.delete(id);
  }

  private async update_group(id: number, payload): Promise<void> {
    await this.group_repo.update(id, payload);
  }

  private async insert_group(group: Menu) {
    await this.group_repo.insert(group);
  }

  private async find_option_by_id(id: number): Promise<Menu> {
    return new Menu(await this.option_repo.findOne(id));
  }

  private async find_option_by_name(name: string): Promise<Menu> {
    return new Menu(await this.option_repo.findOne({ name }));
  }

  private async delete_option(id: number): Promise<void> {
    await this.option_repo.delete(id);
  }

  private async update_option(id: number, payload): Promise<void> {
    await this.option_repo.update(id, payload);
  }

  private async insert_option(option: Option | Option[]) {
    await this.option_repo.insert(option);
  }
}
