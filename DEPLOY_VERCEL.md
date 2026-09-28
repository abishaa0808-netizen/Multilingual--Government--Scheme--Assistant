# Deploy to Vercel

This project is pre-configured for one-command deployment to Vercel with both the Vite frontend and the Express backend API.

## Pre-configured Files
- `vercel.json`: Handles static build output from `dist` and routes `/api/*` to the serverless function.
- `api/index.ts`: Vercel serverless function entry point exporting the Express application.
- `server.ts`: Exports `app` and automatically detects Vercel's serverless environment.

## Method 1: Deploy using Vercel CLI (Fastest)

1. Open your terminal in the project directory.
2. Run:
```bash
npx vercel
```
3. Follow the prompts:
   - Set up and deploy? **y**
   - Which scope? Select your Vercel account
   - Link to existing project? **n**
   - Project name? **multilingual-gov-scheme-assistant** (or press Enter)
   - Directory located? **./** (press Enter)
   - Want to modify settings? **n**

4. Set your Gemini API key on Vercel:
```bash
npx vercel env add GEMINI_API_KEY
```
Enter your Gemini API key value when prompted and select **Production, Preview, Development**.

5. Deploy to Production:
```bash
npx vercel --prod
```

---

## Method 2: Deploy using GitHub (Automatic CI/CD)

1. Push this repository to GitHub:
```bash
git add .
git commit -m "Configure Vercel deployment"
git push origin main
```

2. Go to [vercel.com](https://vercel.com) and click **Add New... > Project**.
3. Import your GitHub repository.
4. In **Environment Variables**, add:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your Google Gemini API Key
5. Click **Deploy**.
