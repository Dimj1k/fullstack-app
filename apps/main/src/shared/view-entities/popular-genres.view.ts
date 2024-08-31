import { ViewEntity } from 'typeorm'

@ViewEntity({
    name: 'popular_genres_view',
    expression: `
    WITH temp_table AS (
	    SELECT likes, UNNEST(genre) AS genre
	    FROM books
	    JOIN users_books USING(book_id)
	    GROUP BY book_id
    )

    SELECT genre, sum(likes) AS total_likes FROM temp_table
	GROUP BY genre
	ORDER BY total_likes DESC`,
})
export class PopularGenresView {}
