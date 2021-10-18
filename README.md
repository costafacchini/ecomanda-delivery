# Setup node (only if you have not installed)

This project uses [asdf](https://asdf-vm.com/#/). \
Follow the installation [instructions](https://asdf-vm.com/#/core-manage-asdf?id=asdf)

After installation you need to follow these steps:

```bash
# Add nodejs plugin on asdf
$ asdf plugin add nodejs

# Install nodejs plugin
$ asdf install nodejs 14.16.0

# Set the default nodejs for the project
$ asdf local nodejs 14.16.0
```

In the project directory, you should run docker to prepare database:

## `docker-compose up --build`

## `docker-compose run redis redis-cli -h ecomanda-delivery_redis_1`

Run to connect on redis. (List all keys  KEYS * )

# Available Scripts (backend)

In the project directory, you can run:

## `yarn start`

Runs the SERVER only in the development mode.\

## `yarn dev`

Runs the Server and WORKER in the development mode.\

## `yarn test`

Runs the tests without coverage (fast).\

## `yarn test::coverage`

Runs the tests with coverage (low).\

## `yarn watch`

Watchs the tests without coverage.\

## `yarn build`

Builds the app for production.\

## `linter`

Run linter to show the code that is out of patters

# Available Scripts (frontend)

In the CLIENT directory, you can run:

## `yarn start`

Runs the frontend in the development mode.\

## `yarn test`

Runs the tests .\

# Backups

## gzip

```bash
# Backup
$ mongodump --uri {uri} --gzip --archive=={path}

# Restore
$ mongorestore --uri {uri} --gzip --drop {path do backup}
```
