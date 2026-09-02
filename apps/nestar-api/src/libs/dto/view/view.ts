import { Field, ObjectType } from '@nestjs/graphql';
import * as mongoose from 'mongoose';
import { ViewGroup } from '../../enums/view.enum';

@ObjectType() // backendan clientga datalani typeni yuborishda yordam beradi
export class View {
	@Field(() => String)
	_id!: mongoose.Types.ObjectId;

	@Field(() => ViewGroup)
	viewGroup!: ViewGroup;

	@Field(() => String)
	viewRefId!: mongoose.Types.ObjectId;

	@Field(() => String)
	memberId!: mongoose.Types.ObjectId;

	@Field(() => Date)
	createdAt!: Date;

	@Field(() => Date)
	updatedAt!: Date;
}
