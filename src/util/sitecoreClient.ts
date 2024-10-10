import { GraphQLClient } from "graphql-request";

// Sitecore XM Cloud GraphQL endpoint (replace with your actual endpoint)
const endpoint: string = "https://edge.sitecorecloud.io/api/graphql/v1";

// GraphQL client setup with cache-busting
const client: GraphQLClient = new GraphQLClient(endpoint, {
  headers: {
    sc_apikey: process.env.SITECORE_API_KEY!,
  },
});

// Function to fetch data from GraphQL without caching
export async function fetchGraphQL<T>(
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  try {
    // Add a timestamp to the variables to prevent caching
    const timestampedVariables = {
      ...variables,
      timestamp: new Date().getTime(),
    };

    const data: T = await client.request<T>(query, timestampedVariables);
    return data;
  } catch (error) {
    console.error("Error fetching GraphQL data:", error);
    throw error;
  }
}
