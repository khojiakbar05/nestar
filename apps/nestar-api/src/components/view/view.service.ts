import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { View } from '../../libs/dto/view/view';
import { ViewInput } from '../../libs/dto/view/view.input';
import { T } from '../../libs/types/common';
import { ViewGroup } from '../../libs/enums/view.enum';
import { OrdinaryInquiry } from '../../libs/dto/property/property.input';
import { lookupVisit } from '../../libs/config';
import { Properties } from '../../libs/dto/property/property';

@Injectable()
export class ViewService {
	constructor(@InjectModel('View') private readonly viewModel: Model<View>) {}

	public async recordView(input: ViewInput): Promise<View | null> {
          const viewExist = await this.checkViewExistance(input);
          if(!viewExist) {
               console.log("- New View Insert -");
			   
               return await this.viewModel.create(input);
          } else return null
	}

	private async checkViewExistance(input: ViewInput): Promise<View | null> {
		const { memberId, viewRefId } = input;
		const search: T = { memberId, viewRefId };
		return await this.viewModel.findOne(search).exec();
	}

	public async getVisitedProperties(memberId: Types.ObjectId, input: OrdinaryInquiry): Promise<Properties> {
		
        const { page, limit } = input;
        const match: T = {likeGroup: ViewGroup.PROPERTY, memberId: memberId};

		console.log('memberId:', memberId);
		console.log('memberId instanceof ObjectId:', memberId instanceof Types.ObjectId);
		console.log('match:', match);

        const data: T = await this.viewModel.aggregate([
            {$match: match},
            {$sort: {updatedAt: -1}},
            {
                $lookup: {
                    from: "properties",
                    localField: 'viewRefId',
                    foreignField: '_id',
                    as: 'visitedProperty',
                },
            },
            { $unwind: '$visitedProperty' },
            {
                $facet: {
                    list: [
                        {$skip: (page-1)*limit},
                        {$limit: limit},
                        lookupVisit, 
                        { $unwind: '$visitedProperty.memberData' },
                    ],
                    metaCount: [{$count: 'total'}],
                }
            }
        ])
        .exec();

        // console.log("data: ", data[0].list[0])
        console.log("data: ", data)
        const result: Properties = { list: [], metaCounter: data[0].metaCount };
        result.list = data[0].list.map((ele) => ele.visitedProperty);
       
        console.log("result: ", result);
        return result;
    }
}
