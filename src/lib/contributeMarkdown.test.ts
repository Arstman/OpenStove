import { describe, expect, it } from 'vitest';
import { buildRecipeMarkdown } from './contributeMarkdown';

describe('buildRecipeMarkdown', () => {
  it('builds slug and frontmatter from a valid payload', () => {
    const { slug, markdown } = buildRecipeMarkdown({
      title: 'Creamy Tomato Soup!',
      description: 'A cozy weeknight soup.',
      author: 'Alex',
      cookingTime: 35,
      ingredients: '2|cups|tomatoes\n1|tbsp|olive oil',
      steps: '## Prep\nChop the tomatoes.\n## Cook\nSimmer until soft.',
      notes: 'Add cream at the end.',
      tags: 'soup, vegetarian',
      imageUrl: '',
    });

    expect(slug).toBe('creamy-tomato-soup');
    expect(markdown).toContain('title: "Creamy Tomato Soup!"');
    expect(markdown).toContain("author: 'Alex'");
    expect(markdown).toContain('cookingTime: 35');
    expect(markdown).toContain("quantity: '2'");
    expect(markdown).toContain("name: 'tomatoes'");
    expect(markdown).toContain("title: 'Prep'");
    expect(markdown).toContain("tags: ['soup', 'vegetarian']");
    expect(markdown).toContain("recipeNotes:\n  - 'Add cream at the end.'");
  });

  it('defaults anonymous author and limits tags to three', () => {
    const { markdown } = buildRecipeMarkdown({
      title: 'Test Dish',
      description: 'Desc',
      author: '  ',
      cookingTime: 10,
      ingredients: 'salt',
      steps: 'Mix well.',
      notes: '',
      tags: 'a, b, c, d, e',
      imageUrl: 'https://example.com/photo.jpg',
    });

    expect(markdown).toContain("author: 'anonymous'");
    expect(markdown).toContain("tags: ['a', 'b', 'c']");
    expect(markdown).toContain('image: "https://example.com/photo.jpg"');
  });

  it('escapes YAML-sensitive strings with JSON.stringify', () => {
    const { markdown } = buildRecipeMarkdown({
      title: "Chef's Special: Soup",
      description: 'Line one: two',
      author: 'Sam',
      cookingTime: 5,
      ingredients: '1|cup|water',
      steps: 'Boil.',
      notes: '',
      tags: '',
      imageUrl: '',
    });

    expect(markdown).toContain('"Chef\'s Special: Soup"');
    expect(markdown).toContain('"Line one: two"');
  });
});
