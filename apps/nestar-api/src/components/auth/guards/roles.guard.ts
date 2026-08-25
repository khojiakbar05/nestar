import { BadRequestException, CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from '../auth.service';
import { Message } from '../../../libs/enums/common.enum';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(
		private reflector: Reflector,
		private authService: AuthService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		// Decorator orqali berilgan rollarni oladi
		const roles = this.reflector.get<string[]>('roles', context.getHandler());

		// Agar @Roles() yo'q bo'lsa, ruxsat beriladi
		if (!roles) return true;

		console.info(`--- @guard() Authentication [RolesGuard]: ${roles} ---`);

		let request;

		if (context.getType<'graphql'>() === 'graphql') {
			const gqlContext = GqlExecutionContext.create(context);
			request = gqlContext.getContext().req;
		} else {
			request = context.switchToHttp().getRequest();
		}

		const bearerToken = request.headers.authorization;

		if (!bearerToken) {
			throw new BadRequestException(Message.TOKEN_NOT_EXIST);
		}

		const token = bearerToken.split(' ')[1];
		const authMember = await this.authService.verifyToken(token);

		const hasPermission = roles.includes(authMember.memberType);

		if (!authMember || !hasPermission) {
			throw new ForbiddenException(Message.ONLY_SPECIFIC_ROLES_ALLOWED);
		}

		request.body.authMember = authMember;

		return true;
	}
}
