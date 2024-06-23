# README

## Requirements

```shell
  node 20.x
```

## Purpose

This project was developed at the request of a friend and I used it as a challenge to improve my Javascript skills using Node and React.

## Domain

The project domain is the integration between Chat platforms, Chatbots and WhatsApp.

He set out to help support some companies by speeding up the exchange of messages between a WhatsApp number and a chat platform where various agents used to help users.

The Chatbot was an opportunity that appeared later and helped users self-service before calling an attendant to resolve their query.

## Decisions

The project was developed without me having much experience developing with Javascript.
The project does not follow a specific architecture. This caused a lot of problems like cohesion, coupling, dependency injection, bloated controllers.
The project no longer has any client running, so it is only serving as a guinea pig to train refactorings and apply good practices

## Improvements
 - Decouple mongo from the application, facilitating a possible migration to another database. This improvement will help us improve tests that are currently highly coupled with the database
 - Extract use cases from controllers. Controllers are full of logic and tightly coupled with the database layer
 - Resolve pull requests with libs that changed their interface
 - Migrate to TS
 - Study improvements to use the app's architecture using Ports and Adapters. (probably many tasks will be necessary)
 - Create API documentation
 - Extract the PDV part to another project as it is not part of the project's main domain
 - Remove no longer used plugins
 - ...

## Setup Node (only if you have not installed)

This project uses [asdf](https://asdf-vm.com/guide/getting-started.html). \
Follow the installation [instructions](https://asdf-vm.com/guide/getting-started.html#_3-install-asdf)

After installation you need to follow these steps:

```bash
# Add nodejs plugin on asdf
$ asdf plugin add nodejs

# Install nodejs plugin
$ asdf install nodejs 20.13.1

# Set the default nodejs for the project
$ asdf local nodejs 20.13.1

# install Yarn
$ npm install --global yarn
```

## Setup Project

The first step is configure environment variables

The project has a file called `.env.example` that contains all the necessary environment variables

```bash
# create a .env file
$ cp .env.example .env
```

In the project directory:

```bash
# build the containers used on development environment
$ docker-compose up --build
```

## Local development

In the project directory:

```bash
# start the backend in nodejs
$ yarn start

# to start the frontend part, you need to access the client folder
$ cd client
$ yarn start
```

### Scripts available (backend)

```bash
# build the frontent from the root folder
$ yarn build

# to run only the server in local development with docker and nodemon
$ yarn dev:server

# to run only the worker in local development (to process the jobs)
$ yarn dev:worker

# to run all dev scripts (server and worker)
$ yarn dev

# to run the backend tests
$ yarn test

# to run the backend tests using the CI script
$ yarn test:ci

# to run the backend tests with the coverage report
$ yarn test:coverage

# to run the backend tests in watch mode
$ yarn watch

# to run the linter
$ yarn linter
```

### Scripts available (frontend)

```bash
# you need to access the client folder
$ cd client

# to build the frontent
$ yarn build

# to run the frontend tests
$ yarn test

# to run the backend tests in watch mode
$ yarn jest:watch
```

## Backups

### gzip

```bash
# Backup
$ mongodump --uri {uri} --gzip --out=={path}

# Restore
$ mongorestore --uri {uri} --gzip --drop {path do backup}
```
