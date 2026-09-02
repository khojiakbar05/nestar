import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { BoardArticleService } from './board-article.service';
import { UseGuards } from '@nestjs/common';
import { BoardArticle } from '../../libs/dto/board-article/board-article';
import { AuthGuard } from '../auth/guards/auth.guard';
import { BoardArticleInput } from '../../libs/dto/board-article/board-article.input';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import mongoose from 'mongoose';
import { WithoutGuard } from '../auth/guards/without.guard';
import { BoardArticleUpdate } from '../../libs/dto/board-article/board-article.update';
import { shapeIntoMongoObjectId } from '../../libs/config';

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

    @UseGuards(WithoutGuard)
    @Query((returns) => BoardArticle)
    public async getBoardArticle(
        @Args('articleId') input: string,
        @AuthMember('_id') memberId: mongoose.Types.ObjectId,
    ): Promise<BoardArticle> { 
        console.log("Query: getBoardArticle");
        const articleId = new mongoose.Types.ObjectId(input);
        return await this.boardArticleService.getBoardArticle(memberId, articleId);
    }

    // @UseGuards(AuthGuard)
    // @Mutation((returns) => BoardArticle)
    // public async updateBoardArticle(
    //     @Args('input') input: BoardArticleUpdate,
    //     @AuthMember('_id') memberId: mongoose.Types.ObjectId,
    // ): Promise<BoardArticle> { 
    //     console.log("Mutation: updateBoardArticle");
    //     input._id = shapeIntoMongoObjectId(input._id);
    //     return await this.boardArticleService.updateBoardArticle(memberId, input);
    // }



}


