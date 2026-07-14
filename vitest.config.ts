import { defineConfig } from 'vitest/config'

// Unit tests run in Node (migration + schema are pure JS, no DOM).
// Component/handler wiring is covered by the migration module tests,
// not by rendering React.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/__tests__/**/*.test.js'],
    globals: false,
  },
})
