import { hash } from 'bcrypt'
import { subDays } from 'date-fns'
import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    RemoveEvent,
} from 'typeorm'
import { User } from '~entities/pg/user.entity'

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
    listenTo(): typeof User {
        return User
    }
    async beforeInsert(event: InsertEvent<User>): Promise<void> {
        const { entity, manager } = event
        entity.updatedDate = entity.createdDate = subDays(new Date(), 4)
        entity.password = await hash(entity.password, 5)
    }

    async beforeRemove(event: RemoveEvent<User>): Promise<void> {
        console.log(`${event.entityId} удалён`)
    }
}
