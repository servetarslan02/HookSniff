/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Quick Start',
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
      label: 'Guides',
      items: [
        'guides/webhook-verification',
        'guides/error-handling',
        'guides/pagination',
        'guides/migration',
      ],
    },
    'api-reference',
    {
      type: 'category',
      label: 'SDKs',
      items: [
        'sdks/node',
        'sdks/python',
        'sdks/go',
        'sdks/rust',
        'sdks/ruby',
        'sdks/java',
        'sdks/kotlin',
        'sdks/php',
        'sdks/csharp',
        'sdks/elixir',
        'sdks/swift',
      ],
    },
  ],
};

module.exports = sidebars;
