import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Req,
} from '@nestjs/common'
import { UserService } from './user.service'
import { User } from '../entities/user'
import { UUID } from 'crypto'
import { UpdateUserDto } from './dto'
import { ApiParam, ApiTags } from '@nestjs/swagger'
import { JwtPayload } from '../interfaces'
import { UserResources } from '../decorators'

export type UserFromMongo = Pick<User, 'email' | 'password' | 'info'>

@ApiTags('users')
@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('find/:id')
    async findUser(@Param('id') id: string) {
        return this.userService.findUser({ id }, { relations: { books: true } })
    }

    @ApiParam({ name: 'id' })
    @Patch('/update/:id')
    async updateUser(
        @Param('id') id: UUID,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return this.userService.updateUser(id, updateUserDto)
    }

    @UserResources()
    @Get('/me')
    me(@Req() req: Request & { user: JwtPayload }) {
        let user = req.user
        return {
            email: user.email,
            userId: user.userId,
            roles: user.roles,
        }
    }

    @ApiParam({ name: 'id' })
    @Delete('/delete/:id')
    async deleteUser(@Param('id') id: UUID) {
        this.userService.deleteById(id)
    }
}
