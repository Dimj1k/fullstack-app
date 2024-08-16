import { Controller, Get, Param, Post, Req } from '@nestjs/common'
import { UserBookService } from './user-book.service'
import { UserResources } from '../shared/decorators'
import { JwtPayload } from '../shared/interfaces'
import { ApiTags } from '@nestjs/swagger'

type RequestWithUser = Request & { user: JwtPayload }

@UserResources()
@ApiTags('user-book')
@Controller('user-book')
export class UserBookController {
    constructor(private readonly userBookService: UserBookService) {}

    @Get('/getOwnedBooks')
    getOwnedBooks(@Req() request: RequestWithUser) {
        const user = request.user
        return this.userBookService.getBooksUser(user.userId)
    }

    @Post('/addToYourself/:nameBook')
    addToYourself(
        @Param('nameBook') nameBook: string,
        @Req() request: RequestWithUser,
    ) {
        const user = request.user
        return this.userBookService.addToYourself(user.userId, nameBook)
    }
}
