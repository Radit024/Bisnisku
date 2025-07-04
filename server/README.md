# BisnisMu Server

Express.js backend API for the BisnisMu business management application.

## Environment Variables

Create a `.env` file in the server directory with:

```
NODE_ENV=production
DATABASE_URL=your_postgresql_connection_string
CLIENT_URL=https://your-client-domain.vercel.app
```

## Development

```bash
npm install
npm run dev
```

## Database Setup

```bash
npm run db:push
```

## Deployment on Railway

1. Connect your repository to Railway
2. Set the root directory to `server`
3. Add environment variables in Railway dashboard:
   - `DATABASE_URL`: PostgreSQL connection string
   - `CLIENT_URL`: Your Vercel client URL
   - `NODE_ENV`: production
4. Build command: `npm run build`
5. Start command: `npm start`

## Deployment on Google Cloud Run

1. Build Docker image:
```bash
docker build -t bisnismu-server .
```

2. Push to Google Container Registry:
```bash
docker tag bisnismu-server gcr.io/your-project/bisnismu-server
docker push gcr.io/your-project/bisnismu-server
```

3. Deploy to Cloud Run:
```bash
gcloud run deploy bisnismu-server \
  --image gcr.io/your-project/bisnismu-server \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Build

```bash
npm run build
```

The built file will be in the `dist` directory.