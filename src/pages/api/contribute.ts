import type { APIRoute } from 'astro';
import { buildRecipeMarkdown } from '@/lib/contributeMarkdown';

export const prerender = false;

async function verifyTurnstile(
  token: string,
  ip: string | null
): Promise<boolean> {
  const secret = import.meta.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Turnstile optional when not configured
    return true;
  }
  if (!token) return false;

  const body = new URLSearchParams();
  body.set('secret', secret);
  body.set('response', token);
  if (ip) body.set('remoteip', ip);

  const res = await fetch(
    'https://challenges.cloudflare.com/turnstile/v0/siteverify',
    { method: 'POST', body }
  );
  const data = (await res.json()) as { success?: boolean };
  return Boolean(data.success);
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const githubToken = import.meta.env.GITHUB_TOKEN;
  const githubRepo = import.meta.env.GITHUB_REPO;

  if (!githubToken || !githubRepo) {
    return Response.json(
      { ok: false, error: 'Contribution form is not configured.' },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json(
      { ok: false, error: 'Invalid form data.' },
      { status: 400 }
    );
  }

  // Honeypot
  if (String(form.get('website') || '').trim()) {
    return Response.json({ ok: true, url: undefined });
  }

  const turnstileToken = String(
    form.get('cf-turnstile-response') || form.get('turnstile') || ''
  );
  const turnstileOk = await verifyTurnstile(
    turnstileToken,
    clientAddress ?? null
  );
  if (import.meta.env.TURNSTILE_SECRET_KEY && !turnstileOk) {
    return Response.json(
      { ok: false, error: 'Spam check failed. Please try again.' },
      { status: 400 }
    );
  }

  const title = String(form.get('title') || '').trim();
  const description = String(form.get('description') || '').trim();
  const cookingTime = Number(form.get('cookingTime'));
  const ingredients = String(form.get('ingredients') || '').trim();
  const steps = String(form.get('steps') || '').trim();

  if (
    !title ||
    !description ||
    !ingredients ||
    !steps ||
    !Number.isFinite(cookingTime)
  ) {
    return Response.json(
      { ok: false, error: 'Please fill in all required fields.' },
      { status: 400 }
    );
  }

  if (cookingTime < 1 || cookingTime > 999) {
    return Response.json(
      { ok: false, error: 'Cooking time must be between 1 and 999 minutes.' },
      { status: 400 }
    );
  }

  const payload = {
    title,
    description,
    author: String(form.get('author') || '').trim(),
    cookingTime,
    ingredients,
    steps,
    notes: String(form.get('notes') || '').trim(),
    tags: String(form.get('tags') || '').trim(),
    imageUrl: String(form.get('imageUrl') || '').trim(),
  };

  const { slug, markdown } = buildRecipeMarkdown(payload);

  const issueBody = [
    '## Recipe submission via /contribute',
    '',
    `**Suggested filename:** \`src/content/recipes/${slug}.md\``,
    '',
    '### Review checklist',
    '- [ ] Validate ingredients / steps',
    '- [ ] Add licensed photo to CDN and set `image` filename',
    '- [ ] Merge into content collection',
    '',
    '### Generated Markdown',
    '',
    '```markdown',
    markdown,
    '```',
  ].join('\n');

  const [owner, repo] = githubRepo.split('/');
  if (!owner || !repo) {
    return Response.json(
      { ok: false, error: 'GITHUB_REPO must be owner/repo.' },
      { status: 500 }
    );
  }

  const ghRes = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        'User-Agent': 'OpenStove-Contribute',
      },
      body: JSON.stringify({
        title: `Recipe submission: ${title}`,
        body: issueBody,
      }),
    }
  );

  if (!ghRes.ok) {
    const errText = await ghRes.text();
    console.error('GitHub issue create failed', ghRes.status, errText);
    return Response.json(
      {
        ok: false,
        error:
          ghRes.status === 403 || ghRes.status === 401
            ? 'Could not create GitHub issue (auth).'
            : 'Could not create GitHub issue. Please try again later.',
      },
      { status: 502 }
    );
  }

  const issue = (await ghRes.json()) as { html_url?: string };
  return Response.json({ ok: true, url: issue.html_url });
};
