# BisnisMu Client

React frontend for the BisnisMu business management application.

## Environment Variables

Create a `.env` file in the client directory with:

```
VITE_API_URL=https://your-server-domain.railway.app
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

## Development

```bash
npm install
npm run dev
```

## Deployment on Vercel

1. Connect your repository to Vercel
2. Set the root directory to `client`
3. Add environment variables in Vercel dashboard:
   - `VITE_API_URL`: Your Railway server URL
   - `VITE_FIREBASE_API_KEY`: Firebase API key
   - `VITE_FIREBASE_PROJECT_ID`: Firebase project ID
   - `VITE_FIREBASE_APP_ID`: Firebase app ID
4. Build command: `npm run build`
5. Output directory: `dist`

## Build

```bash
npm run build
```

The built files will be in the `dist` directory.