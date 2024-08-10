import { Injectable } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { DataSource, FindOneOptions, Repository } from 'typeorm'
import { UpdateUserDto } from './dto'
import { User, UserInfo } from '../entities/user'
import { UUID } from 'crypto'
// import { JwtGuard } from '../guards/jwt.guard'

@Injectable()
export class UserService {
    constructor(
        @InjectDataSource() private readonly dataSource: DataSource,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(UserInfo)
        private readonly userInfoRepository: Repository<UserInfo>,
    ) {}

    async updateUser(id: UUID, updateUserDto: UpdateUserDto): Promise<void> {
        return
    }

    async findUser(
        where: Partial<Omit<User, 'books' | 'role'>>,
        options: Omit<FindOneOptions<User>, 'where'> = {},
    ) {
        return this.userRepository.findOne({ where: where, ...options })
    }

    async deleteById(id: UUID) {
        return this.userRepository.delete({ id })
    }
}
