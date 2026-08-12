import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Same idea as an Express `verifyToken` middleware, but declared once
// and applied per-route/controller with @UseGuards(JwtAuthGuard).
// It delegates to the 'jwt' Passport strategy registered in JwtStrategy.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
