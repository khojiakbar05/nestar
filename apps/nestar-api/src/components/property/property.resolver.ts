import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { MemberService } from '../member/member.service';
import { PropertyService } from './property.service';
import { Property } from '../../libs/dto/property/property';
import { PropertiesInquiry, PropertyInput } from '../../libs/dto/property/property.input';
import { Roles } from '../auth/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import * as mongoose from 'mongoose';
import { WithoutGuard } from '../auth/guards/without.guard';
// import { Properties } from '@apollo/protobufjs';
import { Properties } from '../../libs/dto/property/property';
import { Query } from '@nestjs/graphql';
import { shapeIntoMongoObjectId } from '../../../src/libs/config';


@Resolver()
export class PropertyResolver {
	constructor(private readonly propertyService: PropertyService) {}

	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation(() => Property)
	public async createProperty(
		@Args('input') input: PropertyInput,
		@AuthMember('_id') memberId: mongoose.ObjectId,
	): Promise<Property> {
		console.log("Mutation: createProperty");
          input.memberId = memberId // frontenddan kelgan memberId ni emas databasedagi memberId ga tenglayapmiz
          
          return await this.propertyService.createProperty(input);
     }


	 @UseGuards(WithoutGuard)
	 @Query((returns) => Property)
	 public async getProperty(
		@Args('propertyId') input: string,
		@AuthMember('_id') memberId: mongoose.ObjectId,
	 ): Promise<Property> {
		console.log("Query: getProperty");
		const propertyId = shapeIntoMongoObjectId(input); 
		return await this.propertyService.getProperty(memberId as unknown as mongoose.Types.ObjectId, propertyId);
	 }
 
 
}
