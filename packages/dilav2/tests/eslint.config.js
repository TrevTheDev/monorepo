import customConfig from 'eslint-config-custom'
/* eslint-disable no-undef */
export default {
  ...customConfig,
  settings: {
    node: {
      allowModules: ['vitest', 'tsup'],
    },
    'import/core-modules': ['vitest', 'tsup'],
  },
}
