import { DataSource, ViewEntity } from 'typeorm'
import { POSTGRES_NAME } from '~constants/names_db.constant'
import { User, UserInfo } from './user.entity'

@ViewEntity({
    database: POSTGRES_NAME,
    expression: (connection: DataSource) =>
        connection
            .createQueryBuilder()
            .select('users.id', 'id')
            .addSelect('users.username', 'username')
            .addSelect('users.name', 'name')
            .addSelect('users_info.birthday_date', 'birthday_date')
            .addSelect('users_info.gender', 'gender')
            .from(User, 'users')
            .leftJoin(UserInfo, 'users_info', 'users.info_id = users_info.id'),
})
export class UserInfoView {}
