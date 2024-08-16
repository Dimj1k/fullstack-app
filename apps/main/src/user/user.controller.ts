import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    Patch,
    Req,
    UnauthorizedException,
} from '@nestjs/common'
import { UserService } from './user.service'
import { User } from '../shared/entities/user'
import { UUID } from 'crypto'
import { UpdateUserDto } from './dto'
import { ApiParam, ApiTags } from '@nestjs/swagger'
import { JwtPayload } from '../shared/interfaces'
import { UserResources } from '../shared/decorators'
import { Request } from 'express'

export type UserFromMongo = Pick<User, 'email' | 'password' | 'info'>

@ApiTags('users')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('find/:id')
    async findUser(@Param('id') id: UUID) {
        return this.userService.findUser({ id }, { relations: { books: true } })
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
    me(@Req() req: Request & { user: JwtPayload }) {
        const { email, userId, roles } = req.user
        return {
            email,
            userId,
            roles,
        }
    }

    @ApiParam({ name: 'id' })
    @Delete('/delete/:id')
    async deleteUser(@Param('id') id: UUID) {
        this.userService.deleteById(id)
    }
}
