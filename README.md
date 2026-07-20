<div align="center">
  <a href="https://openstove.org" target="_blank"><img src="src/icons/logo-readme.svg" alt="OpenStove Logo"/></a>
</div>
<p>&nbsp;</p>

> Welcome to **OpenStove – a curated collection of community-crafted recipes**. OpenStove is a digital gathering space where culinary enthusiasts come together to discover, share, and contribute recipes. No ads, no fees – just a love for food and community.

## What is OpenStove?

OpenStove is built on the belief that the best cooking experiences come from shared knowledge. We provide a platform free from distracting ads where you have direct access to a diverse collection of dishes curated and cherished by food lovers from all over the world.

The application code and recipe text live in one public repository. Recipes are Markdown files managed through Astro content collections. Recipe photographs are stored separately in Vercel Blob so licensed image files are not included in the public Git history.

Production: [openstove.org](https://openstove.org)

## Features

- Community-maintained Markdown recipes
- Search, tags, pagination, and browser-local bookmarks
- Ingredient scaling
- Print-friendly recipe pages and browser PDF export
- Public recipe contribution form with GitHub Issue review
- Keystatic CMS for maintainers
- Recipe images delivered through Vercel Blob
- Responsive light and dark themes

## Technology

- [Astro 7](https://astro.build/) with server rendering
- [Tailwind CSS 4](https://tailwindcss.com/)
- TypeScript
- [Keystatic](https://keystatic.com/) for Git-backed content editing
- [Vercel](https://vercel.com/) for hosting and serverless routes
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for recipe photographs
- GitHub Issues for form submissions
- Cloudflare Turnstile for optional spam protection

## Project structure

```text
src/
├── components/          Reusable Astro components
├── content/recipes/     Markdown recipe collection
├── images/              Public UI illustrations and fallback image
├── layouts/             Shared page layouts
├── lib/                 Image and contribution utilities
├── pages/               Pages and server API routes
└── styles/              Tailwind v4 global styles
keystatic.config.ts      Maintainer CMS schema
scripts/                 Maintainer utilities
vercel.json              Production headers and CSP
```

## Local development

Requirements:

- Node.js 22.12 or newer
- pnpm

```bash
git clone https://github.com/mearashadowfax/OpenStove.git
cd OpenStove
pnpm install
cp .env.example .env
pnpm dev
```

Open [http://127.0.0.1:4321](http://127.0.0.1:4321).

Useful commands:

```bash
pnpm dev            # Start local development
pnpm build          # Type-check and create a production build
pnpm preview        # Preview the production build
pnpm format:check   # Check formatting
pnpm format:fix     # Apply formatting
```

Without `PUBLIC_IMAGE_BASE_URL`, local recipe pages intentionally display the fallback image.

## Recipe content

Recipes live in [`src/content/recipes`](src/content/recipes) and are validated by [`src/content.config.ts`](src/content.config.ts). The Markdown filename is the recipe ID and URL path:

```text
src/content/recipes/creamy-tomato-soup.md
→ /recipes/creamy-tomato-soup
```

Do not add a separate `slug` field to recipe frontmatter.

## Recipe images

Recipe photographs are publicly readable from Vercel Blob because browsers must be able to display them, but their source files are kept out of this public Git repository for licensing reasons.

Frontmatter stores only the Blob filename:

```yaml
image: 'tomato-soup.avif'
imageAlt: 'A bowl of creamy tomato soup'
```

The application combines the filename with `PUBLIC_IMAGE_BASE_URL`. Missing or unavailable images fall back to the repository's placeholder.

### Uploading photographs

Keep original photographs in a private local or backed-up directory. Upload AVIF files with:

```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_... \
pnpm upload:images --dir /path/to/private-recipe-images
```

The script uploads files under the `recipes/` Blob prefix without random suffixes and prints the required `PUBLIC_IMAGE_BASE_URL`.

Never commit recipe photographs or Blob write tokens to this repository.

## Contributing recipes

There are two supported workflows:

1. Use the [online contribution form](https://openstove.org/contribute). It creates a GitHub Issue containing generated Markdown for maintainer review.
2. Follow [`CONTRIBUTING.md`](CONTRIBUTING.md) and open a pull request.

The contribution API requires:

```text
GITHUB_TOKEN       Fine-grained PAT with Issues: read and write
GITHUB_REPO        mearashadowfax/OpenStove
```

Cloudflare Turnstile is supported through `PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`.

## Keystatic CMS

Maintainers can edit recipe Markdown through Keystatic.

### Local mode

Run `pnpm dev`, then open:

[http://127.0.0.1:4321/keystatic](http://127.0.0.1:4321/keystatic)

Local mode reads and writes the working tree directly.

### Production mode

Production uses GitHub authentication. Only users with write access to the OpenStove repository can make changes.

## Production deployment

1. Import this public repository into Vercel.
2. Connect a public-read Vercel Blob store.
3. Upload recipe AVIFs and set `PUBLIC_IMAGE_BASE_URL`.
4. Configure the contribution and Keystatic environment variables.
5. Deploy the `main` branch.
6. Verify recipe images, `/contribute`, `/keystatic`, and print/PDF output.

See [`.env.example`](.env.example) for the complete environment variable list.

## License

OpenStove **code and recipe text** are licensed under the [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License](http://creativecommons.org/licenses/by-nc-sa/4.0/).

- **Attribute** – Provide proper credit, link to the license, and note any changes.
- **NonCommercial** – Material cannot be used for commercial purposes.
- **ShareAlike** – If you remix, transform, or build upon the material, distribute your contributions under the same license as the original.

Recipe **photographs** are not included in this repository and are licensed separately.

[View Full License](https://github.com/mearashadowfax/OpenStove/blob/main/LICENSE)
