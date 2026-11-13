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

1. Fill the folders in `~/Desktop/TopLine Spaces Website/projects/` (one per project). Name the best photo `cover.jpg`, add more photos, an optional `.mp4`, and an optional `about.txt` (`Client:`, `Year:`, `Location:`, `What we built:`).
2. Run `npm run sync-projects`. Photos are copied into `public/projects/<slug>/` and notes land in `src/lib/media.json`.
3. Projects without photos keep their drawn placeholder. A brand-new folder also needs one `mk(...)` line in `src/lib/content.ts`.
