import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { books } from "./data.js";

const typeDefs = `#graphql

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
    title: String
    author: String
  }

  type Query {
    books: [Book]
  }
`;

const resolvers = {
  Query: {
    books: (parent, args, context, info) => {
      console.log("books resolver");
      console.log("Parent:", parent);
      console.log("Args:", args);
      console.log("Context:", context);
      console.log("books resolver");
      // console.log(context,args,root);
      return books;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req }) => {
    // Make sure to return headers in the context
    return {
      headers: req.headers,
    };
  },
});

console.log(`🚀  Server ready at: ${url}`);
