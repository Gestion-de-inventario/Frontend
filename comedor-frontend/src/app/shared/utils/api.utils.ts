export function buildEndpoint(endpoint: string, params: Record<string, string | number>): string {
  let finalEndpoint = endpoint;

  Object.keys(params).forEach((key) => {
    finalEndpoint = finalEndpoint.replace(`{${key}}`, String(params[key]));
  });

  return finalEndpoint;
}
