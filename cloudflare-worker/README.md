# ⚡ Zero-Key AI Timetable Scanner (Cloudflare Worker)

This Cloudflare Worker allows **all students and classmates** to scan timetable photos directly in Attendance Manager **without needing an API key**!

---

## 🚀 2-Minute Setup Guide (100% Free Forever)

### Step 1: Open Cloudflare Workers (Free)
1. Go to [https://dash.cloudflare.com/](https://dash.cloudflare.com/) and sign up / log in with your email.
2. In the left sidebar, click **Workers & Pages**.
3. Click the blue button: **Create application** (or **Create Worker**).
4. Keep or change the worker name (e.g. `attendance-scan`), then click **Deploy**.

---

### Step 2: Paste the Worker Code
1. On the confirmation screen, click **Edit code** (top right).
2. Delete whatever sample code is there in `worker.js`.
3. Copy all code from [worker.js](./worker.js) and paste it into the editor.
4. Click **Deploy** (top right).

---

### Step 3: Add Your Gemini API Key as a Secret
1. In your Cloudflare Worker page, click the **Settings** tab.
2. Click **Variables and Secrets** in the sub-menu.
3. Under **Secrets**, click **Add** (or **Add Secret**):
   - **Name**: `GEMINI_API_KEY`
   - **Value**: *(Paste your Google Gemini API key starting with AIza...)*
4. Click **Save and Deploy**.

---

### Step 4: Plug the URL into Attendance Manager
1. Copy your worker's public URL (shown at the top, e.g. `https://attendance-scan.<your-username>.workers.dev`).
2. Provide this URL here, and I will connect it to `app.js`!
3. From that moment on, the app will automatically scan photos for **any student** with zero API keys required!
