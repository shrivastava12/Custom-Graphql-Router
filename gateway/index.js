const { ApolloServer } = require("@apollo/server");
const { stitchSchemas } = require("@graphql-tools/stitch");
const { wrapSchema } = require("@graphql-tools/wrap");
const { loadSchema } = require("@graphql-tools/load");
const { UrlLoader } = require("@graphql-tools/url-loader");
const { fetch } = require("cross-fetch");
const { print } = require("graphql");
const { startStandaloneServer } = require("@apollo/server/standalone");

const server1Url = "http://localhost:4000/graphql";
const server2Url = "http://localhost:4001/graphql";

// Function to execute GraphQL queries on a remote server
const createRemoteExecutor =
  (url) =>
  async ({ document, variables, context }) => {
    console.log("Context received in executor:", context);
    console.log(`Executing query on: ${url}`);
    
    const query = print(document);
    
    // Properly merge the headers from context with the default headers
    const headers = {
      "Content-Type": "application/json",
      ...(context?.headers || {})
    };
    
    const response = await fetch(url, {
      method: "POST",
      headers: headers,  // Use the merged headers object
      body: JSON.stringify({ query, variables }),
    });

    return response.json();
  };

// Function to load and wrap a remote schema
const loadRemoteSchema = async (url) => {
  console.log(`Loading schema from: ${url}`);

  // Ensure loadSchema is awaited before passing to wrapSchema
  const schema = await loadSchema(url, { loaders: [new UrlLoader()] });
  console.log(schema,'schema')
  return wrapSchema({
    schema,
    executor: createRemoteExecutor(url),
  });
};

// Function to stitch multiple schemas
async function createGatewaySchema() {
  const [schema1, schema2] = await Promise.all([
    loadRemoteSchema(server1Url),
    loadRemoteSchema(server2Url),
  ]);

  console.log("Schemas loaded successfully");

  return stitchSchemas({ 
    subschemas: [schema1, schema2],
    // Ensure context is passed to subschemas
    mergeTypes: true 
  });
}

// Start Apollo Server
async function startServer() {
  try {
    const schema = await createGatewaySchema();

    const server = new ApolloServer({
      schema,
    });
    
    const { url } = await startStandaloneServer(server, {
      context: async ({ req }) => {
        console.log("Gateway context", req.headers);
        // Return a properly structured context object
        return { 
          headers: req.headers  // Pass headers to executors
        }; 
      },
      listen: { port: 5000 },
    });

    console.log(`🚀  Server ready at: ${url}`);
  } catch (error) {
    console.error("Error starting server:", error);
  }
}

startServer();