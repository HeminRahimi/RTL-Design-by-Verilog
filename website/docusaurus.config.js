// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'RTL Design with Verilog',
  tagline: 'A structured course from switch level to verification',
  url: 'https://HeminRahimi.github.io',
  baseUrl: '/RTL-Design-by-Verilog/',
  organizationName: 'HeminRahimi',
  projectName: 'RTL-Design-by-Verilog',
  trailingSlash: true,
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          numberPrefixParser: false,
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'RTL Design with Verilog',
        items: [
          {
            href: 'https://github.com/HeminRahimi/RTL-Design-by-Verilog',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Course',
            items: [{ label: 'Home', to: '/' }],
          },
          {
            title: 'Examples',
            items: [
              { label: 'NAND (switch)', href: 'https://HeminRahimi.github.io/RTL-Design-by-Verilog/examples/switch_nand.v' },
              { label: 'NAND (gate)', href: 'https://HeminRahimi.github.io/RTL-Design-by-Verilog/examples/gate_nand.v' },
              { label: 'DFF (behavioral)', href: 'https://HeminRahimi.github.io/RTL-Design-by-Verilog/examples/behavioral_dff.v' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Hemin Rahimi.`,
      },
    }),
};

module.exports = config;
