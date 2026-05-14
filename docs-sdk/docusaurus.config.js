// @ts-check
const { themes } = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'HookSniff SDK',
  tagline: 'Official SDKs for the HookSniff webhook delivery API',
  favicon: 'img/favicon.ico',
  url: 'https://docs.hooksniff.dev',
  baseUrl: '/',
  organizationName: 'servetarslan02',
  projectName: 'HookSniff',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'tr'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/servetarslan02/HookSniff/tree/main/docs-sdk/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'dark',
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'HookSniff',
        logo: {
          alt: 'HookSniff Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Docs',
          },
          {
            to: '/docs/quickstart/node',
            label: 'Quick Start',
            position: 'left',
          },
          {
            href: 'https://github.com/servetarslan02/HookSniff',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'SDKs',
            items: [
              { label: 'Node.js', to: '/docs/sdks/node' },
              { label: 'Python', to: '/docs/sdks/python' },
              { label: 'Go', to: '/docs/sdks/go' },
              { label: 'Rust', to: '/docs/sdks/rust' },
              { label: 'Ruby', to: '/docs/sdks/ruby' },
              { label: 'Java', to: '/docs/sdks/java' },
            ],
          },
          {
            title: 'More SDKs',
            items: [
              { label: 'Kotlin', to: '/docs/sdks/kotlin' },
              { label: 'PHP', to: '/docs/sdks/php' },
              { label: 'C#', to: '/docs/sdks/csharp' },
              { label: 'Elixir', to: '/docs/sdks/elixir' },
              { label: 'Swift', to: '/docs/sdks/swift' },
            ],
          },
          {
            title: 'Resources',
            items: [
              { label: 'API Reference', to: '/docs/api-reference' },
              { label: 'Webhook Verification', to: '/docs/guides/webhook-verification' },
              { label: 'GitHub', href: 'https://github.com/servetarslan02/HookSniff' },
              { label: 'Dashboard', href: 'https://hooksniff.vercel.app' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} HookSniff. Built with Docusaurus.`,
      },
      prism: {
        theme: themes.github,
        darkTheme: themes.dracula,
        additionalLanguages: ['rust', 'elixir', 'csharp', 'kotlin', 'swift', 'ruby', 'php'],
      },
    }),
};

module.exports = config;
