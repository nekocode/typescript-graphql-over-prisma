This example demonstrates how to implement a GraphQL server with an email-password-based authentication workflow using TypeScript based on [prisma](https://github.com/prisma/prisma) & [apollo-server](https://github.com/apollographql/apollo-server).

It is based on the [prisma official example](https://github.com/prisma/prisma-examples/tree/master/typescript-graphql-auth), but includes many modifications, such as replacing graphql-yoga with apollo-server. See the code for details.

## Get started

1. Use [docker-compose](https://docs.docker.com/compose/) to run the prisma server in docker containers:

```sh
docker-compose up -d
```

2. Install Node dependencies:

```sh
yarn install
```

3. Deploy service to prisma server and then generate the corresponding code of prisma client:

```sh
yarn dg
```

4. Start the apollo server:

```sh
yarn start
```
