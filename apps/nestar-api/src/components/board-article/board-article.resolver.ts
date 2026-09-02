import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { BoardArticleService } from './board-article.service';
import { UseGuards } from '@nestjs/common';
import { BoardArticle } from '../../libs/dto/board-article/board-article';
import { AuthGuard } from '../auth/guards/auth.guard';
import { BoardArticleInput } from '../../libs/dto/board-article/board-article.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import mongoose from 'mongoose';

@Resolver()
export class BoardArticleResolver {
    constructor(private readonly boardArticleService: BoardArticleService) {}

    @UseGuards(AuthGuard)
    @Mutation((returns) => BoardArticle)
    public async createBoardArticle(
        @Args('input') input: BoardArticleInput,
        @AuthMember('_id') memberId: mongoose.Types.ObjectId,
    ): Promise<BoardArticle> { 
        console.log("Mutation: createBoardArticle");
        return await this.boardArticleService.createBoardArticle(memberId, input);
    }


}
