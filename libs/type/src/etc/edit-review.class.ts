import { ReplyReview } from '@app/entity';

export class EditReviewClass {
  public content?: string;
  public edit_time?: Date;
  public image?: string;
  public is_edited?: boolean;
  public star?: number;
  public reply_review?: ReplyReview;
}
