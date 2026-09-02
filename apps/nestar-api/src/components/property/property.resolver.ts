import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { PropertyService } from './property.service';
import { Properties, Property } from '../../libs/dto/property/property';
import { AgentsPropertiesInquiry, AllPropertiesInquiry, PropertiesInquiry, PropertyInput } from '../../libs/dto/property/property.input';
import { Roles } from '../auth/decorators/roles.decorator';
import { UseGuards } from '@nestjs/common';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import * as mongoose from 'mongoose';
import { WithoutGuard } from '../auth/guards/without.guard';
import { Query } from '@nestjs/graphql';
import { shapeIntoMongoObjectId } from '../../../src/libs/config';
import { PropertyUpdate } from '../../libs/dto/property/property.update';


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
 
	 @Roles(MemberType.AGENT)
	 @UseGuards(RolesGuard)
	 @Mutation((returns) => Property)
	 public async updateProperty(
		@Args('input') input: PropertyUpdate,
		@AuthMember('_id') memberId: mongoose.ObjectId, 
	 ): Promise<Property> {
		console.log("Mutation: updateProperty");
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.propertyService.updateProperty(memberId as unknown as mongoose.Types.ObjectId, input);
	 }


	 @UseGuards(WithoutGuard)
	 @Query((returns) => Properties)
	 public async getProperties(
		@Args('input') input: PropertiesInquiry,
		@AuthMember('_id') memberId: mongoose.ObjectId,    
	 ): Promise<Properties> {
		console.log("Query: getProperties");
		return await this.propertyService.getProperties(memberId as unknown as mongoose.Types.ObjectId, input);
	 }
	 
	 @Roles(MemberType.AGENT)
	 @UseGuards(RolesGuard)
	 @Query((returns) => Properties)
	 public async getAgentsProperies(
		@Args('input') input: AgentsPropertiesInquiry,
		@AuthMember('_id') memberId: mongoose.ObjectId, 
	 ): Promise<Properties> {		
		console.log("Query: getAgentsProperies");
		return await this.propertyService.getAgentsProperties(memberId as unknown as mongoose.Types.ObjectId, input);
	 }

 

	 /** ADMIN **/

	 @Roles(MemberType.ADMIN)
	 @UseGuards(RolesGuard)
	 @Query((returns) => Properties)
	 public async getAllPropertiesByAdmin(
		@Args('input') input: AllPropertiesInquiry,
		@AuthMember('_id') memberId: mongoose.ObjectId, 
	 ): Promise<Properties> {		
		console.log("Query: getAllPropertiesByAdmin");
		return await this.propertyService.getAllPropertiesByAdmin(input);
	 } 

	 @Roles(MemberType.ADMIN)
	 @UseGuards(RolesGuard)
	 @Mutation((returns) => Property)
	 public async updatePropertyByAdmin(
		@Args('input') input: PropertyUpdate,
	 ): Promise<Property> {		
		console.log("Mutation: updatePropertyByAdmin");
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.propertyService.updatePropertyByAdmin(input);
	 } 

	//  @Roles(MemberType.ADMIN)
	//  @UseGuards(RolesGuard)
	//  @Mutation((returns) => Property)
	//  public async removePropertyByAdmin(
	// 	@Args('input') input: string,
	//  ): Promise<Property> {		
	// 	console.log("Mutation: removePropertyByAdmin");
	// 	const propertyId = shapeIntoMongoObjectId(input);
	// 	return await this.propertyService.removePropertyByAdmin(propertyId);
	//  } 


}
