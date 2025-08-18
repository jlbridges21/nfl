# NFL Predictor

A Next.js web application for predicting NFL game outcomes using advanced statistical models and real-time data from SportsData.io.

## Features

- **Game Prediction Engine**: Advanced scoring algorithms to predict NFL game outcomes
- **Real-time NFL Data**: Live team stats, player information, and game scores
- **Interactive UI**: Modern, responsive interface built with React and Tailwind CSS
- **Supabase Integration**: Secure data storage and user management
- **Production Ready**: Optimized for deployment on Vercel

## Getting Started

### Prerequisites

- Node.js 18.18.0 or higher
- npm, yarn, pnpm, or bun
- SportsData.io API key
- Supabase project (optional)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd nfl-predictor
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual values:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# SportsData API Configuration (server-side only)
SPORTSDATA_API_KEY=your_sportsdata_api_key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Environment
NODE_ENV=development
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run typecheck` - Run TypeScript type checking
- `npm run test` - Run all tests
- `npm run test:unit` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests

## Deploy on Vercel

### Quick Deploy

The easiest way to deploy your NFL Predictor app is to use the [Vercel Platform](https://vercel.com/new).

### Step-by-Step Deployment

1. **Import your GitHub repository** in Vercel:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Connect your GitHub account
   - Import your NFL Predictor repository

2. **Configure Environment Variables** in the Vercel dashboard:
   
   **Required Environment Variables:**
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   SPORTSDATA_API_KEY=your_sportsdata_api_key
   NEXT_PUBLIC_API_URL=https://your-app-name.vercel.app/api
   NODE_ENV=production
   ```

   **⚠️ Security Note:** 
   - `SPORTSDATA_API_KEY` is server-side only and will NOT be exposed to the client
   - Only `NEXT_PUBLIC_*` variables are accessible in the browser
   - The app uses a secure serverless proxy at `/api/sportsdata/*` to protect your API key

3. **Click Deploy** - Vercel will automatically:
   - Install dependencies
   - Run the build process
   - Deploy your application
   - Provide you with a live URL

4. **Add a Custom Domain** (optional):
   - Go to your project settings in Vercel
   - Navigate to the "Domains" tab
   - Add your custom domain
   - Configure DNS settings as instructed

### Environment Variables Reference

| Variable | Required | Description | Client/Server |
|----------|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL | Client |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key | Client |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key | Server |
| `SPORTSDATA_API_KEY` | Yes | SportsData.io API key | Server |
| `NEXT_PUBLIC_API_URL` | Yes | Base URL for API calls | Client |
| `NODE_ENV` | No | Environment (development/production) | Both |

### Vercel Deployment Checklist

- [ ] Repository imported to Vercel
- [ ] Environment variables configured (see table above)
- [ ] `SPORTSDATA_API_KEY` added as server-side only variable
- [ ] `NEXT_PUBLIC_API_URL` updated to production URL
- [ ] Build completed successfully
- [ ] Application accessible at provided URL
- [ ] API proxy endpoints working (`/api/sportsdata/*`)
- [ ] Custom domain configured (if desired)

## Architecture

### Security Features

- **API Key Protection**: SportsData API key is never exposed to the client
- **Serverless Proxy**: All third-party API calls go through secure server-side proxy
- **Rate Limiting**: Built-in rate limiting to prevent API abuse
- **Environment Separation**: Clear separation between client and server environment variables

### API Routes

- `/api/sportsdata/*` - Secure proxy for SportsData.io API
- `/api/teams` - Team information and statistics
- `/api/predict` - Game prediction endpoints
- `/api/health` - Health check endpoint

## Testing After Deployment

### Verification Steps

1. **Homepage Load Test**:
   - Visit your deployed URL
   - Verify the main page loads without errors
   - Check browser console for any JavaScript errors

2. **API Proxy Test**:
   - Navigate to NFL Stats page
   - Verify team data loads correctly
   - Check Network tab to confirm API calls go to `/api/sportsdata/*`

3. **Prediction Feature Test**:
   - Go to the prediction page
   - Select two teams
   - Verify prediction calculation works
   - Test with different team combinations

4. **Sample API Call Test**:
   ```bash
   curl https://your-app-name.vercel.app/api/sportsdata/scores/json/Teams
   ```
   Should return NFL team data without exposing your API key.

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs) - Learn about Next.js features and API
- [Vercel Platform](https://vercel.com/docs) - Learn about Vercel deployment
- [SportsData.io API](https://sportsdata.io/developers/api-documentation/nfl) - NFL API documentation
- [Supabase Documentation](https://supabase.com/docs) - Learn about Supabase features

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
