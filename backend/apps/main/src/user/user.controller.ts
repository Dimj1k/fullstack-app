import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    NotFoundException,
    Param,
    Patch,
    Post,
    Query,
    Redirect,
    Req,
    Res,
    UnauthorizedException,
    UseFilters,
    UseInterceptors,
} from '@nestjs/common'
import { UserService } from './user.service'
import { User } from '../shared/entities/user'
import { UUID } from 'crypto'
import { UpdateUserDto } from './dto'
import { ApiParam, ApiTags } from '@nestjs/swagger'
import { JwtPayload } from '../shared/interfaces'
import { UserResources } from '../shared/decorators'
import { Request } from 'express'
import { OnlyHttpExceptionFilter, RpcExceptionFilter } from '../shared/filters'
import { UuidPipe } from '../shared/pipes'
import { isEmail } from 'class-validator'

export type UserFromMongo = Pick<User, 'email' | 'password' | 'info'>

@UseFilters(RpcExceptionFilter, OnlyHttpExceptionFilter)
@ApiTags('users')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('find-all')
    async findAllUsers(
        @Query() { skip, take }: { skip: number; take: number },
    ) {
        return this.userService.findAllUsers(skip, take)
    }

    @ApiParam({ name: 'id' })
    @Get('find/:id')
    async findUser(@Param('id', UuidPipe) id: UUID) {
        return this.userService.findUser(
            { id },
            { relations: { books: true, info: true } },
        )
    }

    @ApiParam({ name: 'email' })
    @Get('find-by-email/:email')
    async findUserByEmail(@Param('email') email: string) {
        if (!isEmail(email)) throw new NotFoundException('Не email')
        return this.userService.findUser(
            { email },
            { relations: { books: true } },
        )
    }

    @UserResources()
    @Patch('/update')
    async updateUser(
        @Req() req: Request & { user: JwtPayload },
        @Body() updateUserDto: UpdateUserDto,
    ) {
        let user = req.user
        return this.userService.updateUser(user, updateUserDto)
    }

    @UserResources()
    @Get('/me')
    me(@Req() { user }: Request & { user: JwtPayload }) {
        return user
    }

    @ApiParam({ name: 'id' })
    @Delete('/delete/:id')
    async deleteUser(@Param('id') id: UUID) {
        this.userService.deleteById(id)
    }
}
