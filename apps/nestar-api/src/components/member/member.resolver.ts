import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MemberService } from './member.service';
import { InternalServerErrorException } from '@nestjs/common';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { Member } from '../../libs/dto/member/member';
<<<<<<< HEAD
=======
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import * as mongoose from 'mongoose';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberUpdate } from '../../libs/dto/member/member.update';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';
>>>>>>> 9cd7b3f (fix: modify view module to record visits)

@Resolver()
export class MemberResolver {
	constructor(private readonly memberService: MemberService) {}

	@Mutation(() => Member)
	public async signup(@Args('input') input: MemberInput): Promise<Member> {
			console.log('Mutation: signup');
			// console.log('input: ', input);
			return this.memberService.signup(input);
	}

	@Mutation(() => Member)
	public async login(@Args('input') input: LoginInput): Promise<Member> {
		console.log('Mutation: login');
		return this.memberService.login(input);
	}

	@Mutation(() => String)
	public async updateMember(): Promise<string> {
		try {
			console.log('Mutation: updateMember');
			return this.memberService.updateMember();
		} catch (err) {
			console.log('Error, login: ', err);
			throw new InternalServerErrorException();
		}
	}

	@Query(() => String)
<<<<<<< HEAD
	public async getMember(): Promise<string> {
		console.log('Mutation: getMember');
		return this.memberService.getMember();
=======
	public async checkAuthRoles(@AuthMember() authMember: Member): Promise<string> {
		console.log('Query: checkAuthRoles');

		return `hi ${authMember.memberNick}, you are ${authMember.memberType} (memberId: ${authMember._id})`;
	}

	// Authenticated
	@UseGuards(AuthGuard)
	@Mutation(() => Member)
	public async updateMember(
		@Args('input') input: MemberUpdate,
		@AuthMember('_id') memberId: mongoose.Types.ObjectId,
	): Promise<Member> {
		console.log('=== UPDATE MEMBER RESOLVER ===');
		console.log('INPUT:', input);
		console.log('Mutation: updateMember');
		console.log('memberId: ', memberId);
		delete input._id;
		return this.memberService.updateMember(memberId, input);
	}

	@UseGuards(WithoutGuard)
	@Query(() => Member)
	public async getMember(
		@Args('memberId') input: string,
		@AuthMember('_id') memberId: mongoose.Types.ObjectId,
	): Promise<Member> {
		console.log('Query: getMember');
		const targetId = shapeIntoMongoObjectId(input);
		// console.log('memberId: ', memberId);

		return this.memberService.getMember(memberId, targetId);
	}

	/** ADMIN **/

	// Authorization: ADMIN
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => String)
	public async getAllMembersByAdmin(@AuthMember() authMember: Member): Promise<string> {
		console.log('authMember.memberTypr: ', authMember.memberType);

		return this.memberService.getAllMembersByAdmin();
	}

	// Authorization: ADMIN
	@Mutation(() => String)
	public async updateMemberByAdmin(): Promise<string> {
		console.log('Mutation: updateMemberByAdmin');
		return this.memberService.updateMemberByAdmin();
>>>>>>> 9cd7b3f (fix: modify view module to record visits)
	}
}
