// @ts-check

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'RTL Design with Verilog',
  tagline: 'A structured course from switch level to verification',
  url: 'https://rtl-verilog.pages.dev',
  baseUrl: '/',
  onBrokenLinks: 'warn',
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
          numberPrefixParser: false,
          sidebarPath: require.resolve('./sidebars.js'),
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
              { label: 'NAND (switch)', href: '/examples/switch_nand.v' },
              { label: 'NAND (gate)', href: '/examples/gate_nand.v' },
              { label: 'DFF (behavioral)', href: '/examples/behavioral_dff.v' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Hemin Rahimi.`,
      },
    }),
};

module.exports = config;
