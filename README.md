This example demonstrates how to build a GraphQL server over [Prisma](https://github.com/prisma/prisma) using TypeScript & [apollo-server](https://github.com/apollographql/apollo-server).

It inlcudes below features:

* An implementation of email-password-based authentication workflow.

* GraphQL over GraphQL/Prisma.

* [Customized GraphQl queries](src/resolvers/Mutation.ts#L36-L50) which base on the resolve info.

## Get started

1. Use [docker-compose](https://docs.docker.com/compose/) to run the prisma server in docker containers:

```sh
docker-compose up -d
```

2. Install Node dependencies:

```sh
yarn install
```

3. Deploy service to prisma server and then generate the corresponding schema:

```sh
yarn dg
```

4. Start the apollo server:

```sh
yarn start
```
