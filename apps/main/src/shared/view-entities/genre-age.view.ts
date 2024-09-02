import { ViewEntity } from 'typeorm'

@ViewEntity({
    name: 'genre_age_view',
    expression: `
    WITH temp_table AS (
	    SELECT UNNEST(genres) AS genres, AGE(birthday_date)
	    FROM books
	    JOIN users_books USING(book_id)
	    JOIN users ON user_id = users.id
	    JOIN users_info ON users_info.id = info_id
	    GROUP BY book_id, birthday_date
    )

    SELECT genres, CASE
	    WHEN age > '20 years' THEN 'years > 20'
	    WHEN age > '10 years' THEN '10 < years <= 20'
	    WHEN age > '4 years' THEN '4 < years <= 10'
	    ELSE 'years >= 4' END AS age, COUNT(*)
	    FROM temp_table
    GROUP BY genres, age`,
})
export class GenreAgeView {}
