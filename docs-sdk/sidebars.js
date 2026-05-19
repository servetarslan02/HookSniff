/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'quickstart/node',
        'quickstart/python',
        'quickstart/go',
        'quickstart/rust',
        'quickstart/ruby',
        'quickstart/java',
        'quickstart/kotlin',
        'quickstart/php',
        'quickstart/csharp',
        'quickstart/elixir',
        'quickstart/swift',
      ],
    },
    {
      type: 'category',
      label: 'How-To Guides',
      items: [
        'guides/webhook-verification',
        'guides/error-handling',
        'guides/pagination',
        'guides/streaming',
        'guides/migration-from-svix',
        'guides/real-world-examples',
      ],
    },
    'api-reference',
  ],
};

module.exports = sidebars;
