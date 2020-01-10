import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@Controller('api/user')
@ApiTags('User')
export class UserController {
}
