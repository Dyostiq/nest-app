import {INestApplication} from '@nestjs/common';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';

export const setupSwagger = (app: INestApplication): void => {
    const config = new DocumentBuilder()
        .setTitle('recruitment task')
        .build();
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api', app, document);
}