import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';
import { Header, UtilService } from '@app/util';

@Injectable()
export class AppGuard implements CanActivate {
  @Inject()
  private readonly util: UtilService;

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const headers: Header = new Header(context.switchToHttp().getRequest());
    if (headers.isEmpty()) {
      return true;
    }

    const token = await this.util.get_token_body(headers.token);
    const email = await this.util.get_email_by_token(token);
    return !!(token && email);
  }
}
