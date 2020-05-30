import { ReplyReview } from '@app/entity';

export class EditReviewClass {
  public content?: string;
  public editTime?: Date;
  public image?: string;
  public isEdited?: boolean;
  public star?: number;
  public replyReview?: ReplyReview;
}
