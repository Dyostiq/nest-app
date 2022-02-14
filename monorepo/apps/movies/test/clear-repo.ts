import { getConnectionToken } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { INestApplicationContext } from '@nestjs/common';

export async function clearRepo(testingModule: INestApplicationContext) {
  const connection = testingModule.get<Connection>(getConnectionToken());
  await connection.query(
    `
          TRUNCATE ${connection.entityMetadatas
            .map((metadata) => `"${metadata.tableName}"`)
            .join(',')} CASCADE
        `,
  );
}
