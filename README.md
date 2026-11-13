# TopLine Spaces website

Next.js 15 + Framer Motion. Layout and motion modelled on the MiniMaze Light 3D reference; all copy, images and code are our own.

## Run it
    npm install
    npm run dev          # http://localhost:3000

## Static build (any host: Vercel, Netlify, cPanel)
    STATIC_EXPORT=1 npm run build    # output in ./out

## Where to change things
- All text, projects, team, FAQ, contact details: `src/lib/content.ts`
- Logo: put the file in `public/` (e.g. `public/logo.svg`) and set `site.logo` in `src/lib/content.ts`
- Project images: replace `public/art/work-XX.jpg` (keep the ratio field in content.ts in sync). Optional `video` per project plays when a visitor stands in front of it in the gallery.
- 3D gallery engine: `src/lib/gallery.ts` (room geometry, camera path) and `src/components/gallery/`

## Adding project photos

1. Each folder in `~/Desktop/TopLine Spaces Website/projects/` is one project. Photos can sit in subfolders. A photo called `cover.jpg` becomes the main image (or set it in `CURATE` at the top of the script). Add an optional `about.txt` (`Client:`, `Year:`, `Location:`, `What we built:`).
2. Run `python3 scripts/process-projects.py` (needs `pip3 install pillow` and `ffmpeg`, e.g. `brew install ffmpeg`). It resizes photos, turns the first video into a short silent loop, and writes `src/lib/media.json`.
3. Titles, categories and the order of projects live in `src/lib/content.ts`. A brand-new folder needs one `mk(...)` line there.
