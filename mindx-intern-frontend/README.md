# MindX Intern Frontend

Frontend application for MindX Intern using React + TypeScript + Vite with OpenID Connect authentication.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# API Base URL - Backend server URL
# Leave empty if backend and frontend are on same domain (uses relative paths)
# Or specify full URL like: http://localhost:8080
VITE_API_BASE_URL=

# Frontend Redirect URI - Where OAuth callback will be redirected to
# MUST match one of the redirect_uri configured in OpenID provider
# Allowed values:
#   - https://onboarding.mindx.edu.vn/auth/callback (production)
#   - http://localhost:3000/auth/callback (dev)
#   - http://localhost:5173/auth/callback (dev)
VITE_FRONTEND_REDIRECT_URI=https://onboarding.mindx.edu.vn/auth/callback

# OpenID Client ID
VITE_OPENID_CLIENT_ID=mindx-onboarding
```

**Important Notes:**
- `VITE_API_BASE_URL`: Leave empty if backend and frontend run on the same domain/port. Only specify if backend is on a different port/domain.
- `VITE_FRONTEND_REDIRECT_URI`: 
  - **For LOCAL DEVELOPMENT**: Use `http://localhost:5173/auth/callback` or `http://localhost:3000/auth/callback`
  - **For PRODUCTION**: Use `https://onboarding.mindx.edu.vn/auth/callback`
  - Must exactly match one of the redirect_uri values configured in the OpenID provider (provided by admin).
  - ⚠️ **Do NOT use production domain in local development** - it will cause DNS errors!

You can copy `env.example` to `.env` and update the values as needed.

## Features

- OpenID Connect authentication with MindX
- User authentication flow
- Protected routes
- User profile display

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your configuration (see Environment Variables above)

3. Start development server:
```bash
npm run dev
```

## OAuth Flow

### Login Flow:
1. **User clicks "Đăng nhập bằng MindX"**
   - Frontend calls: `GET /api/auth/login-url?redirectUri={VITE_FRONTEND_REDIRECT_URI}`
   - Backend returns authorization URL: `https://id-dev.mindx.edu.vn/auth?...` (from discovery document)

2. **Frontend redirects to OpenID provider**
   - Frontend redirects browser directly to the authorization URL from step 1
   - User authenticates on MindX OpenID provider

3. **OpenID provider redirects to frontend**
   - After authentication, OpenID provider redirects browser to frontend callback URL
   - URL: `{VITE_FRONTEND_REDIRECT_URI}?code=xxx&state=xxx`
   - Example: `https://onboarding.mindx.edu.vn/auth/callback?code=abc123&state=xyz789`

4. **Frontend exchanges code for user info**
   - Frontend calls: `POST /api/auth/callback` with:
     ```json
     {
       "code": "authorization_code",
       "state": "random_state",
       "redirectUri": "https://onboarding.mindx.edu.vn/auth/callback"
     }
     ```
   - Backend exchanges code → gets token → gets user info → saves to session → returns user info

5. **Frontend receives user info and redirects**
   - Frontend receives user info from callback API
   - Frontend redirects to welcome page

### User Info:
- After successful login, frontend can call `GET /api/auth/user/me` to get user from session

### Logout Flow:
- User clicks logout button
- Frontend calls: `POST /api/auth/logout`
- Backend clears session
- Frontend redirects to login page

## API Endpoints

The application uses the following backend endpoints:
- `GET /api/auth/login-url` - Get authorization URL from backend (returns OpenID provider URL)
- `POST /api/auth/callback` - Exchange authorization code for user info (main endpoint)
- `GET /api/auth/user/me` - Get current user information from session
- `GET /api/auth/check` - Check authentication status
- `POST /api/auth/logout` - Logout (clears session)
- `GET /api/auth/health` - Health check

---

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
