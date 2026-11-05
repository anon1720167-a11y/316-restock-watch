# 316 Restock Watch

A community board for Pokémon TCG restocks and sightings around Wichita and the rest of the 316.

| File | What it is |
|---|---|
| `index.html` | The page itself |
| `styles.css` | Colors and layout |
| `app.js` | Loads reports, filters them, and posts new ones |
| `config.js` | **Your settings.** This is the only file you normally edit |
| `supabase-setup.sql` | Creates the database. You run it once in Supabase |

---

## Part 1: Publish on GitHub Pages (about 10 minutes)

1. Go to github.com and click **+** (top right) → **New repository**.
   - Name: `316-restock-watch`
   - Set it to **Public** (free GitHub Pages needs a public repo)
   - Click **Create repository**
2. On the new repo page, click **uploading an existing file**. Drag in all 6 files (unzip them first), then click **Commit changes**.
3. Go to **Settings → Pages**. Under *Build and deployment*, set **Source** to *Deploy from a branch* and **Branch** to `main` / `(root)`, then click **Save**.
4. Wait 1–2 minutes and refresh. GitHub shows your link, for example:
   `https://YOUR-USERNAME.github.io/316-restock-watch/`

At this point the site is live in **demo mode**. It works, but reports are saved only in each visitor's own browser.

## Part 2: Connect a free database so everyone sees the same reports (about 10 minutes)

1. Go to supabase.com → **Start your project** → sign in with GitHub.
2. Click **New project**. Pick any name and generate a database password (you won't need the password for this site). Choose a US region, then click **Create**. Setup takes about a minute.
3. In the left sidebar, open **SQL Editor** → **New query**. Paste in everything from `supabase-setup.sql` and click **Run**. You should see "Success."
4. Open **Project Settings** (gear icon) and find your:
   - **Project URL** (`https://xxxx.supabase.co`). It's usually on the project's home page or under Data API.
   - **Publishable key** (`sb_publishable_...`) under **API Keys**. An older "anon public" key also works.
   - ⚠️ Never use the **secret** or **service_role** key.
5. Back on GitHub, open `config.js`, click the ✏️ pencil icon, and paste the two values between the quotes:
   ```js
   SUPABASE_URL: "https://xxxx.supabase.co",
   SUPABASE_KEY: "sb_publishable_xxxxxxxx",
   ```
   Then click **Commit changes**.
6. After about 1 minute, reload your site. The yellow demo banner should be gone, and the status should read **● Live**.

## Running the site

- **Delete a bad post:** in Supabase, go to **Table Editor → sightings**, check the row, and click Delete. Visitors can add posts but can never edit or delete them.
- **Change towns or store suggestions:** edit the lists in `config.js`.
- **Free-tier pausing:** Supabase pauses free projects after about a week with no activity. If that happens, click **Restore** in the dashboard. Regular traffic keeps it awake.
- **Custom domain (optional):** buy one (about $12/yr, e.g. on Namecheap or Cloudflare), then add it under **Settings → Pages → Custom domain**.

## Ideas for later

- Photo uploads (Supabase Storage)
- "Still there?" confirm and "gone" buttons on each post
- A map of stores
- Discord or text alerts when a restock is posted
- Moderator login with an approval queue
