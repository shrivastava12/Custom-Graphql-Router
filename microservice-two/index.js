import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { users } from "./data.js";

const typeDefs = `#graphql

  # This "Users" type defines the queryable fields for every book in our data source.
  type User {
    name: String
    email: String
  }

  type Query {
    users: [User]
  }
`;

const resolvers = {
  Query: {
    users: () => users,
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4001 },
});

console.log(`🚀  Server ready at: ${url}`);
