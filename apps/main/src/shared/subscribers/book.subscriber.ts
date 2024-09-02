import {
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    RemoveEvent,
    UpdateEvent,
} from 'typeorm'
import { Book } from '../entities/books'
import { Genre } from '../entities/genres'

@EventSubscriber()
export class BookSubscriber implements EntitySubscriberInterface<Book> {
    listenTo(): typeof Book {
        return Book
    }
    async beforeInsert(event: InsertEvent<Book>): Promise<void> {
        const {
            entity: { genres },
            manager,
        } = event
        await manager
            .getRepository(Genre)
            .createQueryBuilder()
            .insert()
            .values(
                genres.map((genre) => ({
                    genre,
                })),
            )
            .orIgnore()
            .execute()
    }

    // async beforeUpdate(event: UpdateEvent<Book>): Promise<void> {
    //     // console.log(event)
    // }
}
