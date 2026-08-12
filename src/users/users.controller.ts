import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserDocument } from './schemas/user.schema';

@Controller('users')
@UseGuards(JwtAuthGuard) // applies to every route in this controller
export class UsersController {
  // GET /api/v1/users/me
  @Get('me')
  getProfile(@CurrentUser() user: UserDocument) {
    return user;
  }
}
