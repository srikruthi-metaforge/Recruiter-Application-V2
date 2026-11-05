export default {
  test: {
    environment: 'node',
    globals: true,
    include: ['src/**/*.spec.ts'],
    exclude: ['src/e2e-offers-notifications.spec.ts'],
  },
};
