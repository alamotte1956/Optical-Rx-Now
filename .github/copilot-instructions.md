# Optical Rx Now - Copilot Instructions

## Project Overview

Optical Rx Now is a privacy-first mobile application for managing optical prescriptions locally on the user's device. The architecture prioritizes user privacy by keeping all PHI (Protected Health Information) on the device while maintaining a minimal backend for anonymous analytics and affiliate partner management.

## Architecture Principles

### Privacy-First Design
- **NO PHI on backend**: All prescription and family member data MUST stay on the device
- **Local storage only**: Use AsyncStorage for all sensitive user data
- **Anonymous analytics**: Only track non-identifiable metrics (device IDs, app opens, clicks)
- **Backend scope**: Limited to analytics and affiliate partner management only

### Technology Stack
- **Frontend**: React Native with Expo framework, TypeScript
- **Backend**: Python with FastAPI, MongoDB for analytics storage
- **Testing**: pytest for Python, Jest for React Native/TypeScript

## Development Workflows

### Backend Development (Python/FastAPI)
- **Install dependencies**: `pip install -r backend/requirements.txt`
- **Run server**: `uvicorn backend.server:app --reload`
- **Run tests**: `pytest` (runs all Python tests)
- **Code formatting**: Use `black` for code formatting
- **Import sorting**: Use `isort` for import ordering
- **Linting**: Use `flake8` for code linting
- **Type checking**: Use `mypy` for static type checking

### Frontend Development (React Native/Expo)
- **Install dependencies**: `npm install` or `yarn install` in `frontend/` directory
- **Start development**: `npm start` or `yarn start`
- **Run on iOS**: `npm run ios` or `yarn ios`
- **Run on Android**: `npm run android` or `yarn android`
- **Run on Web**: `npm run web` or `yarn web`
- **Linting**: `npm run lint` or `yarn lint`

## Code Style Guidelines

### Python (Backend)
- Follow PEP 8 style guidelines
- Use type hints for all function parameters and return values
- Maximum line length: 88 characters (Black default)
- Use Pydantic models for request/response validation
- Always validate environment variables in production mode

### TypeScript (Frontend)
- Use TypeScript for all new React components
- Follow React Native best practices
- Use functional components with hooks
- Keep components small and focused
- Use AsyncStorage for local data persistence

## Security Requirements

### Critical Security Rules
- **NEVER** send PHI to the backend
- **ALWAYS** validate environment variables in production (`ENV=production`)
- **ALWAYS** require `ADMIN_KEY` for protected endpoints
- **ALWAYS** validate input data (device IDs, URLs, metadata)
- **ALWAYS** enforce rate limiting on analytics endpoints (60 req/min)
- **NEVER** hardcode credentials or API keys

### Input Validation
- Device IDs: 10-100 characters
- Event metadata: Maximum 1000 characters
- URLs: Must be valid HTTP/HTTPS
- MongoDB ObjectIDs: Validate before queries to prevent injection

## Testing Requirements

### Backend Testing
- Write tests using pytest
- Test all API endpoints
- Test rate limiting behavior
- Test admin authentication
- Test input validation
- Mock external dependencies (MongoDB)

### Frontend Testing
- Test components in isolation
- Test local storage functionality
- Verify no PHI is transmitted to backend
- Test offline functionality

## Database & Infrastructure

### MongoDB Indexes
- Automatically created on startup
- No manual migrations needed
- Optimized for analytics queries, device tracking, and affiliate lookups

### Environment Variables
- `ENV`: Environment mode (development, staging, production)
- `MONGO_URL`: MongoDB connection string
- `DB_NAME`: Database name
- `ADMIN_KEY`: Admin key for protected endpoints (REQUIRED in production)
- `ALLOWED_ORIGINS`: CORS allowed origins

## Common Patterns

### Adding New Analytics Events
1. Add event type to tracking endpoint validation
2. Ensure event metadata is anonymous (no PHI)
3. Update analytics dashboard to display new metric
4. Test rate limiting behavior

### Adding New Affiliate Partners
1. Use admin dashboard or POST `/api/affiliates` with admin key
2. Validate URL format
3. Set display order and category
4. Test activation/deactivation

### Privacy Compliance Checklist
- [ ] Verify no PHI leaves the device
- [ ] Confirm analytics are anonymous
- [ ] Validate CORS configuration
- [ ] Check admin key is secure in production
- [ ] Ensure rate limiting is enabled

## Deployment

### Production Checklist
- Set `ENV=production`
- Generate secure `ADMIN_KEY` using `openssl rand -hex 32`
- Configure `ALLOWED_ORIGINS` for production domains
- Verify no default/insecure keys are used
- Test CORS configuration
- Verify rate limiting is active

## Documentation
- Keep README.md updated with new features
- Document API changes in comments
- Update privacy policy if data collection changes
- Maintain deployment checklist in DEPLOYMENT.md
