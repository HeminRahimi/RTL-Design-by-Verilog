/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  courseSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Part I — Foundations',
      collapsed: false,
      items: ['01-why-rtl', '02-tools'],
    },
    {
      type: 'category',
      label: 'Part II — Four Modeling Levels',
      collapsed: false,
      items: [
        '03-modeling-levels',
        '04-switch-level',
        '05-gate-level',
        '06-dataflow',
        '07-behavioral',
      ],
    },
    {
      type: 'category',
      label: 'Part III — Verification',
      collapsed: false,
      items: ['08-verification'],
    },
    {
      type: 'category',
      label: 'Part IV — Reference',
      collapsed: false,
      items: ['09-essential-concepts'],
    },
  ],
};

module.exports = sidebars;
