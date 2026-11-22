# TopLine Spaces website

Next.js 15 + Framer Motion. Layout and motion modelled on the MiniMaze Light 3D reference; all copy, images and code are our own.

## Run it
    npm install
    npm run dev          # http://localhost:3000

## Static build (any host: Vercel, Netlify, cPanel)
    STATIC_EXPORT=1 npm run build    # output in ./out

## Where to change things
- Project texts and categories: use the admin (below), which saves to `src/content/projects.json`
- Category list (Stage Design, Television, Corporate…): `categories` in `src/lib/content.ts`
- Other text, team, FAQ, contact details: `src/lib/content.ts`
- Logo: put the file in `public/` (e.g. `public/logo.svg`) and set `site.logo` in `src/lib/content.ts`
- Project images: replace `public/art/work-XX.jpg` (keep the ratio field in content.ts in sync). Optional `video` per project plays when a visitor stands in front of it in the gallery.
- 3D gallery engine: `src/lib/gallery.ts` (room geometry, camera path) and `src/components/gallery/`

## Adding project photos

1. Each folder in `~/Desktop/TopLine Spaces Website/projects/` is one project. Photos can sit in subfolders. A photo called `cover.jpg` becomes the main image (or set it in `CURATE` at the top of the script). Add an optional `about.txt` (`Client:`, `Year:`, `Location:`, `What we built:`).
2. Run `python3 scripts/process-projects.py` (needs `pip3 install pillow` and `ffmpeg`, e.g. `brew install ffmpeg`). It resizes photos, turns the first video into a short silent loop, and writes `src/lib/media.json`.
3. Titles, categories and texts are edited in the admin. A brand-new folder needs a new project in the admin with its `folder` set to the folder name.

## Admin: edit project texts

On your computer:

    git pull
    npm install
    npm run dev

Then open http://localhost:3000/keystatic and pick **Projects**. You can change each project's title, category, client, year, location, short blurb, the longer story, a quote, and whether it hangs in the home gallery (the first 9 ticked ones do). Press **Save**; it writes `src/content/projects.json`. Commit and push that file (or open a PR) and the live site updates.

To edit straight on the live site later, Keystatic needs a GitHub App:
1. Run `npm run dev`, open /keystatic and follow Keystatic's "connect to GitHub" setup once (it creates the app), or create one by hand.
2. On Vercel, set `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`, `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET` and `KEYSTATIC_SECRET`, then redeploy.
Until those are set, /keystatic on the live site just shows a note and edits nothing.

## Contact form email

The form on /contact sends each brief to **info@toplinespaces.com** (set in `site.email` in `src/lib/content.ts`). The email has the full brief, Reply / Call / WhatsApp buttons, and pressing Reply answers the client directly. The template is in `src/lib/enquiry-email.ts`.

The mailbox is hosted on Hostinger, and the site sends through it with `smtp.hostinger.com`, port 465, as info@toplinespaces.com. Those are the defaults, so **only one setting is needed on Vercel**:

1. Vercel → toplinespacess → Settings → Environment Variables.
2. Add `SMTP_PASS` = the password of the info@toplinespaces.com mailbox (the one you log into Hostinger webmail with). Tick Production and Preview. Mark it Sensitive.
3. Deployments → latest → Redeploy.

If you change the mailbox password in Hostinger, update `SMTP_PASS` too. Optional overrides: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `CONTACT_FROM`, `CONTACT_TO` (another inbox to receive briefs).

Until `SMTP_PASS` is set, the form tells visitors to email info@toplinespaces.com directly, so no brief is silently lost. For local testing, put `SMTP_PASS=...` in `.env.local` (never commit it).
