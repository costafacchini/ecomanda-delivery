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

# Available Scripts

In the project directory, you can run:

## `yarn dev`

Runs the app in the development mode.\

## `yarn test`

Launches the test runner.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

## `yarn watch`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

## `yarn test --watchAll`

Launches the test runner for all files.

## `yarn test -- --coverage`

Launches the test runner for all files with coverage report.

## `linter`

Run linter to show the code that is out of patters