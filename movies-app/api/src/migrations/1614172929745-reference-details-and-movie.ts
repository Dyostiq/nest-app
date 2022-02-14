import { MigrationInterface, QueryRunner } from 'typeorm';

export class referenceDetailsAndMovie1614172929745
  implements MigrationInterface {
  name = 'referenceDetailsAndMovie1614172929745';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "details_entity" ("movieId" character varying NOT NULL, "title" character varying NOT NULL, "released" character varying NOT NULL, "genre" character varying NOT NULL, "director" character varying NOT NULL, CONSTRAINT "REL_d08e785fd07c4de5470afa48b0" UNIQUE ("movieId"), CONSTRAINT "PK_d08e785fd07c4de5470afa48b06" PRIMARY KEY ("movieId"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "details_entity" ADD CONSTRAINT "FK_d08e785fd07c4de5470afa48b06" FOREIGN KEY ("movieId") REFERENCES "movie_entity"("_movieId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "details_entity" DROP CONSTRAINT "FK_d08e785fd07c4de5470afa48b06"`,
    );
    await queryRunner.query(`DROP TABLE "details_entity"`);
  }
}
