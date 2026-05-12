export interface ParsedEndpoint {
  path: string;
  method: string;
  description: string;
  selected: boolean;
}

export interface ParsedSpec {
  title: string;
  version: string;
  baseUrl: string;
  endpoints: ParsedEndpoint[];
}

export function parseOpenApiSpec(content: string): ParsedSpec | null {
  try {
    const spec = JSON.parse(content);
    const info = spec.info || {};
    const baseUrl = spec.servers?.[0]?.url || '';
    const endpoints: ParsedEndpoint[] = [];

    if (spec.paths) {
      for (const [path, methods] of Object.entries(spec.paths as Record<string, Record<string, unknown>>)) {
        for (const [method, details] of Object.entries(methods)) {
          if (['get', 'post', 'put', 'patch', 'delete'].includes(method.toLowerCase())) {
            const d = details as Record<string, unknown>;
            endpoints.push({
              path,
              method: method.toUpperCase(),
              description: (d.summary as string) || (d.description as string) || `${method.toUpperCase()} ${path}`,
              selected: true,
            });
          }
        }
      }
    }

    return {
      title: info.title || 'Imported API',
      version: info.version || '1.0.0',
      baseUrl,
      endpoints,
    };
  } catch {
    return null;
  }
}
