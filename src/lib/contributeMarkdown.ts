function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function parseIngredients(raw: string) {
  const lines = raw
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  const items = lines.map(line => {
    const parts = line.split('|').map(p => p.trim());
    if (parts.length >= 3) {
      return {
        quantity: parts[0] || undefined,
        unit: parts[1] || undefined,
        name: parts.slice(2).join(' | '),
      };
    }
    return { name: line };
  });

  return [{ items }];
}

function parseSteps(raw: string) {
  const lines = raw.split('\n');
  const steps: { title?: string; actions: string[] }[] = [];
  let current: { title?: string; actions: string[] } = { actions: [] };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('## ')) {
      if (current.actions.length > 0 || current.title) {
        steps.push(current);
      }
      current = { title: trimmed.slice(3).trim(), actions: [] };
      continue;
    }

    current.actions.push(trimmed);
  }

  if (current.actions.length > 0 || current.title) {
    steps.push(current);
  }

  if (steps.length === 0) {
    steps.push({ actions: ['Add cooking steps.'] });
  }

  return steps;
}

function yamlString(value: string): string {
  if (/['\n:#\[\]{}|>*&!]/.test(value) || value.includes("'")) {
    return JSON.stringify(value);
  }
  return `'${value}'`;
}

export interface ContributePayload {
  title: string;
  description: string;
  author: string;
  cookingTime: number;
  ingredients: string;
  steps: string;
  notes: string;
  tags: string;
  imageUrl: string;
}

export function buildRecipeMarkdown(payload: ContributePayload): {
  slug: string;
  markdown: string;
} {
  const slug = slugify(payload.title) || 'untitled-recipe';
  const today = new Date().toISOString().slice(0, 10);
  const author = payload.author.trim() || 'anonymous';
  const tags = payload.tags
    .split(',')
    .map(t => t.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 3);

  const ingredients = parseIngredients(payload.ingredients);
  const steps = parseSteps(payload.steps);
  const notes = payload.notes
    .split('\n')
    .map(n => n.trim())
    .filter(Boolean);

  const image = payload.imageUrl.trim();

  let md = `---
title: ${yamlString(payload.title.trim())}
description: ${yamlString(payload.description.trim())}

author: ${yamlString(author)}
pubDate: ${today}

image: ${yamlString(image)}
imageAlt: ${yamlString(image ? payload.title.trim() : '')}

cookingTime: ${payload.cookingTime}

steps:
`;

  for (const step of steps) {
    md += `  - title: ${yamlString(step.title || '')}\n`;
    md += `    actions:\n`;
    for (const action of step.actions) {
      md += `      - ${yamlString(action)}\n`;
    }
  }

  md += `\ningredients:\n`;
  for (const group of ingredients) {
    md += `  - items:\n`;
    for (const item of group.items) {
      md += `      - quantity: ${yamlString(item.quantity || '')}\n`;
      md += `        unit: ${yamlString(item.unit || '')}\n`;
      md += `        name: ${yamlString(item.name)}\n`;
    }
  }

  if (notes.length > 0) {
    md += `\nrecipeNotes:\n`;
    for (const note of notes) {
      md += `  - ${yamlString(note)}\n`;
    }
  }

  if (tags.length > 0) {
    md += `\ntags: [${tags.map(t => yamlString(t)).join(', ')}]\n`;
  }

  md += `---\n`;

  return { slug, markdown: md };
}
