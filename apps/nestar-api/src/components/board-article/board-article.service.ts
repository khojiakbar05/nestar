import { Injectable } from '@nestjs/common';
import { Property } from '../../libs/dto/property/property';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { BoardArticle } from '../../libs/dto/board-article/board-article';

@Injectable()
export class BoardArticleService {
    constructor(@InjectModel('BoardArticle') private readonly boardArticleModel: Model<BoardArticle>) {}
}
