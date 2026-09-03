import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { AgentsPropertiesInquiry, AllPropertiesInquiry, PropertiesInquiry, PropertyInput } from '../../libs/dto/property/property.input';
import { lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { Properties, Property } from '../../libs/dto/property/property';
import { StatisticModifier, T } from '../../libs/types/common';
import { Direction, Message } from '../../libs/enums/common.enum';
import { PropertyStatus } from '../../libs/enums/property.enum';
import { PropertyUpdate } from '../../libs/dto/property/property.update';
import { MemberService } from '../member/member.service';
import { Model, Types } from 'mongoose';
import { ViewService } from '../view/view.service';
import { InjectModel } from '@nestjs/mongoose';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewInput } from '../../libs/dto/view/view.input';
import { LikeService } from '../like/like.service';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import moment from 'moment';

@Injectable()
export class PropertyService {
	constructor(
		@InjectModel('Property') private readonly PropertyModel: Model<Property>,
		private memberService: MemberService,
		private viewService: ViewService,
		private likeService: LikeService,
	) {}

	public async createProperty(input: PropertyInput): Promise<Property> {
		try {
			const result = await this.PropertyModel.create(input);
			// increase memberProperties +1
			await this.memberService.memberStatsEditor({ _id: result.memberId, targetKey: 'memberProperties', modifier: 1 });

			return result;
		} catch (err: any) {
			console.log('Error, Service.model: ', err.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async getProperty(memberId: Types.ObjectId, propertyId: Types.ObjectId): Promise<Property> {
		const search: T = {
				_id: propertyId,
				propertyStatus: PropertyStatus.ACTIVE,
		};

		const targetProperty = await this.PropertyModel.findOne(search).lean<Property>().exec();
		if (!targetProperty) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		if (memberId) {
			const viewInput: ViewInput = { memberId: memberId, viewRefId: propertyId, viewGroup: ViewGroup.PROPERTY };
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.propertyStatsEditor({ _id: propertyId, targetKey: 'propertyViews', modifier: 1 });
				targetProperty.propertyViews++;
			}

			//meLiked
		}

		targetProperty.memberData = await this.memberService.getMember(null, targetProperty.memberId);
		return targetProperty; 
	}

	public async propertyStatsEditor(input: StatisticModifier): Promise<Property | null> {
		const { _id, targetKey, modifier } = input;
		return await this.PropertyModel
			.findOneAndUpdate({ _id }, { $inc: { [targetKey]: modifier } }, { new: true })
			.exec();
	} 

	public async updateProperty(memberId: Types.ObjectId, input: PropertyUpdate): Promise<Property> {
		let { propertyStatus, soldAt, deletedAt } = input;
		const search: T = { 
			_id: input._id, 
			memberId: memberId,
			propertyStatus: PropertyStatus.ACTIVE, 
		};

		if (propertyStatus === PropertyStatus.SOLD) soldAt = moment().toDate();
		else if (propertyStatus === PropertyStatus.DELETE) deletedAt = moment().toDate();	

		const result = await this.PropertyModel
		.findOneAndUpdate(search, input, {
			new: true,
		})  
		.exec();
		if(!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (soldAt || deletedAt) {
			await this.memberService.memberStatsEditor({ 
				_id: memberId, 
				targetKey: 'memberProperties', 
				modifier: -1 
			});
		}
		return result;
	}



	public async getProperties(memberId: Types.ObjectId, input: PropertiesInquiry): Promise<Properties> {
		const match: T = {propertyStatus: PropertyStatus.ACTIVE};
		const sort: T = {[input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC};

		this.shapeMatchQuery(match, input);
		console.log('match: ', match);

		const result = await this.PropertyModel
		.aggregate([
			{$match: match},
			{$sort: sort},
			{
				$facet: {
					list: [
						{$skip: (input.page -1) * input.limit},
					    {$limit: input.limit},
						// meLiked
						lookupMember,
						{ $unwind: "$memberData" },
					],
					metaCounter: [{$count: 'total'}],
				},
			},
		])
		.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0]
	}

	private shapeMatchQuery(match: T, input: PropertiesInquiry): void {
		const {
			memberId,
			locationList,
			roomsList,
			bedsList,
			typeList,
			periodsRange,
			pricesRange,
			squaresRange,
			options,
			text,
		} = input.search;
		if (memberId) match.memberId = shapeIntoMongoObjectId(memberId);
		if (locationList) match.propertyLocation = {$in: locationList};
		if (roomsList) match.propertyRooms = {$in: roomsList};
		if (bedsList) match.propertyBeds = {$in: bedsList};
		if (typeList) match.propertyType = {$in: typeList};

		if (pricesRange) match.propertyPrice = {$gte: pricesRange.start, $lte: pricesRange.end};
		if (periodsRange) match.createdAt = {$gte: periodsRange.start, $lte: periodsRange.end};
		if (squaresRange) match.propertySquare = {$gte: squaresRange.start, $lte: squaresRange.end};

		if (text) match.propertyTitle = { $regex: new RegExp(text, 'i') };
		if (options) {
			match['$or'] = options.map((ele) => {
				return { [ele]: true };
			})
		};
	}

	public async getAgentsProperties(memberId: Types.ObjectId, input: AgentsPropertiesInquiry): Promise<Properties> {
		const { propertyStatus } = input.search;
		if ( propertyStatus === PropertyStatus.DELETE) throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);

		const match: T = { 
			memberId: memberId, 
			propertyStatus: propertyStatus ?? { $ne: PropertyStatus.DELETE }, 
		};
		const sort: T = {[input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC};

		const result = await this.PropertyModel
		.aggregate([
			{$match: match},
			{$sort: sort},
			{
				$facet: {
					list: [
						{$skip: (input.page -1) * input.limit},
					    {$limit: input.limit},

						lookupMember,
						{ $unwind: "$memberData" },
					],
					metaCounter: [{$count: 'total'}],
				},
			},
		])
		.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	/** LIKE **/
	
		public async likeTargetProperty(memberId: Types.ObjectId, likeRefId: Types.ObjectId): Promise<Property> {
			const target = await this.PropertyModel.findOne({ 
				_id: likeRefId, 
				propertyStatus: PropertyStatus.ACTIVE 
			})
			.exec();
			if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
	
			const input: LikeInput = {   
				memberId: memberId,
				likeRefId: likeRefId,
				likeGroup: LikeGroup.PROPERTY,
			};
	
			// LIKE TOGGLE -1, +1  -> like bosganda 1taga kopayadi yana qayta bossa -1 ga kamayadi
			// LIKE via service module 
			const modifier: number = await this.likeService.toggleLike(input) ?? 1;
			const result = await this.propertyStatsEditor({
				_id: likeRefId,
				targetKey: 'propertyLikes',
				modifier: modifier,
			})
	
			if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
			return result;
		}
	


	public async getAllPropertiesByAdmin(input: AllPropertiesInquiry): Promise<Properties> {
		const { propertyStatus, propertyLocationList } = input.search;
		const match: T = {};
		const sort: T = {[input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC};

		if (propertyStatus) match.propertyStatus = propertyStatus;
		if (propertyLocationList) match.propertyLocation = {$in: propertyLocationList};

		const result = await this.PropertyModel
		.aggregate([
			{$match: match},
			{$sort: sort},
			{
				$facet: {
					list: [
						{$skip: (input.page -1) * input.limit},
					    {$limit: input.limit},

						lookupMember,
						{ $unwind: "$memberData" },
					],
					metaCounter: [{$count: 'total'}],
				},
			},
		])
		.exec();
		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async updatePropertyByAdmin(input: PropertyUpdate): Promise<Property> {
		let { propertyStatus, soldAt, deletedAt } = input;
		const search: T = { 
			_id: input._id,
			propertyStatus: PropertyStatus.ACTIVE, 
		};

		if (propertyStatus === PropertyStatus.SOLD) soldAt = moment().toDate();
		else if (propertyStatus === PropertyStatus.DELETE) deletedAt = moment().toDate();

		const result = await this.PropertyModel
		.findOneAndUpdate(search, input, { 
			new: true
		})
 		.exec();

		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (soldAt || deletedAt) {
			await this.memberService.memberStatsEditor({ 
				_id: result.memberId, 
				targetKey: 'memberProperties', 
				modifier: -1 
			});
		}

		return result;
	}

	public async removePropertyByAdmin(propertyId: Types.ObjectId): Promise<Property> {
		const search: T = { _id: propertyId, propertyStatus: PropertyStatus.DELETE };
		const result = await this.PropertyModel.findOneAndUpdate(search).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

		return result;
	}



}
