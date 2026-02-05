# Torture Testing Documentation

## Purpose and Goals

The torture/stress testing suite for Optical Rx Now is designed to validate the app's performance, stability, and data integrity under extreme conditions that might occur in real-world usage. These tests help identify:

- Performance bottlenecks with large datasets
- Memory leaks and resource management issues
- Race conditions in concurrent operations
- Data corruption risks
- Edge cases that might break the app
- Storage and encryption limitations

## Test Suites

### 1. Data Stress Tests (`data-stress.test.ts`)

**Purpose**: Validate data operations with large datasets and test AsyncStorage limits.

**Test Scenarios**:
- Creating 50+ family members rapidly
- Creating 100+ prescriptions across multiple family members
- Bulk delete operations (family member with 50+ prescriptions)
- Data persistence after creating large datasets
- Encryption/decryption performance with large datasets
- Search/filter performance with 100+ prescriptions
- AsyncStorage quota handling

**Performance Benchmarks**:
- Creating 50 family members: < 10 seconds
- Creating 100 prescriptions: < 30 seconds
- Deleting member with 50 prescriptions: < 10 seconds
- Deleting 50 individual prescriptions: < 10 seconds
- Encrypting/decrypting 100 members: < 5 seconds each
- Filtering 100 prescriptions by member: < 2 seconds
- Getting stats: < 1 second

### 2. Image Stress Tests (`image-stress.test.ts`)

**Purpose**: Validate image handling, encryption, and storage under stress.

**Test Scenarios**:
- Handling 50+ large images (5MB each)
- Various image sizes (10KB to 10MB)
- Image encryption/decryption performance
- Concurrent image encryption
- Image cleanup on prescription deletion
- Image cleanup when family member deleted
- Concurrent image loading
- Low storage scenarios
- Image data integrity through encryption
- Handling corrupted image data

**Performance Benchmarks**:
- Encrypting 10MB image: < 5 seconds
- Decrypting 10MB image: < 5 seconds
- Loading 10 images concurrently: < 3 seconds

### 3. Concurrent Operations Tests (`concurrent-operations.test.ts`)

**Purpose**: Detect race conditions and validate behavior under concurrent operations.

**Test Scenarios**:
- Rapid button clicking (prevent duplicate actions)
- Simultaneous create/update/delete operations
- Concurrent image uploads
- Race conditions in state management
- Mixed operations on same data
- Concurrent biometric auth requests
- Maximum concurrency stress test (50 operations)

**Key Validations**:
- Operation queue prevents race conditions
- No duplicate entries from rapid clicks
- Data consistency maintained during concurrent operations
- Unique IDs for all created entities
- Proper handling of deletion race conditions

### 4. Memory Stress Tests (`memory-stress.test.ts`)

**Purpose**: Monitor memory usage and detect leaks.

**Test Scenarios**:
- Memory usage during bulk operations (100+ prescriptions)
- Memory cleanup after deleting data
- Memory leak detection through repeated create/delete cycles
- No memory growth from repeated reads
- Large list loading performance
- Filtering large lists efficiently
- Image memory management
- App state transitions (restart simulation)
- Resource cleanup verification

**Performance Benchmarks**:
- Loading 100 prescriptions: < 2 seconds
- Filtering 100 prescriptions 10 times: < 1 second
- Memory growth in create/delete cycles: < 50%
- Storage size stable during repeated reads

### 5. Offline Stress Tests (`offline-stress.test.ts`)

**Purpose**: Validate functionality when network is unavailable.

**Test Scenarios**:
- Creating 100+ items while offline
- Rapid offline operations
- Offline → online transitions
- Multiple offline/online cycles
- Data persistence created offline
- Encryption/decryption offline
- Bulk deletes while offline
- Mixed operations offline
- Encrypted backup creation offline
- Offline performance benchmarks
- Referential integrity offline
- Concurrent offline operations

**Performance Benchmarks**:
- Creating 100 prescriptions offline: < 30 seconds
- Loading data offline: < 2 seconds

## Running the Tests

### Run All Torture Tests

```bash
cd frontend
npm run test:torture
```

This runs all tests in the `__tests__/torture/` directory with verbose output.

### Run Specific Test Suite

```bash
npm test __tests__/torture/data-stress.test.ts
npm test __tests__/torture/image-stress.test.ts
npm test __tests__/torture/concurrent-operations.test.ts
npm test __tests__/torture/memory-stress.test.ts
npm test __tests__/torture/offline-stress.test.ts
```

### Watch Mode (for development)

```bash
npm run test:torture:watch
```

### Generate Coverage Report

```bash
npm run test:torture:coverage
```

Coverage reports are generated in the `coverage/` directory.

### Run All Tests (Including Unit Tests)

```bash
npm test
```

## Interpreting Results

### Successful Test Run

```
PASS  __tests__/torture/data-stress.test.ts
  Data Stress Tests
    ✓ should create 50 family members rapidly (1234ms)
    ✓ should create 100+ prescriptions (5678ms)
    ...

Test Suites: 5 passed, 5 total
Tests:       42 passed, 42 total
Time:        123.456s
```

### Performance Metrics

Tests output performance metrics:
```
✓ Created 50 family members in 2345ms
✓ Created 100 prescriptions in 12345ms
✓ Memory reclaimed - AsyncStorage: 123456 bytes, FileSystem: 234567 bytes
```

### Failed Tests

When a test fails, you'll see:
```
FAIL  __tests__/torture/data-stress.test.ts
  ● Data Stress Tests › should create 50 family members rapidly
    
    Operation took 12000ms, expected < 10000ms
```

This indicates a performance benchmark was not met or an assertion failed.

## Performance Benchmarks

### Summary Table

| Operation | Benchmark | Test Suite |
|-----------|-----------|------------|
| Create 50 family members | < 10s | Data Stress |
| Create 100 prescriptions | < 30s | Data Stress |
| Delete member + 50 prescriptions | < 10s | Data Stress |
| Encrypt/decrypt 10MB image | < 5s each | Image Stress |
| Load 100 prescriptions | < 2s | Memory Stress |
| 50 concurrent operations | < 30s | Concurrent Ops |
| Create 100 items offline | < 120s | Offline Stress |

### Storage Limits

- AsyncStorage mock: 50-100MB (configurable)
- FileSystem mock: 100-500MB (configurable)
- Image size limit: 50MB per image (configurable)

## Adding New Torture Tests

### 1. Create a New Test File

```typescript
// __tests__/torture/my-new-stress.test.ts
import { /* services */ } from '../../services/...';
import { /* test helpers */ } from '../utils/test-helpers';
import { /* mock generators */ } from '../utils/mock-data-generator';

// Set up mocks
const mockAsyncStorage = new MockAsyncStorage(100);
// ... other mocks

jest.mock('@react-native-async-storage/async-storage', () => ({
  // ... mock implementation
}));

describe('My New Stress Tests', () => {
  beforeEach(async () => {
    await clearAllTestData(mockAsyncStorage, mockFileSystem);
  });

  it('should handle specific stress scenario', async () => {
    // Arrange
    const testData = generateBulkFamilyMembers(100);
    
    // Act
    const metrics = startPerformanceTracking();
    // ... perform operations
    const finalMetrics = stopPerformanceTracking(metrics);
    
    // Assert
    expect(result).toBeDefined();
    assertPerformance(finalMetrics, 5000, 'Operation name');
  }, 60000); // Timeout in ms
});
```

### 2. Use Test Utilities

```typescript
// Performance tracking
const metrics = startPerformanceTracking();
// ... operations
const final = stopPerformanceTracking(metrics, operationCount);
assertPerformance(final, maxMs, 'Operation name');

// Generate test data
const members = generateBulkFamilyMembers(50);
const prescriptions = generateBulkPrescriptions(memberId, 100, 1024);

// Batch operations
const results = await batchOperation(items, async (item) => {
  return await processItem(item);
}, 10); // Batch size

// Wait for conditions
await waitFor(() => someCondition(), 5000);
```

### 3. Mock Native Modules

```typescript
jest.mock('expo-image-picker', () => createMockImagePicker());
jest.mock('expo-local-authentication', () => createMockLocalAuth());
```

## Troubleshooting

### Test Timeout Errors

**Problem**: `Exceeded timeout of 60000 ms for a test`

**Solution**:
- Increase the timeout in the test: `it('test', async () => { ... }, 120000);`
- Optimize the test to run faster
- Check if operations are stuck in an infinite loop

### Memory Issues

**Problem**: Tests fail with out-of-memory errors

**Solution**:
- Reduce the dataset size for local testing
- Increase Node.js memory: `NODE_OPTIONS=--max_old_space_size=4096 npm test`
- Clear data more frequently in tests

### Mock Storage Quota Exceeded

**Problem**: `AsyncStorage quota exceeded`

**Solution**:
- Increase mock storage size: `new MockAsyncStorage(200)` for 200MB
- Clear storage between tests in `beforeEach`
- Reduce image sizes in tests

### Flaky Tests

**Problem**: Tests pass sometimes, fail other times

**Solution**:
- Add delays for async operations: `await delay(100)`
- Use `waitFor` instead of fixed delays
- Check for race conditions in test setup
- Ensure proper cleanup in `beforeEach`

### File System Errors

**Problem**: File not found or cannot write file

**Solution**:
- Verify mock file system is properly initialized
- Check file paths are correct
- Ensure directory exists before creating files

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Torture Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: cd frontend && npm ci
      - name: Run torture tests
        run: cd frontend && npm run test:torture
      - name: Upload coverage
        uses: codecov/codecov-action@v2
        with:
          directory: ./frontend/coverage
```

### Setting Timeouts for CI

For CI environments, you may want longer timeouts:

```javascript
// jest.config.js
module.exports = {
  testTimeout: process.env.CI ? 120000 : 60000,
  // ...
};
```

## Best Practices

### Writing Torture Tests

1. **Clear and descriptive names**: Test names should explain what stress scenario is being tested
2. **Realistic scenarios**: Test cases should reflect actual user behavior at scale
3. **Proper cleanup**: Always clean up test data in `beforeEach` or `afterEach`
4. **Performance benchmarks**: Include assertions for performance expectations
5. **Error handling**: Test both success and failure scenarios
6. **Deterministic**: Tests should produce same results each run

### Test Data Generation

1. **Use mock generators**: Don't hardcode test data, use generators
2. **Vary sizes**: Test with different data sizes (small, medium, large)
3. **Edge cases**: Include special characters, very long strings, etc.
4. **Realistic data**: Use realistic names, dates, and relationships

### Performance Monitoring

1. **Track metrics**: Always measure time and resource usage
2. **Set benchmarks**: Define acceptable performance thresholds
3. **Log results**: Output performance metrics for comparison
4. **Compare runs**: Track performance over time to detect regressions

## Maintenance

### Updating Benchmarks

As the app improves, update performance benchmarks:

1. Run tests and note actual performance
2. Update benchmark values in tests
3. Document changes in PR/commit
4. Consider device/environment differences

### Adding New Scenarios

When adding new features:

1. Add corresponding stress tests
2. Consider edge cases and failure modes
3. Test with large datasets
4. Verify memory management

### Regular Review

Periodically review torture tests:

- Remove obsolete tests
- Update benchmarks based on performance improvements
- Add tests for new features
- Refactor tests for maintainability

## Support

For questions or issues with torture tests:

1. Check this documentation first
2. Review existing tests for examples
3. Check troubleshooting section
4. Consult test utilities documentation
5. Review mock implementations

## Future Enhancements

Potential improvements to torture testing:

- **Performance tracking dashboard**: Visualize trends over time
- **Automated benchmark tuning**: Adjust benchmarks based on historical data
- **Platform-specific tests**: iOS vs Android differences
- **Real device testing**: Run on actual devices via Detox
- **Load testing tools**: Integrate with external load testing services
- **Memory profiling**: More detailed memory usage analysis
- **Stress test generator**: Tool to generate new stress tests
