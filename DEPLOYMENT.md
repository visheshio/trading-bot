# 🚀 Deploying TradeBot to Vercel

This monorepo is configured to deploy both the **Frontend** (Vite + React SPA) and **Backend** (Express serverless API) to **Vercel** with full connectivity and MongoDB database support.

---

## 🌟 Option 1: Unified 1-Click Deployment (Recommended)

In this approach, the entire monorepo is deployed as a single Vercel project.
- **Frontend** is served from `apps/client/dist` at the root domain (`https://<project-name>.vercel.app`).
- **Backend API** is automatically routed through Vercel Serverless Functions (`/api/*`).
- **Zero CORS configuration required** because frontend and backend share the same domain.

### Steps:

1. **Push your code to GitHub / GitLab / Bitbucket**.
2. Go to [Vercel Dashboard](https://vercel.com/new) and click **"Add New Project"** > **"Import Git Repository"**.
3. Select your `trading-n8n-monorepo` repository.
4. Keep the **Root Directory** as `./` (default).
5. **Environment Variables**:
   In the **Environment Variables** section, add:
   - `MONGO_URL` = `your_mongodb_connection_string` (e.g. `mongodb+srv://user:pass@cluster.mongodb.net/tradebot?retryWrites=true&w=majority`)
   - `JWT_SECRET` = `your_secure_random_secret_string`
6. Click **Deploy**.
7. Once deployment completes, your site will be live at `https://<project-name>.vercel.app`!

---

## 🛠️ Option 2: Deploy Frontend & Backend as Separate Projects

If you prefer two separate Vercel projects (e.g. `tradingbot-api.vercel.app` and `tradingbot-app.vercel.app`):

### Project 1: Backend API

1. In Vercel, import the repository.
2. Name it (e.g., `tradebot-backend`).
3. Set **Root Directory** to `./` (root).
4. Add **Environment Variables**:
   - `MONGO_URL` = `your_mongodb_connection_string`
   - `JWT_SECRET` = `your_secure_random_secret_string`
   - `FRONTEND_URL` = `https://<your-frontend-project-name>.vercel.app` (optional, CORS allows `*.vercel.app` by default)
5. Click **Deploy**. Note the backend URL (e.g. `https://tradebot-backend.vercel.app`).

### Project 2: Frontend Client

1. In Vercel, import the same repository again.
2. Name it (e.g., `tradebot-frontend`).
3. Set **Root Directory** to `apps/client`.
4. In **Framework Preset**, select `Vite`.
5. Add **Environment Variable**:
   - `VITE_API_BASE_URL` = `https://tradebot-backend.vercel.app` (or your backend URL)
6. Click **Deploy**.

---

## 🔍 Verifying the Deployment

### 1. Health Check
Open `https://<your-deployment-url>.vercel.app/api/health` in your browser. You should receive:
```json
{
  "status": "ok",
  "message": "Trading Bot API is running",
  "timestamp": "2026-..."
}
```

### 2. Authentication & Workflows
1. Visit `https://<your-deployment-url>.vercel.app/auth`.
2. Create a new account or Sign In.
3. Access the `/dashboard` and create a trading bot workflow at `/create-workflow`.
4. Verify your saved workflows appear in MongoDB Atlas.

---

## 📋 Environment Variables Reference

| Variable Name | Required | Target | Description |
| :--- | :--- | :--- | :--- |
| `MONGO_URL` / `DATABASE_URL` | **Yes** | Backend / Serverless | MongoDB Atlas connection string |
| `JWT_SECRET` | **Yes** | Backend / Serverless | Secret key for signing user auth tokens |
| `VITE_API_BASE_URL` | Optional | Frontend Client | Custom backend API URL (only needed if backend is hosted on a different domain) |
| `FRONTEND_URL` | Optional | Backend | Custom client origin for CORS restrictions |
