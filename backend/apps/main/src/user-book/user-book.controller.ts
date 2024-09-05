import {
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Req,
} from '@nestjs/common'
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

    @Get('/get-owned-books')
    getOwnedBooks(@Req() { user: { userId } }: RequestWithUser) {
        return this.userBookService.getBooksUser(userId)
    }

    @HttpCode(HttpStatus.OK)
    @Post('/add-to-yourself/:nameBook')
    addToYourself(
        @Param('nameBook') nameBook: string,
        @Req() { user: { userId } }: RequestWithUser,
    ) {
        return this.userBookService.addToYourself(userId, nameBook)
    }
}
