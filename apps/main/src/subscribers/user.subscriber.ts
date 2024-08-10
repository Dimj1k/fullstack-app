import { subDays } from 'date-fns'
import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    RemoveEvent,
} from 'typeorm'
import { User } from '../entities/user'

@EventSubscriber()
export class UserSubscriber implements EntitySubscriberInterface<User> {
    listenTo(): typeof User {
        return User
    }
    async beforeInsert(event: InsertEvent<User>): Promise<void> {
        const { entity, manager } = event
        entity.updatedDate = entity.createdDate = subDays(new Date(), 4)
    }

    async beforeRemove(event: RemoveEvent<User>): Promise<void> {
        console.log(`удалён`)
    }
}
