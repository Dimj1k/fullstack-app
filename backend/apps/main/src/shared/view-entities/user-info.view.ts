import { DataSource, ViewEntity } from 'typeorm'
import { User, UserInfo } from '../entities/user'

@ViewEntity({
    name: 'total_users',
    expression: (connection: DataSource) =>
        connection
            .createQueryBuilder()
            .select('users.id', 'id')
            .addSelect('users.email', 'email')
            .addSelect('users_info.birthday_date', 'birthday_date')
            .addSelect('users_info.gender', 'gender')
            .from(User, 'users')
            .leftJoin(UserInfo, 'users_info', 'users.info_id = users_info.id'),
})
export class TotalUsers {}
