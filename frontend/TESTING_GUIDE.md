# Testing Guide - Optical Rx Now

## Overview

This guide covers all aspects of testing for the Optical Rx Now application, including local testing, CI/CD integration, and release procedures.

## Table of Contents

1. [Local Testing](#local-testing)
2. [Test Types](#test-types)
3. [CI/CD Testing Workflow](#cicd-testing-workflow)
4. [Pre-Submission Checklist](#pre-submission-checklist)
5. [Coverage Requirements](#coverage-requirements)
6. [Performance Benchmarks](#performance-benchmarks)
7. [Manual Testing](#manual-testing)
8. [Release Testing](#release-testing)

## Local Testing

### Prerequisites

```bash
cd frontend
npm install
```

### Running Tests

**All tests:**
```bash
npm test
```

**Unit tests only:**
```bash
npm run test:unit
```

**Integration tests only:**
```bash
npm run test:integration
```

**Torture/stress tests:**
```bash
npm run test:torture
```

**With coverage:**
```bash
npm run test:coverage
```

**Watch mode (for development):**
```bash
npm run test:watch
```

### Running Specific Test Files

```bash
# Single test file
npm test __tests__/unit/services/localStorage.test.ts

# Pattern matching
npm test -- --testPathPattern=encryption
```

## Test Types

### 1. Unit Tests (`__tests__/unit/`)

Test individual functions and modules in isolation.

**Coverage:**
- `services/localStorage.test.ts` - CRUD operations, data persistence
- `services/encryption.test.ts` - Encryption/decryption, key management
- `services/authentication.test.ts` - Biometric auth, session management
- `utils/storage.test.ts` - Safe storage, backup/recovery

**Running:**
```bash
npm run test:unit
```

### 2. Integration Tests (`__tests__/integration/`)

Test workflows and component interactions.

**Coverage:**
- `prescription-workflow.test.ts` - Complete prescription lifecycle
- `offline-persistence.test.ts` - Offline data handling, app restarts

**Running:**
```bash
npm run test:integration
```

### 3. Torture/Stress Tests (`__tests__/torture/`)

Validate performance and stability under extreme conditions.

**Coverage:**
- `data-stress.test.ts` - Large dataset operations (50+ members, 100+ prescriptions)
- `image-stress.test.ts` - Image handling (50 large images, concurrent encryption)
- `concurrent-operations.test.ts` - Race condition detection, rapid operations
- `memory-stress.test.ts` - Memory leak detection, bulk operations
- `offline-stress.test.ts` - Offline functionality at scale

**Running:**
```bash
npm run test:torture
```

**Note:** Torture tests use longer timeouts (120s in CI, 60s locally).

## CI/CD Testing Workflow

### Automated Testing

Tests run automatically on:
- Every push to `main` or `develop` branches
- Every pull request to `main` or `develop`
- Only when frontend files change

### Workflow Jobs

1. **Unit Tests** (10 min timeout)
   - Runs unit tests with coverage
   - Uploads coverage to Codecov

2. **Integration Tests** (15 min timeout)
   - Runs integration tests sequentially
   - Validates workflows

3. **Torture Tests** (30 min timeout)
   - Runs stress tests with increased memory
   - Validates performance benchmarks

4. **Lint** (5 min timeout)
   - Code style and quality checks

### Viewing CI Results

1. Navigate to the PR or commit in GitHub
2. Click "Checks" tab
3. View results for each job
4. Expand failed tests to see details

## Pre-Submission Checklist

Before creating a PR or releasing:

- [ ] All unit tests pass locally: `npm run test:unit`
- [ ] All integration tests pass locally: `npm run test:integration`
- [ ] Torture tests complete successfully: `npm run test:torture`
- [ ] Code coverage meets 80% threshold: `npm run test:coverage`
- [ ] Linter passes with no errors: `npm run lint`
- [ ] Manual testing completed (see below)
- [ ] No console errors or warnings
- [ ] Performance benchmarks met (see below)

### Quick Validation

```bash
# Run complete test suite as CI does
npm run test:ci
```

## Coverage Requirements

### Global Thresholds

- **Lines:** 80%
- **Functions:** 75%
- **Branches:** 70%
- **Statements:** 80%

### Viewing Coverage

```bash
npm run test:coverage
```

Coverage report will be in `frontend/coverage/lcov-report/index.html`.

### What's Covered

- `services/**/*.{ts,tsx}` - All service modules
- `utils/**/*.{ts,tsx}` - All utility modules
- `app/**/*.{ts,tsx}` - All app screens and components

### Excluded from Coverage

- Type definition files (`*.d.ts`)
- Node modules
- Test files themselves
- Configuration files

## Performance Benchmarks

Torture tests validate these performance targets:

| Operation | Benchmark | Test Suite |
|-----------|-----------|------------|
| Create 50 family members | < 10s | Data Stress |
| Create 100 prescriptions | < 30s | Data Stress |
| Delete 50 prescriptions | < 10s | Data Stress |
| Encrypt 10MB image | < 5s | Image Stress |
| Decrypt 10MB image | < 5s | Image Stress |
| Load 100 prescriptions | < 2s | Memory Stress |
| 50 concurrent operations | < 30s | Concurrent Ops |
| Create 100 items offline | < 30s | Offline Stress |

### Monitoring Performance

Tests log performance metrics:
```
✓ Created 50 family members in 2345ms
✓ Encrypted 10MB image in 3210ms
```

## Manual Testing

### Essential Scenarios

1. **Create Family Member**
   - Open app
   - Navigate to Family tab
   - Tap "Add Member"
   - Enter name and relationship
   - Verify member appears in list

2. **Add Prescription**
   - Select a family member
   - Tap "Add Prescription"
   - Choose eyeglass or contact
   - Take/select photo
   - Add notes
   - Verify prescription saves

3. **View Prescription**
   - Tap on a prescription
   - Verify image loads correctly
   - Verify all details display

4. **Delete Prescription**
   - Swipe on prescription
   - Tap delete
   - Confirm deletion
   - Verify removed from list

5. **Delete Family Member**
   - Swipe on family member
   - Tap delete
   - Confirm deletion
   - Verify all associated prescriptions also deleted

6. **Offline Mode**
   - Enable airplane mode
   - Create family member
   - Add prescription
   - Disable airplane mode
   - Verify data persists

7. **Biometric Authentication**
   - Lock app (background for 5+ minutes)
   - Open app
   - Verify biometric prompt appears
   - Authenticate
   - Verify access granted

### Device-Specific Testing

Test on:
- [ ] iPhone (iOS 16+)
- [ ] iPad (iOS 16+)
- [ ] Android phone (Android 11+)
- [ ] Android tablet (Android 11+)

### Edge Cases

- Very long names (100+ characters)
- Special characters in notes
- Multiple rapid taps (prevent duplicates)
- Low storage scenarios
- Multiple family members (20+)
- Many prescriptions per member (50+)

## Release Testing

### Pre-Release Validation

1. **Full Test Suite**
   ```bash
   npm run test:ci
   ```

2. **Manual Smoke Tests**
   - Complete all essential scenarios
   - Test on physical devices
   - Verify no regressions

3. **Performance Validation**
   ```bash
   npm run test:torture
   ```
   - Verify all benchmarks met
   - Check for performance regressions

4. **Build Validation**
   ```bash
   npm run lint
   expo build:ios --release-channel production
   expo build:android --release-channel production
   ```

5. **Security Scan**
   - Run dependency audit
   - Check for vulnerabilities
   - Verify encryption works

### Release Checklist

- [ ] All CI/CD checks pass
- [ ] Coverage ≥ 80%
- [ ] Performance benchmarks met
- [ ] Manual testing complete
- [ ] No known bugs
- [ ] Documentation updated
- [ ] Version number bumped
- [ ] CHANGELOG updated
- [ ] TestFlight/Internal testing passed

## Troubleshooting

### Tests Timeout

**Problem:** Tests exceed 60s/120s timeout

**Solutions:**
- Reduce dataset size for local testing
- Increase timeout for specific test: `it('test', async () => {...}, 180000)`
- Check for infinite loops or stuck promises

### Tests Fail in CI But Pass Locally

**Problem:** Tests behave differently in CI environment

**Solutions:**
- Set `CI=true` locally: `CI=true npm test`
- Check for timing-dependent tests
- Verify mocks work in CI environment
- Review CI logs for specific errors

### Coverage Below Threshold

**Problem:** Coverage doesn't meet 80%

**Solutions:**
- Identify uncovered lines: Open `coverage/lcov-report/index.html`
- Add tests for uncovered code
- Remove dead code
- Exclude files that shouldn't be covered

### Mock Data Issues

**Problem:** Mocks don't behave as expected

**Solutions:**
- Clear mocks in `beforeEach()`
- Verify mock implementations match actual service
- Check mock return values
- Use `jest.clearAllMocks()` between tests

## Support

For questions or issues with testing:

1. Check this guide first
2. Review existing tests for examples
3. Check Jest documentation
4. Review test output and error messages
5. Consult team members

## Best Practices

1. **Write tests first** - TDD when possible
2. **Keep tests focused** - One concept per test
3. **Use descriptive names** - Test names should explain what's being tested
4. **Clean up** - Always reset state in `beforeEach()`
5. **Mock external dependencies** - Keep tests isolated
6. **Test edge cases** - Not just happy paths
7. **Keep tests fast** - Avoid unnecessary delays
8. **Document complex tests** - Add comments for clarity

## Continuous Improvement

- Review test failures and add regression tests
- Update benchmarks as performance improves
- Add tests for new features immediately
- Refactor tests to reduce duplication
- Keep documentation current
