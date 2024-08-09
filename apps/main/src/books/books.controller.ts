import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common'
import { CreateBookDto } from './dto/create-book.dto'
import { UpdateBookDto } from './dto/update-book.dto'
import { BooksService } from './books.service'
import { Roles } from '../decorators/roles.decorator'
import { ROLE } from '../entities/user/user.entity'
import { RolesGuard } from '../guards/role.guard'
import { JwtGuard } from '../guards/jwt.guard'
import { Request } from 'express'
import { JwtPayload } from '../interfaces/jwt-controller.interface'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Beetween } from '../pipes/beetween.pipe'

type RequestWithUser = Request & { user: JwtPayload }

@ApiTags('books')
@Controller('books')
export class BooksController {
    constructor(private readonly booksService: BooksService) {}

    @ApiBearerAuth()
    @UseGuards(RolesGuard)
    @Roles([ROLE.ADMIN])
    @Post('/create')
    create(@Body() createBookDto: CreateBookDto) {
        return this.booksService.create(createBookDto)
    }

    @Get('/findAll')
    findAll(
        @Query('skip', Beetween(0)) skip: number,
        @Query('take', Beetween(0, 500)) take: number,
    ) {
        return this.booksService.findAll(skip, take)
    }

    @Get('/find/:nameBook')
    findOne(@Param('nameBook') nameBook: string) {
        return this.booksService.findOne(nameBook)
    }

    @ApiBearerAuth()
    @UseGuards(JwtGuard)
    @Get('/getOwnedBooks')
    getOwnedBooks(@Req() request: RequestWithUser) {
        let user = request.user
        return this.booksService.getBooksUser(user.userId)
    }

    @ApiBearerAuth()
    @UseGuards(JwtGuard)
    @Post('/addToYourself/:nameBook')
    addToYourself(
        @Param('nameBook') nameBook: string,
        @Req() request: RequestWithUser,
    ) {
        let user = request.user
        return this.booksService.addToYourself(user.userId, nameBook)
    }

    @ApiBearerAuth()
    @UseGuards(RolesGuard)
    @Roles([ROLE.ADMIN])
    @Patch('/update/:id')
    update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
        return this.booksService.update(id, updateBookDto)
    }

    @ApiBearerAuth()
    @UseGuards(RolesGuard)
    @Roles([ROLE.ADMIN])
    @Delete('/delete/:nameBook')
    remove(@Param('nameBook') nameBook: string) {
        return this.booksService.remove(nameBook)
    }
}
