export type Post = { title: string; date: string; category: string; readTime: string; tags: string[]; author: string; content: string };

export const authors: Record<string, { name: string; role: string; initials: string }> = {
  'HookSniff Team': { name: 'HookSniff Team', role: 'Engineering', initials: 'HS' },
  'Servet Arslan': { name: 'Servet Arslan', role: 'Founder', initials: 'SA' },
};

export const categoryGradients: Record<string, string> = {
  'AI & Agents': 'from-purple-600 to-indigo-700',
  'Engineering': 'from-blue-600 to-cyan-700',
  'Integration': 'from-emerald-600 to-teal-700',
  'Changelog': 'from-orange-500 to-amber-600',
  'Announcement': 'from-rose-500 to-pink-600',
  'Standard': 'from-teal-500 to-cyan-600',
};


import { post as hooksniff_vs_svix_vs_hookdeck } from './posts/hooksniff-vs-svix-vs-hookdeck';
import { post as may_2026_changelog } from './posts/may-2026-changelog';
import { post as building_mcp_ready_webhooks } from './posts/building-mcp-ready-webhooks';
import { post as webhook_integration_tutorial } from './posts/webhook-integration-tutorial';
import { post as webhook_architecture_deep_dive } from './posts/webhook-architecture-deep-dive';
import { post as customer_spotlight_ecommerce } from './posts/customer-spotlight-ecommerce';
import { post as why_ai_agents_need_webhooks } from './posts/why-ai-agents-need-webhooks';
import { post as gemini_webhook_integration } from './posts/gemini-webhook-integration';
import { post as stripe_webhook_guide } from './posts/stripe-webhook-guide';
import { post as changelog_may_2026 } from './posts/changelog-may-2026';
import { post as introducing_hooksniff } from './posts/introducing-hooksniff';
import { post as webhook_best_practices } from './posts/webhook-best-practices';
import { post as fifo_webhook_delivery } from './posts/fifo-webhook-delivery';
import { post as github_webhook_guide } from './posts/github-webhook-guide';
import { post as cloudevents_standard } from './posts/cloudevents-standard';
import { post as webhook_security_guide } from './posts/webhook-security-guide';
import { post as shopify_webhook_incident_analysis } from './posts/shopify-webhook-incident-analysis';

export const posts: Record<string, Post> = {
  'hooksniff-vs-svix-vs-hookdeck': hooksniff_vs_svix_vs_hookdeck,
  'may-2026-changelog': may_2026_changelog,
  'building-mcp-ready-webhooks': building_mcp_ready_webhooks,
  'webhook-integration-tutorial': webhook_integration_tutorial,
  'webhook-architecture-deep-dive': webhook_architecture_deep_dive,
  'customer-spotlight-ecommerce': customer_spotlight_ecommerce,
  'why-ai-agents-need-webhooks': why_ai_agents_need_webhooks,
  'gemini-webhook-integration': gemini_webhook_integration,
  'stripe-webhook-guide': stripe_webhook_guide,
  'changelog-may-2026': changelog_may_2026,
  'introducing-hooksniff': introducing_hooksniff,
  'webhook-best-practices': webhook_best_practices,
  'fifo-webhook-delivery': fifo_webhook_delivery,
  'github-webhook-guide': github_webhook_guide,
  'cloudevents-standard': cloudevents_standard,
  'webhook-security-guide': webhook_security_guide,
  'shopify-webhook-incident-analysis': shopify_webhook_incident_analysis,
};


// Get ordered list of slugs for prev/next navigation
export const orderedSlugs = [
  'hooksniff-vs-svix-vs-hookdeck',
  'may-2026-changelog',
  'building-mcp-ready-webhooks',
  'webhook-integration-tutorial',
  'why-ai-agents-need-webhooks',
  'gemini-webhook-integration',
  'stripe-webhook-guide',
  'changelog-may-2026',
  'webhook-architecture-deep-dive',
  'customer-spotlight-ecommerce',
  'introducing-hooksniff',
  'webhook-best-practices',
  'fifo-webhook-delivery',
  'shopify-webhook-incident-analysis',
  'github-webhook-guide',
  'cloudevents-standard',
  'webhook-security-guide',
];

export function getRelatedPosts(currentSlug: string, tags: string[]) {
  return Object.entries(posts)
    .filter(([slug, post]) => slug !== currentSlug && post.tags.some(t => tags.includes(t)))
    .slice(0, 3)
    .map(([slug, post]) => ({ slug, ...post }));
}

export function getAdjacentPosts(currentSlug: string) {
  const idx = orderedSlugs.indexOf(currentSlug);
  const prev = idx > 0 ? { slug: orderedSlugs[idx - 1], ...posts[orderedSlugs[idx - 1]] } : null;
  const next = idx < orderedSlugs.length - 1 ? { slug: orderedSlugs[idx + 1], ...posts[orderedSlugs[idx + 1]] } : null;
  return { prev, next };
}

export function tokenizeCode(code: string, language: string): string {
  // Simple regex-based syntax highlighting
  let highlighted = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Comments
  highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="code-comment">$1</span>');
  highlighted = highlighted.replace(/(#.*$)/gm, '<span class="code-comment">$1</span>');
  highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="code-comment">$1</span>');

  // Strings
  highlighted = highlighted.replace(/("(?:[^"\\]|\\.)*")/g, '<span class="code-string">$1</span>');
  highlighted = highlighted.replace(/('(?:[^'\\]|\\.)*')/g, '<span class="code-string">$1</span>');
  highlighted = highlighted.replace(/(`(?:[^`\\]|\\.)*`)/g, '<span class="code-string">$1</span>');

  // Numbers
  highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="code-number">$1</span>');

  // Keywords by language
  const allKeywords: Record<string, string> = {
    javascript: 'const|let|var|function|async|await|return|if|else|switch|case|break|default|for|while|do|try|catch|throw|new|import|from|export|class|extends|this|typeof|instanceof|void|null|undefined|true|false|of|in',
    typescript: 'const|let|var|function|async|await|return|if|else|switch|case|break|default|for|while|do|try|catch|throw|new|import|from|export|class|extends|this|typeof|instanceof|void|null|undefined|true|false|of|in|type|interface|enum|implements|abstract|declare|namespace',
    python: 'def|class|import|from|return|if|elif|else|for|while|try|except|raise|with|as|in|not|and|or|is|None|True|False|self|async|await|lambda|yield|pass|break|continue|global|nonlocal',
    go: 'func|package|import|return|if|else|for|range|switch|case|default|var|const|type|struct|interface|map|chan|go|defer|select|break|continue|nil|true|false|error|string|int|bool|byte',
    rust: 'fn|let|mut|const|struct|enum|impl|trait|pub|use|mod|crate|self|super|match|if|else|for|while|loop|return|async|await|move|ref|type|where|dyn|unsafe|extern|static|true|false|Some|None|Ok|Err|Box|Vec|String|Option|Result',
    bash: 'if|then|else|elif|fi|for|while|do|done|case|esac|function|return|local|export|source|echo|exit|set|unset|readonly|shift|trap|eval|exec',
    sql: 'SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|INDEX|ALTER|DROP|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|NOT|IN|IS|NULL|AS|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|UNION|ALL|DISTINCT|PRIMARY|KEY|FOREIGN|REFERENCES|DEFAULT|NOW|UUID|JSONB|VARCHAR|BIGINT|INT|TIMESTAMPTZ|BOOLEAN|TEXT',
  };

  const kwPattern = allKeywords[language] || allKeywords['javascript'];

  // Apply keywords but avoid re-highlighting inside existing spans
  highlighted = highlighted.replace(
    new RegExp(`(<span[^>]*>.*?<\\/span>)|(\\b(?:${kwPattern})\\b)`, 'g'),
    (_match: string, span: string | undefined, kw: string | undefined) => {
      if (span) return span;
      return `<span class="code-keyword">${kw}</span>`;
    }
  );

  return highlighted;
}
