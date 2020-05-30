import { Coupon } from './coupon.entity';
import { Group } from './group.entity';
import { MenuCategory } from './menu-category.entity';
import { Menu } from './menu.entity';
import { Option } from './option.entity';
import { Order } from './order.entity';
import { ReplyReview } from './relpy-review.entity';
import { Restaurant } from './restaurant.entity';
import { Review } from './review.entity';
import { User } from './user.entity';

export const mongodbEntities: Function[] = [Order];

export const mysqlEntities: Function[] = [
  Coupon, Group, Menu, MenuCategory, Option, ReplyReview, Restaurant, Review, User,
];
