import {
    Body,
    Catch,
    ClassSerializerInterceptor,
    ConflictException,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { UserService } from './user.service'
import { ROLE, User } from '../entities/user/user.entity'
import { UUID } from 'crypto'
import { UpdateUserDto } from './dto/update-user.dto'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { Roles } from '../decorators/roles.decorator'
import { RolesGuard } from '../guards/role.guard'

export type UserFromMongo = Pick<User, 'email' | 'password' | 'info'>

@ApiTags('user')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get('/:id')
    async findUser(@Param('id') id: string) {
        return this.userService.findUser({ id }, { relations: { books: true } })
    }

    @ApiParam({ name: 'id' })
    @UseInterceptors(ClassSerializerInterceptor)
    @Patch('/update/:id')
    async updateUser(
        @Param('id') id: UUID,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return this.userService.updateUser(id, updateUserDto)
    }

    @ApiBearerAuth()
    @UseGuards(RolesGuard)
    @Roles([ROLE.ADMIN])
    @ApiParam({ name: 'id' })
    @Patch('/upgradeToAdmin/:id')
    async upgradeToAdmin(@Param('id') id: string) {
        return this.userService.upgradeToAdmin(id)
    }

    @ApiBearerAuth()
    @UseGuards(RolesGuard)
    @Roles([ROLE.ADMIN])
    @ApiParam({ name: 'id' })
    @Patch('/dropAdmin/:id')
    async dropAdmin(@Param('id') id: string) {
        return this.userService.dropAdmin(id)
    }

    @ApiParam({ name: 'id' })
    @Delete('/delete/:id')
    async deleteUser(@Param('id') id: UUID) {
        this.userService.deleteById(id)
    }
}
