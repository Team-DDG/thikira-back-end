import { Header, UtilService } from '@app/util';
import { CanActivate, ExecutionContext, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AppGuard implements CanActivate {
  @Inject()
  private readonly util: UtilService;

  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const headers: Header = new Header(context.switchToHttp().getRequest());
    if (headers.isEmpty()) {
      return true;
    }

    const token = await this.util.getTokenBody(headers.token);
    const email = await this.util.getEmailByToken(token);
    return !!(token && email);
  }
}
