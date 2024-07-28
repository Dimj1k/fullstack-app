import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Delete,
    Param,
    Patch,
    Post,
    Req,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserEntity } from './user.entity'
import { Request } from 'express'

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UsePipes(new ValidationPipe())
    @Post('/create')
    @UseInterceptors(ClassSerializerInterceptor)
    async create(@Body() createUserDto: CreateUserDto) {
        if (createUserDto.birthdayDate)
            createUserDto.birthdayDate = new Date(createUserDto.birthdayDate)
        return new UserEntity(await this.userService.create(createUserDto))
    }

    @UsePipes(new ValidationPipe())
    @Patch('/updateById/:id')
    @UseInterceptors(ClassSerializerInterceptor)
    async update(
        @Param('id') userId: string,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return new UserEntity(
            await this.userService.update(userId, updateUserDto),
        )
    }

    @Delete('/delete/:id')
    delete(@Req() req: Request) {
        return this.userService.delete(req.params['id'])
    }
}
