# Path to Rights - Deployment Guide

This guide provides step-by-step instructions to deploy the **Path to Rights** full-stack application (React frontend + Node/Express backend + Firebase + Google Gemini API) to production.

---

## 📋 Prerequisites

Before deploying, ensure you have:
1. A **Google Gemini API Key** (obtain from [Google AI Studio](https://aistudio.google.com/)).
2. A **Firebase Project** set up (obtain configuration keys from the Firebase Console).
3. **Node.js** (v18 or higher) installed on your system.

---

## 🛠️ Step 1: Local Build & Production Check

Before deploying to any cloud platform, verify that the project builds and runs locally in production mode:

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env` file in the root directory (based on `.env.example`) and fill in your secrets:
   ```env
   GEMINI_API_KEY="your-gemini-api-key"
   APP_URL="http://localhost:3000"

   # Firebase Client Config
   VITE_FIREBASE_API_KEY="your-firebase-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="your-app.firebaseapp.com"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-app.firebasestorage.app"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   VITE_FIREBASE_APP_ID="your-app-id"
   ```

3. **Build the Application**:
   Run the build script to bundle the React frontend and compile the Express backend:
   ```bash
   npm run build
   ```
   *This compiles the frontend assets and generates `dist/server.cjs` and the static site inside the `dist/` directory.*

4. **Test Production Server**:
   ```bash
   npm run start
   ```
   Open `http://localhost:3000` to verify that the compiled production bundle runs correctly.

---

## 🚀 Step 2: Deploying the Full-Stack Web App

Since this application uses a Node.js Express backend serving a React single-page app (SPA), it needs to be hosted on a cloud provider that supports running Node.js servers.

Here are the three best options for deployment:

### Option A: Render (Recommended & Easiest)
[Render](https://render.com/) is a cloud hosting platform that makes full-stack deployment simple and free/low-cost.

1. Create a free account on [Render](https://render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub repository.
4. Set the following configurations:
   - **Language**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Instance Type**: `Free` (or Starter)
5. Click **Advanced** and add your **Environment Variables** (matching your `.env` keys):
   - `GEMINI_API_KEY`
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `NODE_ENV` = `production`
6. Click **Deploy Web Service**. Render will automatically build the React assets and run the Express server.

---

### Option B: Railway (Alternative PaaS)
[Railway](https://railway.app/) is similar to Render and deploys apps directly from GitHub.

1. Go to [Railway](https://railway.app/) and create an account.
2. Click **New Project** -> **Deploy from GitHub repo**.
3. Select this repository.
4. Go to **Variables** and paste all keys from your local `.env`.
5. Railway will automatically detect the `package.json` scripts and run the app. If needed, customize the start command in settings to `npm run start`.

---

### Option C: Google Cloud Run (Containerized & Empathetic Scale)
For highly reliable scaling and integration with Google Cloud:

1. Create a `Dockerfile` in the root directory:
   ```dockerfile
   FROM node:22-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   ENV NODE_ENV=production
   EXPOSE 3000
   CMD ["npm", "run", "start"]
   ```
2. Build and push the container image to Google Artifact Registry:
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/pathtorights
   ```
3. Deploy to **Cloud Run**:
   ```bash
   gcloud run deploy pathtorights \
     --image gcr.io/YOUR_PROJECT_ID/pathtorights \
     --platform managed \
     --region asia-south1 \
     --allow-unauthenticated \
     --set-env-vars GEMINI_API_KEY=your_key,VITE_FIREBASE_API_KEY=your_fb_key...
   ```

---

### Option D: Vercel (Serverless Deployment)
We have pre-configured Vercel compatibility with `vercel.json` and a serverless entry point at `api/index.ts`.

1. Import your project repository directly in the [Vercel Dashboard](https://vercel.com).
2. Set the following environment variables in **Project Settings** -> **Environment Variables**:
   * `GEMINI_API_KEY`
   * `VITE_FIREBASE_API_KEY`
   * `VITE_FIREBASE_AUTH_DOMAIN`
   * `VITE_FIREBASE_PROJECT_ID`
   * `VITE_FIREBASE_STORAGE_BUCKET`
   * `VITE_FIREBASE_MESSAGING_SENDER_ID`
   * `VITE_FIREBASE_APP_ID`
3. Vercel will automatically detect Vite, run `npm run build` to build the static React assets, and map all `/api/*` backend routes serverlessly using our Express handler.

---

## 🔥 Step 3: Deploying Firebase Firestore Security Rules

To ensure that guest sessions and authenticated users can only write to their own nested data (as defined in `firestore.rules`):

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login and Initialize**:
   ```bash
   firebase login
   ```

3. **Deploy Rules**:
   Run the deployment command targeting only firestore configurations:
   ```bash
   firebase deploy --only firestore:rules
   ```

---

## 🔒 Security Best Practices for Production

- **Do NOT Prefix Gemini Keys**: Ensure `GEMINI_API_KEY` is not prefixed with `VITE_` in `.env` to prevent the key from being compiled into the client-side JavaScript. The Express server acts as a secure proxy layer.
- **Enable Firestore Rules**: Never deploy without active `firestore.rules`. The rules in the workspace ensure that users cannot delete profiles or tamper with summaries owned by other UIDs.
