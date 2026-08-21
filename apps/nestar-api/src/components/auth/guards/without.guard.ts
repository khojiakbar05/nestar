import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthService } from '../auth.service';

@Injectable()
export class WithoutGuard implements CanActivate {
	constructor(private authService: AuthService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		console.info('--- @guard() Authentication [WithoutGuard] ---');

		let request;

		if (context.getType<'graphql'>() === 'graphql') {
			const gqlContext = GqlExecutionContext.create(context);
			request = gqlContext.getContext().req;
		} else {
			request = context.switchToHttp().getRequest();
		}

		const bearerToken = request.headers.authorization;

		if (bearerToken) {
			try {
				const token = bearerToken.split(' ')[1];
				const authMember = await this.authService.verifyToken(token);
				request.body.authMember = authMember;
			} catch {
				request.body.authMember = null;
			}
		} else {
			request.body.authMember = null;
		}

		console.log('memberNick[without] =>', request.body.authMember?.memberNick ?? 'none');
		
		// description => http, rpc, gprs and etc are ignored

		return true;
	}
}

