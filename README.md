This is an example demonstrates how to implement a GraphQL server based on [prisma](https://github.com/prisma/prisma) & [apollo-server](https://github.com/apollographql/apollo-server).

## Get started

1. Use [docker-compose](https://docs.docker.com/compose/) to run the prisma server in docker containers:

```sh
docker-compose up -d
```

2. Deploy service to prisma server and then generate the corresponding code of prisma client:

```sh
yarn dg
```

3. Start the apollo server:

```sh
yarn start
```
