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

/**
 * Parse an OpenAPI/Swagger spec from JSON or YAML string.
 * Supports: OpenAPI 3.x, Swagger 2.0, JSON and YAML formats.
 */
export function parseOpenApiSpec(content: string): ParsedSpec | null {
  try {
    let spec: Record<string, unknown>;

    // Try JSON first
    try {
      spec = JSON.parse(content);
    } catch {
      // Try basic YAML parsing (key: value without full YAML lib)
      spec = parseBasicYaml(content);
      if (!spec) return null;
    }

    const info = (spec.info as Record<string, unknown>) || {};

    // Handle servers (OpenAPI 3.x) and host+basePath (Swagger 2.0)
    let baseUrl = '';
    if (spec.servers && Array.isArray(spec.servers) && spec.servers.length > 0) {
      baseUrl = (spec.servers[0] as Record<string, string>).url || '';
    } else if (spec.host) {
      const scheme = (spec.schemes as string[])?.[0] || 'https';
      const basePath = (spec.basePath as string) || '';
      baseUrl = `${scheme}://${spec.host}${basePath}`;
    }

    const endpoints: ParsedEndpoint[] = [];

    if (spec.paths && typeof spec.paths === 'object') {
      for (const [path, methods] of Object.entries(spec.paths as Record<string, Record<string, unknown>>)) {
        if (!methods || typeof methods !== 'object') continue;
        for (const [method, details] of Object.entries(methods)) {
          if (['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(method.toLowerCase())) {
            const d = (details || {}) as Record<string, unknown>;
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

    // Sort by path then method
    endpoints.sort((a, b) => a.path.localeCompare(b.path) || a.method.localeCompare(b.method));

    return {
      title: (info.title as string) || 'Imported API',
      version: (info.version as string) || '1.0.0',
      baseUrl,
      endpoints,
    };
  } catch {
    return null;
  }
}

/**
 * Basic YAML parser for OpenAPI specs.
 * Handles the common structure without requiring a full YAML library.
 * Supports: mappings, sequences, multi-line strings, nested objects.
 * NOT a general-purpose YAML parser — only handles OpenAPI-shaped docs.
 */
function parseBasicYaml(content: string): Record<string, unknown> | null {
  try {
    // Quick validation: must look like YAML (has colons, no JSON braces at start)
    const trimmed = content.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) return null;
    if (!trimmed.includes(':')) return null;

    // Simple recursive descent YAML parser for OpenAPI structures
    const lines = content.split('\n');
    const root: Record<string, unknown> = {};
    const stack: Array<{ obj: Record<string, unknown>; indent: number }> = [{ obj: root, indent: -1 }];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      // Skip empty lines and comments
      if (!line.trim() || line.trim().startsWith('#')) continue;

      const indent = line.search(/\S/);
      const content = line.trim();

      // Pop stack to find parent
      while (stack.length > 1 && indent <= stack[stack.length - 1].indent) {
        stack.pop();
      }

      const parent = stack[stack.length - 1].obj;

      // Key: value
      const colonIndex = content.indexOf(':');
      if (colonIndex > 0) {
        const key = content.substring(0, colonIndex).trim().replace(/^["']|["']$/g, '');
        const value = content.substring(colonIndex + 1).trim();

        if (value === '' || value === '|' || value === '>') {
          // Nested object or multi-line — will be filled by children
          parent[key] = {};
          stack.push({ obj: parent[key] as Record<string, unknown>, indent });
        } else if (value.startsWith('[') || value.startsWith('{')) {
          // Inline JSON
          try { parent[key] = JSON.parse(value); } catch { parent[key] = value; }
        } else if (value === 'true') {
          parent[key] = true;
        } else if (value === 'false') {
          parent[key] = false;
        } else if (/^-?\d+(\.\d+)?$/.test(value)) {
          parent[key] = parseFloat(value);
        } else {
          parent[key] = value.replace(/^["']|["']$/g, '');
        }
      } else if (content.startsWith('- ')) {
        // Sequence item — find parent key
        const lastKey = Object.keys(parent).pop();
        if (lastKey && !Array.isArray(parent[lastKey])) {
          parent[lastKey] = [];
        }
        if (lastKey) {
          const arr = parent[lastKey] as unknown[];
          const itemValue = content.substring(2).trim();
          if (itemValue.includes(':') && !itemValue.startsWith('"') && !itemValue.startsWith("'")) {
            // Inline object in sequence
            const itemObj: Record<string, unknown> = {};
            const parts = itemValue.split(/\s+/);
            for (const part of parts) {
              const ci = part.indexOf(':');
              if (ci > 0) {
                itemObj[part.substring(0, ci)] = part.substring(ci + 1);
              }
            }
            arr.push(itemObj);
          } else {
            arr.push(itemValue.replace(/^["']|["']$/g, ''));
          }
        }
      }
    }

    return root;
  } catch {
    return null;
  }
}
