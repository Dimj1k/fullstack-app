import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common'
import { CreateBookDto } from './dto/create-book.dto'
import { UpdateBookDto } from './dto/update-book.dto'
import { BooksService } from './books.service'
import { Roles } from '../decorators/roles.decorator'
import { ROLE } from '../entities/user/user.entity'
import { RolesGuard } from '../guards/role.guard'
// import { JwtGuard } from '../guards/jwt.guard'

@UsePipes(new ValidationPipe())
@Controller('books')
export class BooksController {
    constructor(private readonly booksService: BooksService) {}

    @UseGuards(RolesGuard)
    @Roles([ROLE.ADMIN])
    @Post('/create')
    create(@Body() createBooksDto: CreateBookDto) {
        return this.booksService.create(createBooksDto)
    }

    @Get('/find')
    findAll() {
        return this.booksService.findAll()
    }

    @Get('/find/:id')
    findOne(@Param('id') id: string) {
        return this.booksService.findOne(+id)
    }

    @UseGuards(RolesGuard)
    @Roles([ROLE.ADMIN])
    @Patch('/update/:id')
    update(@Param('id') id: string, @Body() updateBooksDto: UpdateBookDto) {
        return this.booksService.update(+id, updateBooksDto)
    }

    @UseGuards(RolesGuard)
    @Roles([ROLE.ADMIN])
    @Delete('/delete/:id')
    remove(@Param('id') id: string) {
        return this.booksService.remove(+id)
    }
}
