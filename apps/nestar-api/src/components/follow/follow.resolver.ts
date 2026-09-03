import { Resolver } from '@nestjs/graphql';
import { FollowModule } from './follow.module';
import { FollowService } from './follow.service';

@Resolver()
export class FollowResolver {
    constructor(private readonly followService: FollowService) {}
}
