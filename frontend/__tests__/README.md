# Test Suite Overview

This directory contains the comprehensive test suite for the Optical Rx Now application.

## Directory Structure

```
__tests__/
├── torture/              # Stress/torture tests for performance validation
│   ├── data-stress.test.ts              # Data operations under heavy load
│   ├── image-stress.test.ts             # Image handling stress tests
│   ├── concurrent-operations.test.ts    # Race condition & concurrency tests
│   ├── memory-stress.test.ts            # Memory management & leak detection
│   └── offline-stress.test.ts           # Offline functionality tests
└── utils/                # Shared test utilities
    ├── test-helpers.ts              # Mock implementations & utilities
    ├── mock-data-generator.ts       # Bulk test data generation
    └── common-mocks.ts              # Reusable mock modules
```

## Test Suites

### Torture Tests (`torture/`)

High-volume stress tests that validate app behavior under extreme conditions:

- **data-stress.test.ts**: Tests with 50+ family members, 100+ prescriptions
- **image-stress.test.ts**: Tests with 50+ large images (5-10MB each)
- **concurrent-operations.test.ts**: Validates race condition handling
- **memory-stress.test.ts**: Detects memory leaks and validates cleanup
- **offline-stress.test.ts**: Tests offline data operations

### Test Utilities (`utils/`)

Reusable utilities for all tests:

- **test-helpers.ts**: Mock storage, performance tracking, async helpers
- **mock-data-generator.ts**: Generate realistic bulk test data
- **common-mocks.ts**: Mock implementations for native modules

## Running Tests

### All Torture Tests
```bash
npm run test:torture
```

### Specific Test Suite
```bash
npm test __tests__/torture/data-stress.test.ts
```

### Watch Mode
```bash
npm run test:torture:watch
```

### With Coverage
```bash
npm run test:torture:coverage
```

## Documentation

See the following files for more information:

- **[TORTURE_TESTING.md](../TORTURE_TESTING.md)**: Complete guide to torture testing
- **[IMPLEMENTATION_STATUS.md](../IMPLEMENTATION_STATUS.md)**: Implementation details and status

## Performance Benchmarks

The torture tests validate these performance targets:

| Operation | Target | Test Suite |
|-----------|--------|------------|
| Create 50 family members | < 10s | data-stress |
| Create 100 prescriptions | < 30s | data-stress |
| Delete member + 50 prescriptions | < 10s | data-stress |
| Encrypt/decrypt 10MB image | < 5s | image-stress |
| Load 100 prescriptions | < 2s | memory-stress |
| 50 concurrent operations | < 30s | concurrent-ops |

## Adding New Tests

1. Create test file in appropriate directory
2. Import utilities from `utils/`
3. Set up mocks in `beforeEach`
4. Write test cases with performance tracking
5. Update documentation

Example:
```typescript
import { MockAsyncStorage, startPerformanceTracking } from '../utils/test-helpers';
import { generateBulkFamilyMembers } from '../utils/mock-data-generator';

const mockStorage = new MockAsyncStorage(100);

describe('My Test Suite', () => {
  beforeEach(async () => {
    await mockStorage.clear();
  });

  it('should handle bulk operations', async () => {
    const metrics = startPerformanceTracking();
    const data = generateBulkFamilyMembers(100);
    
    // ... test logic
    
    const final = stopPerformanceTracking(metrics);
    assertPerformance(final, 5000, 'Bulk operation');
  });
});
```

## Best Practices

1. **Clean up after tests**: Always clear mock data in `beforeEach` or `afterEach`
2. **Use realistic data**: Use mock generators for test data
3. **Track performance**: Use performance utilities to validate benchmarks
4. **Test edge cases**: Include boundary conditions and error scenarios
5. **Keep tests isolated**: Tests should not depend on each other
6. **Document expectations**: Add comments explaining what each test validates

## Troubleshooting

### Tests Timeout
- Increase timeout in test: `it('test', async () => { ... }, 120000)`
- Check for hanging async operations
- Verify mocks are properly set up

### Module Not Found
- Ensure all native modules are mocked in test file or jest.setup.js
- Check import paths are correct

### Flaky Tests
- Add proper wait conditions with `waitFor`
- Ensure cleanup happens between tests
- Check for race conditions in test setup

## Contributing

When adding new tests:
1. Follow existing patterns and structure
2. Update this README if adding new categories
3. Update TORTURE_TESTING.md with new test descriptions
4. Ensure tests pass before committing
5. Include performance benchmarks where applicable
