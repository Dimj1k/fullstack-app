import { Injectable, NotFoundException } from '@nestjs/common'
import { ROLE, User } from '../shared/entities/user'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async upgradeToAdmin(email: string) {
        let foundedUser = await this.findUser({ email })
        if (!foundedUser) throw new NotFoundException()
        if (foundedUser.role.some((value) => value === ROLE.ADMIN)) return
        foundedUser.role.push(ROLE.ADMIN)
        return this.userRepository.update({ email }, { role: foundedUser.role })
    }

    async dropAdmin(email: string) {
        let foundedUser = await this.findUser({ email })
        if (!foundedUser) throw new NotFoundException()
        let roles = foundedUser.role.filter((val) => val !== ROLE.ADMIN)
        return this.userRepository.update({ email }, { role: roles })
    }

    async findUser(props: Partial<Omit<User, 'role' | 'books'>>) {
        return this.userRepository.findOneBy(props)
    }
}
