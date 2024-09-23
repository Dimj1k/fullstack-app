import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1725255010517 implements MigrationInterface {
    name = 'Migration1725255010517'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TYPE "public"."users_info_gender_enum" AS ENUM('0', '1', '2')`,
        )
        await queryRunner.query(
            `CREATE TYPE "public"."users_role_enum" AS ENUM('USER', 'ADMIN')`,
        )
        await queryRunner.query(
            `CREATE TABLE "users_info" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "birthday_date" date, "gender" "public"."users_info_gender_enum" NOT NULL DEFAULT '2', CONSTRAINT "CHK_01989c1bc7a2b3f00572180e84" CHECK ("birthday_date" < now()), CONSTRAINT "PK_9bcc2add2d98c69cbb75a0cba27" PRIMARY KEY ("id"))`,
        )
        await queryRunner.query(
            `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(255) NOT NULL, "password_hash" text NOT NULL, "created_date" TIMESTAMP NOT NULL DEFAULT now(), "updated_date" TIMESTAMP, "role" "public"."users_role_enum" array NOT NULL DEFAULT '{USER}', "info_id" uuid, CONSTRAINT "REL_9bcc2add2d98c69cbb75a0cba2" UNIQUE ("info_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
        )
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `,
        )
        await queryRunner.query(
            `CREATE TABLE "books" ("book_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "images" hstore, "name_book" character varying(100) NOT NULL, "description" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "likes" bigint NOT NULL DEFAULT '0', "genres" character varying(63) array NOT NULL, CONSTRAINT "PK_552bd343dabd693159e284fe517" PRIMARY KEY ("book_id"))`,
        )
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_67720442132d9b445048d16799" ON "books" ("name_book") `,
        )
        await queryRunner.query(
            `CREATE INDEX "IDX_cdd8ce8990dedfb58429f19779" ON "books" USING GIN("genres") `,
        )
        await queryRunner.query(
            `CREATE TABLE "genres" ("id" SERIAL NOT NULL, "genre" character varying(63) NOT NULL, CONSTRAINT "PK_80ecd718f0f00dde5d77a9be842" PRIMARY KEY ("id"))`,
        )
        await queryRunner.query(
            `CREATE UNIQUE INDEX "IDX_778e59ce8961a0c7c8e6534f12" ON "genres" ("genre") `,
        )
        await queryRunner.query(
            `CREATE TABLE "users_books" ("user_id" uuid NOT NULL, "book_id" uuid NOT NULL, CONSTRAINT "PK_64c013596bce5f33fea31f72020" PRIMARY KEY ("user_id", "book_id"))`,
        )
        await queryRunner.query(
            `CREATE INDEX "IDX_15860f140caa2a4c84268eb003" ON "users_books" ("user_id") `,
        )
        await queryRunner.query(
            `CREATE INDEX "IDX_de933da4709feaf5da9b310c31" ON "users_books" ("book_id") `,
        )
        await queryRunner.query(
            `ALTER TABLE "users" ADD CONSTRAINT "FK_9bcc2add2d98c69cbb75a0cba27" FOREIGN KEY ("info_id") REFERENCES "users_info"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
        )
        await queryRunner.query(
            `ALTER TABLE "users_books" ADD CONSTRAINT "FK_15860f140caa2a4c84268eb003a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
        )
        await queryRunner.query(
            `ALTER TABLE "users_books" ADD CONSTRAINT "FK_de933da4709feaf5da9b310c31d" FOREIGN KEY ("book_id") REFERENCES "books"("book_id") ON DELETE CASCADE ON UPDATE CASCADE`,
        )
        await queryRunner.query(`CREATE VIEW "genre_age_view" AS 
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
    GROUP BY genres, age`)
        await queryRunner.query(
            `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
            [
                'public',
                'VIEW',
                'genre_age_view',
                "WITH temp_table AS (\n\t    SELECT UNNEST(genres) AS genres, AGE(birthday_date)\n\t    FROM books\n\t    JOIN users_books USING(book_id)\n\t    JOIN users ON user_id = users.id\n\t    JOIN users_info ON users_info.id = info_id\n\t    GROUP BY book_id, birthday_date\n    )\n\n    SELECT genres, CASE\n\t    WHEN age > '20 years' THEN 'years > 20'\n\t    WHEN age > '10 years' THEN '10 < years <= 20'\n\t    WHEN age > '4 years' THEN '4 < years <= 10'\n\t    ELSE 'years >= 4' END AS age, COUNT(*)\n\t    FROM temp_table\n    GROUP BY genres, age",
            ],
        )
        await queryRunner.query(`CREATE VIEW "popular_genres_view" AS 
    WITH temp_table AS (
	    SELECT likes, UNNEST(genres) AS genres
	    FROM books
	    JOIN users_books USING(book_id)
	    GROUP BY book_id
    )

    SELECT genres, sum(likes) AS total_likes FROM temp_table
	GROUP BY genres
	ORDER BY total_likes DESC`)
        await queryRunner.query(
            `INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`,
            [
                'public',
                'VIEW',
                'popular_genres_view',
                'WITH temp_table AS (\n\t    SELECT likes, UNNEST(genres) AS genres\n\t    FROM books\n\t    JOIN users_books USING(book_id)\n\t    GROUP BY book_id\n    )\n\n    SELECT genres, sum(likes) AS total_likes FROM temp_table\n\tGROUP BY genres\n\tORDER BY total_likes DESC',
            ],
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
            ['VIEW', 'popular_genres_view', 'public'],
        )
        await queryRunner.query(`DROP VIEW "popular_genres_view"`)
        await queryRunner.query(
            `DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`,
            ['VIEW', 'genre_age_view', 'public'],
        )
        await queryRunner.query(`DROP VIEW "genre_age_view"`)
        await queryRunner.query(
            `ALTER TABLE "users_books" DROP CONSTRAINT "FK_de933da4709feaf5da9b310c31d"`,
        )
        await queryRunner.query(
            `ALTER TABLE "users_books" DROP CONSTRAINT "FK_15860f140caa2a4c84268eb003a"`,
        )
        await queryRunner.query(
            `ALTER TABLE "users" DROP CONSTRAINT "FK_9bcc2add2d98c69cbb75a0cba27"`,
        )
        await queryRunner.query(
            `DROP INDEX "public"."IDX_de933da4709feaf5da9b310c31"`,
        )
        await queryRunner.query(
            `DROP INDEX "public"."IDX_15860f140caa2a4c84268eb003"`,
        )
        await queryRunner.query(`DROP TABLE "users_books"`)
        await queryRunner.query(
            `DROP INDEX "public"."IDX_778e59ce8961a0c7c8e6534f12"`,
        )
        await queryRunner.query(`DROP TABLE "genres"`)
        await queryRunner.query(
            `DROP INDEX "public"."IDX_cdd8ce8990dedfb58429f19779"`,
        )
        await queryRunner.query(
            `DROP INDEX "public"."IDX_67720442132d9b445048d16799"`,
        )
        await queryRunner.query(`DROP TABLE "books"`)
        await queryRunner.query(
            `DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`,
        )
        await queryRunner.query(`DROP TABLE "users"`)
        await queryRunner.query(`DROP TABLE "users_info"`)
        await queryRunner.query(`DROP TYPE "public"."users_info_gender_enum"`)
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`)
    }
}
