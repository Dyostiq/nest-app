Please fill the `api/.env` file with an API Key.

`docker-compose up -d` should set up the stack for development.

Also, to have an application fully working, you will need to migrate the database once created. So, run:
```
(cd api && npm run typeorm migration:run)
```
on repo's root (or just the npm command if you already are in the right directory).

The documentation of the API is available [here](http://localhost:3001/api) when the app is running.
