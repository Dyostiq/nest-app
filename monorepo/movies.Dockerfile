FROM node:16 As development

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build movies

FROM node:16 as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

COPY --from=development /app/dist ./dist

CMD ["node", "dist/movies/main.js"]