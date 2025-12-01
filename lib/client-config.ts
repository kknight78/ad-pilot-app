export interface ClientConfig {
  clientName: string;
  primaryColor: string;
  logoUrl?: string;
  welcomeMessage: string;
}

// Default client configuration
export const defaultClient: ClientConfig = {
  clientName: "Capitol Car Credit",
  primaryColor: "#3B82F6",
  welcomeMessage: "Hi! I'm your Ad Pilot assistant. I can help you create video ads, manage your inventory content, and optimize your advertising strategy. What would you like to work on today?",
};

// In the future, this could fetch from an API based on subdomain or query param
export function getClientConfig(): ClientConfig {
  return defaultClient;
}
