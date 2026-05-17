import type { Post } from '.../data';

export const post: Post = {
    title: 'How to Set Up GitHub Webhooks',
    date: '2026-04-15',
    category: 'Integration',
    readTime: '6 min',
    tags: ['github', 'integration', 'ci-cd'],
    author: 'HookSniff Team',
    content: `GitHub webhooks let you react to events in your repositories — pushes, pull requests, issues, deployments, and more.

### Setting Up

1. Go to Settings → Webhooks → Add webhook
2. Set Payload URL to your HookSniff endpoint
3. Choose Content type: application/json
4. Select events: push, pull_request, issues, deployment
5. Save

### Verifying GitHub Signatures

GitHub signs payloads with HMAC-SHA1 using your webhook secret. HookSniff verifies this automatically.

### Common Use Cases

- **CI/CD** — Trigger builds on push
- **Notifications** — Alert team on PR reviews
- **Automation** — Auto-merge dependabot PRs
- **Analytics** — Track commit frequency

### Code Example

\`\`\`go
func handleGitHubWebhook(w http.ResponseWriter, r *http.Request) {
    event := r.Header.Get("X-GitHub-Event")
    switch event {
    case "push":
        triggerBuild(payload)
    case "pull_request":
        reviewPR(payload)
    }
    w.WriteHeader(200)
}
\`\`\``,
};
