# Getting Started with Optical Rx Now

Welcome! You've successfully cloned the Optical Rx Now repository. This guide will walk you through the next steps to get the application running on your local machine.

## What is Optical Rx Now?

Optical Rx Now is a **privacy-first mobile application** for managing optical prescriptions locally on your device. The app architecture ensures:
- All prescription and family member data stays **100% local** on the user's device
- The backend only handles anonymous analytics and affiliate partner links
- **No Protected Health Information (PHI)** is transmitted to any server

## Project Structure

```
Optical-Rx-Now/
├── backend/          # FastAPI backend (analytics & affiliate management)
├── frontend/         # React Native + Expo mobile app
├── tests/            # Test files
├── README.md         # Project overview
├── DEPLOYMENT.md     # Deployment instructions
└── GETTING_STARTED.md # This file
```

## Prerequisites

Before you begin, ensure you have the following installed:

### For Backend Development
- **Python 3.8+** ([Download](https://www.python.org/downloads/))
- **pip** (comes with Python)
- **MongoDB** (local or MongoDB Atlas account)
  - Local: [MongoDB Community Edition](https://www.mongodb.com/try/download/community)
  - Cloud: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free tier available)

### For Frontend Development
- **Node.js 18+** and **npm** ([Download](https://nodejs.org/))
- **Expo CLI**: `npm install -g expo-cli`
- **iOS Simulator** (macOS only) or **Android Emulator**
  - iOS: [Xcode](https://developer.apple.com/xcode/)
  - Android: [Android Studio](https://developer.android.com/studio)
- **Expo Go** app on your phone (optional, for testing on real device)

---

## Quick Start (Recommended)

### Option 1: Run Backend Only (For Backend Developers)

If you're working on the backend analytics and affiliate features:

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your settings:
   ```env
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=optical_rx_now
   ADMIN_KEY=dev-admin-key-change-in-production
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:19006
   ENV=development
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

5. **Run the backend server**
   ```bash
   uvicorn server:app --reload --port 8000
   ```

6. **Test the backend**
   Open http://localhost:8000/docs in your browser to see the API documentation.

7. **Test analytics endpoint**
   ```bash
   curl -X POST http://localhost:8000/api/analytics/track \
     -H "Content-Type: application/json" \
     -d '{"event":"test","deviceId":"test123","timestamp":"2026-02-03T00:00:00Z"}'
   ```

---

### Option 2: Run Frontend Only (For Mobile Developers)

If you're working on the mobile app UI and features:

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env`:
   ```env
   EXPO_PUBLIC_BACKEND_URL=http://localhost:8000
   ```
   
   > **Note:** If you're not running the backend locally, you can use a deployed backend URL or skip this step (the app will work without a backend for core prescription features).

4. **Start the Expo development server**
   ```bash
   npm start
   ```

5. **Run the app**
   
   You'll see options to open the app:
   
   - **Press `i`** - Open in iOS Simulator (macOS only)
   - **Press `a`** - Open in Android Emulator
   - **Press `w`** - Open in web browser
   - **Scan QR code** - Open in Expo Go app on your phone

6. **Test core features**
   - Add a family member
   - Take/upload a prescription photo
   - View and manage prescriptions
   - All data stays local on your device!

---

### Option 3: Run Full Stack (Backend + Frontend)

For full-stack development:

1. **Start the backend** (in one terminal)
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your settings
   uvicorn server:app --reload --port 8000
   ```

2. **Start the frontend** (in another terminal)
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env to point to backend
   npm start
   ```

3. **Open admin dashboard** (optional)
   ```bash
   open frontend/admin-dashboard.html
   ```
   
   Configure:
   - Admin Key: Use the same key from your backend `.env`
   - API URL: `http://localhost:8000/api`

---

## Running Tests

### Backend Tests

```bash
cd backend
pip install -r requirements.txt

# Run all tests
pytest

# Run specific test files
pytest backend_test.py
pytest test_backend_routes.py
pytest test_analytics_backend.py

# Run with coverage
pytest --cov=backend --cov-report=html
```

### Frontend Tests

```bash
cd frontend
npm install

# Run linter
npm run lint

# Type checking
npx tsc --noEmit
```

---

## Development Workflow

### Typical Development Day

1. **Pull latest changes**
   ```bash
   git pull origin main
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Edit backend files in `backend/`
   - Edit frontend files in `frontend/app/`, `frontend/components/`, etc.

4. **Test your changes**
   - Backend: Run pytest
   - Frontend: Test in simulator/emulator

5. **Commit and push**
   ```bash
   git add .
   git commit -m "Add your feature description"
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request** on GitHub

---

## Common Tasks

### Add a New Backend Endpoint

1. Edit `backend/server.py`
2. Add your route function
3. Add tests in `backend/tests/`
4. Run tests: `pytest`
5. Test manually: Visit http://localhost:8000/docs

### Add a New Screen to Mobile App

1. Create a new file in `frontend/app/`
2. Use Expo Router file-based routing
3. Example: `frontend/app/settings.tsx` creates `/settings` route
4. Test in simulator

### Modify the Admin Dashboard

1. Edit `frontend/admin-dashboard.html`
2. Open in browser: `open frontend/admin-dashboard.html`
3. Test with your local backend

---

## Troubleshooting

### Backend Issues

**Problem:** `ModuleNotFoundError: No module named 'fastapi'`
```bash
# Solution: Install dependencies
cd backend
pip install -r requirements.txt
```

**Problem:** `pymongo.errors.ServerSelectionTimeoutError`
```bash
# Solution: Start MongoDB
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Linux
```

**Problem:** Port 8000 already in use
```bash
# Solution: Use a different port
uvicorn server:app --reload --port 8001
```

### Frontend Issues

**Problem:** `Error: Cannot find module`
```bash
# Solution: Install dependencies
cd frontend
npm install
```

**Problem:** Metro bundler cache issues
```bash
# Solution: Clear cache
npx expo start -c
```

**Problem:** Simulator/Emulator not opening
```bash
# iOS: Ensure Xcode Command Line Tools installed
xcode-select --install

# Android: Ensure Android SDK and emulator are set up
# Open Android Studio → AVD Manager → Create Virtual Device
```

**Problem:** App crashes on device
```bash
# Solution: Check logs
npx expo start
# Then press 'j' to open debugger
```

---

## Next Steps

Now that you have the project running, here are some next steps:

### 1. Explore the Codebase
- **Backend:** Review `backend/server.py` to understand the API
- **Frontend:** Check out `frontend/app/` for screens and routing
- **Components:** Browse `frontend/components/` for reusable UI components

### 2. Read the Documentation
- [README.md](./README.md) - Project overview and architecture
- [DEPLOYMENT.md](./DEPLOYMENT.md) - How to deploy to production
- [frontend/README.md](./frontend/README.md) - Frontend-specific details

### 3. Pick a Task
- Browse open issues on GitHub
- Look for "good first issue" labels
- Review the project board/roadmap

### 4. Join the Community
- Ask questions in discussions
- Review pull requests
- Share your ideas for improvements

### 5. Deploy Your Changes
When you're ready to deploy:
- **Backend:** See [DEPLOYMENT.md](./DEPLOYMENT.md) for Railway, Render, Fly.io, or Heroku
- **Frontend:** Use Expo Application Services (EAS) for building mobile apps
- **Testing:** Use Expo Go for quick testing, or create development builds

---

## Project Philosophy

### Privacy First
- No prescription data is ever sent to the backend
- All sensitive information stays on the user's device
- Backend only handles anonymous analytics and affiliate links

### Security
- Rate limiting on analytics endpoints
- Admin authentication for protected routes
- Input validation on all API endpoints
- Environment-based security controls

### Compliance
- No HIPAA requirements (no PHI on servers)
- iOS App Store compliant (ATT)
- Google Play compliant (Data Safety)

---

## Useful Commands Reference

### Backend
```bash
# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn server:app --reload

# Run tests
pytest

# Format code
black .
isort .

# Lint code
flake8
mypy server.py
```

### Frontend
```bash
# Install dependencies
npm install

# Start dev server
npm start

# Run on specific platform
npm run ios
npm run android
npm run web

# Lint
npm run lint

# Build for production (requires EAS account)
eas build --platform ios
eas build --platform android
```

---

## Getting Help

- **Documentation Issues:** Open an issue on GitHub
- **Code Questions:** Create a discussion on GitHub
- **Bugs:** Report with steps to reproduce
- **Feature Requests:** Submit detailed proposals

---

## Contributing

We welcome contributions! Before you start:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

See `CONTRIBUTING.md` for detailed guidelines (if available).

---

## Resources

### Backend Resources
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [MongoDB Python Driver](https://pymongo.readthedocs.io/)
- [Uvicorn Documentation](https://www.uvicorn.org/)

### Frontend Resources
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)

### Deployment Resources
- [Railway](https://railway.app/)
- [Render](https://render.com/)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [EAS Build](https://docs.expo.dev/build/introduction/)

---

**Happy Coding! 🚀**

If you run into any issues not covered here, please open an issue or start a discussion on GitHub.
