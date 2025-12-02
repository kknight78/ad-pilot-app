export interface ClientConfig {
  clientName: string;
  primaryColor: string;
  logoUrl?: string;
}

// Default client configuration
export const defaultClient: ClientConfig = {
  clientName: "Capitol Car Credit",
  primaryColor: "#3B82F6",
};

// In the future, this could fetch from an API based on subdomain or query param
export function getClientConfig(): ClientConfig {
  return defaultClient;
}
