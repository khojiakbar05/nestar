import { BadRequestException, Injectable } from '@nestjs/common';
import mongoose, { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BoardArticle } from '../../libs/dto/board-article/board-article';
import { ViewService } from '../view/view.service';
import { MemberService } from '../member/member.service';
import { BoardArticleInput } from '../../libs/dto/board-article/board-article.input';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class BoardArticleService {
    constructor(@InjectModel('BoardArticle') private readonly boardArticleModel: Model<BoardArticle>,
    private readonly memberService: MemberService,
    private readonly viewService: ViewService
) {}

public async createBoardArticle(memberId: mongoose.Types.ObjectId, input: BoardArticleInput): Promise<BoardArticle> {
    input.memberId = memberId;
    try {
        const result = await this.boardArticleModel.create(input);
        await this.memberService.memberStatsEditor({ 
            _id: memberId, 
            targetKey: 'memberBoardArticles', 
            modifier: 1 
        });

        return result;
    } catch (err: any) {
        console.log('Error, Service.model:', err?.message ?? err);
        throw new BadRequestException(Message.CREATE_FAILED);
    }
}



}
