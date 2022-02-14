import { MigrationInterface, QueryRunner } from 'typeorm';

export class addMovieCollections1614157572162 implements MigrationInterface {
  name = 'addMovieCollections1614157572162';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "movie_entity" ("_movieId" character varying NOT NULL, "title" character varying NOT NULL, "createTime" TIMESTAMP NOT NULL, "collectionId" character varying, CONSTRAINT "PK_383ac41082eacf5395af2118d08" PRIMARY KEY ("_movieId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "movie_collection_entity" ("timezone" character varying NOT NULL, "_userId" character varying NOT NULL, CONSTRAINT "PK_ad108bc4fc24730651b1c7b58df" PRIMARY KEY ("_userId"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "movie_entity" ADD CONSTRAINT "FK_0d1e7dbf6ce2a4c0a4a6c43ab99" FOREIGN KEY ("collectionId") REFERENCES "movie_collection_entity"("_userId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "movie_entity" DROP CONSTRAINT "FK_0d1e7dbf6ce2a4c0a4a6c43ab99"`,
    );
    await queryRunner.query(`DROP TABLE "movie_collection_entity"`);
    await queryRunner.query(`DROP TABLE "movie_entity"`);
  }
}
