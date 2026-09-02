import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { MemberService } from '../member/member.service';
import { PropertyService } from '../property/property.service';
import { BoardArticleService } from '../board-article/board-article.service';
import { Comment } from '../../libs/dto/comment/comment';
import { CommentInput } from '../../libs/dto/comment/comment.input';
import { Message } from '../../libs/enums/common.enum';
import { CommentGroup } from '../../libs/enums/comment.enum';

@Injectable()
export class CommentService {
    constructor(
        @InjectModel('Comment') private readonly commentModel: Model<Comment>,
        private readonly memberService: MemberService,
        private readonly propertyService: PropertyService,
        private readonly boardArticleService: BoardArticleService,
    ) {}

    public async createComment(memberId: mongoose.Types.ObjectId, input: CommentInput): Promise<Comment> {
        input.memberId = memberId;

        let result: Comment;

        try {
            result = await this.commentModel.create(input);
        } catch (err: any) {
            console.log("Error, Service.model: ", err.message);
            throw new BadRequestException(Message.CREATE_FAILED);
        }

        switch (input.commentGroup) {
            case CommentGroup.PROPERTY:
                await this.propertyService.propertyStatsEditor({
                        _id: input.commentRefId,
                        targetKey: 'propertyComments',
                        modifier: 1,
                });
                break;
            case CommentGroup.ARTICLE:
                await this.boardArticleService.boardArticleStatsEditor({
                        _id: input.commentRefId,
                        targetKey: 'articleComments',
                        modifier: 1,
                    });
                    break;
            case CommentGroup.MEMBER:
                await this.memberService.memberStatsEditor({
                        _id: input.commentRefId,
                        targetKey: 'memberComments',
                        modifier: 1,
                    });
                    break;
        }

        if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);
        return result;
    }
}
