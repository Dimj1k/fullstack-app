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
import { JwtGuard } from '../guards/jwt.guard'

@UsePipes(new ValidationPipe())
@Controller('books')
export class BooksController {
    constructor(private readonly bookswService: BooksService) {}

    @UseGuards(JwtGuard, RolesGuard)
    @Roles([ROLE.ADMIN])
    @Post('/create')
    create(@Body() createBooksDto: CreateBookDto) {
        return this.bookswService.create(createBooksDto)
    }

    @Get('/find')
    findAll() {
        return this.bookswService.findAll()
    }

    @Get('/find/:id')
    findOne(@Param('id') id: string) {
        return this.bookswService.findOne(+id)
    }

    @Roles([ROLE.ADMIN])
    @Patch('/update/:id')
    update(@Param('id') id: string, @Body() updateBooksDto: UpdateBookDto) {
        return this.bookswService.update(+id, updateBooksDto)
    }

    @Roles([ROLE.ADMIN])
    @Delete('/delete/:id')
    remove(@Param('id') id: string) {
        return this.bookswService.remove(+id)
    }
}
