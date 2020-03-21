import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { UtilService } from '@app/util';

@Injectable()
export class AppGuard implements CanActivate {
  @Inject()
  private readonly util: UtilService;

  public canActivate(context: ExecutionContext): boolean {
    const token: string = this.util.get_token_body(context.switchToHttp().getRequest());
    if (!token) {
      return true;
    }
    const email: string = this.util.get_email_by_token(token);
    return 0 < email.length;
  }
}
