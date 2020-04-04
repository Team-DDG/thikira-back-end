import { Coupon } from './coupon.entity';
import { Group } from './group.entity';
import { Menu } from './menu.entity';
import { MenuCategory } from './menu-category.entity';
import { Option } from './option.entity';
import { Order } from './order.entity';
import { ReplyReview } from './relpy-review.entity';
import { Restaurant } from './restaurant.entity';
import { Review } from './review.entity';
import { User } from './user.entity';

export const mongodb_entities: Function[] = [Order];

export const mysql_entities: Function[] = [
  Coupon, Group, Menu, MenuCategory, Option, ReplyReview, Restaurant, Review, User,
];
