import { Resolver } from '@nestjs/graphql';
import { MemberService } from '../member/member.service';
import { PropertyService } from './property.service';

@Resolver()
export class PropertyResolver {
     constructor(private readonly memberService: PropertyService) {}
}
