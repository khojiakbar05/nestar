import { Injectable } from '@nestjs/common';

@Injectable()
export class MemberService {
	public async signup(): Promise<string> {
		return 'Signup executed!';
	}

	public async login(): Promise<string> {
		console.log('Mutation: login');
		return 'login executed!';
	}

	public async updateMember(): Promise<string> {
		console.log('Mutation: updateMember');
		return 'login updateMember!';
	}

	public async getMember(): Promise<string> {
		console.log('Mutation: getMember');
		return 'login getMember!';
	}
}
