import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserDocument } from '../../users/schemas/user.schema';

// Equivalent of reading req.user in an Express middleware-protected
// route, but as a typed decorator: @CurrentUser() user: UserDocument
export const CurrentUser = createParamDecorator(
  (data: keyof UserDocument | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as UserDocument;
    return data ? user?.[data] : user;
  },
);
