## Description

Ubots challenge interview

## Data flow

<img src="./public/data-flow.svg" width="200">

## Installation

```bash
$ yarn install
```

## Running the app
use node ^18

```bash
# start redis
$ docker-compose up

# development
$ yarn run start
$ yarn run start solicitation-queue-ms
$ yarn run start support-teams-ms

# watch mode
$ yarn run start:dev
$ yarn run start:dev solicitation-queue-ms
$ yarn run start:dev support-teams-ms

# production mode
$ yarn run start:prod
$ yarn run start:prod solicitation-queue-ms
$ yarn run start:prod support-teams-ms
```

## Documentation

Swagger doc on route /api of relationship-bff service
```bash
$ http://localhost:3000/api
```

## Stay in touch

- Author - [Saulo Joseph](https://www.linkedin.com/in/saulodesousajoseph1994/)