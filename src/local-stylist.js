/**
 * Wardrobe's always-available local outfit recommender.
 * Pure JavaScript: no network calls, model downloads, or platform APIs.
 * The optional on-device LLM can later explain/rerank these candidates.
 */

const CATEGORY_ORDER = ['Tops', 'Bottoms', 'Outerwear', 'Shoes', 'Bags', 'Accessories'];
const OCCASION_HINTS = {
  Everyday: ['Tops', 'Bottoms', 'Shoes'],
  Work: ['Tops', 'Bottoms', 'Outerwear', 'Shoes'],
  Evening: ['Tops', 'Bottoms', 'Shoes', 'Accessories'],
  Travel: ['Tops', 'Bottoms', 'Shoes', 'Outerwear', 'Bags'],
};

const NEUTRALS = new Set(['black', 'white', 'cream', 'beige', 'grey', 'gray', 'brown', 'navy']);
const COLOR_FAMILIES = {
  blue: 'cool', green: 'cool', purple: 'cool', teal: 'cool',
  red: 'warm', orange: 'warm', yellow: 'warm', pink: 'warm',
  black: 'neutral', white: 'neutral', cream: 'neutral', beige: 'neutral',
  grey: 'neutral', gray: 'neutral', brown: 'neutral', navy: 'neutral',
};

function normalize(value) {
  return String(value ?? '').trim().toLowerCase();
}

function colorHarmony(items) {
  const colors = items.map((item) => normalize(item.color)).filter(Boolean);
  if (colors.length < 2) return 0.5;
  const unique = [...new Set(colors)];
  if (unique.length === 1) return 1;
  const neutralCount = colors.filter((color) => NEUTRALS.has(color)).length;
  if (neutralCount >= colors.length - 1) return 0.95;
  const families = new Set(colors.map((color) => COLOR_FAMILIES[color] || 'other'));
  if (families.size === 1) return 0.8;
  if (families.size === 2 && families.has('neutral')) return 0.85;
  return 0.55;
}

function categoryCoverage(items, occasion) {
  const required = OCCASION_HINTS[occasion] || OCCASION_HINTS.Everyday;
  const present = new Set(items.map((item) => item.category));
  const core = required.filter((category) => present.has(category));
  return core.length / required.length;
}

function outfitScore(items, occasion) {
  if (!items.length) return 0;
  const categories = new Set(items.map((item) => item.category));
  const coverage = categoryCoverage(items, occasion);
  const harmony = colorHarmony(items);
  const favorites = items.filter((item) => item.favorite || item.fav).length / items.length;
  const versatility = Math.min(categories.size / 4, 1);
  const duplicatePenalty = (items.length - categories.size) * 0.07;
  return Math.max(0, Math.min(1,
    coverage * 0.45 + harmony * 0.30 + favorites * 0.10 + versatility * 0.15 - duplicatePenalty
  ));
}

/**
 * Recommend combinations from existing wardrobe items.
 * Returns only existing item IDs; never invents garments.
 */
export function recommendOutfits(items, options = {}) {
  const { occasion = 'Everyday', limit = 3, maxPieces = 5 } = options;
  if (!Array.isArray(items) || items.length < 2) return [];

  const usable = items.filter((item) =>
    item && item.id !== undefined && item.category && item.name
  );
  const tops = usable.filter((item) => item.category === 'Tops');
  const bottoms = usable.filter((item) => item.category === 'Bottoms');
  const shoes = usable.filter((item) => item.category === 'Shoes');
  const outerwear = usable.filter((item) => item.category === 'Outerwear');
  const bags = usable.filter((item) => item.category === 'Bags');
  const accessories = usable.filter((item) => item.category === 'Accessories');

  const pool = [];
  for (const top of tops) {
    for (const bottom of bottoms) {
      const shoeChoices = shoes.length ? shoes : [null];
      for (const shoe of shoeChoices) {
        const optionalLayers = [null, ...outerwear, ...bags, ...accessories];
        for (const optional of optionalLayers) {
          const combo = [top, bottom, shoe, optional].filter(Boolean);
          if (combo.length > maxPieces) continue;
          const ids = combo.map((item) => String(item.id));
          if (new Set(ids).size !== ids.length) continue;
          pool.push({
            ids: combo.map((item) => item.id),
            title: `${occasion} outfit`,
            score: Number(outfitScore(combo, occasion).toFixed(3)),
            rationale: buildRationale(combo, occasion),
          });
        }
      }
    }
  }

  const seen = new Set();
  return pool
    .sort((a, b) => b.score - a.score)
    .filter((outfit) => {
      const key = [...outfit.ids].map(String).sort().join('|');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, Math.max(1, limit));
}

function buildRationale(items, occasion) {
  const categories = [...new Set(items.map((item) => item.category.toLowerCase()))];
  const colors = [...new Set(items.map((item) => normalize(item.color)).filter(Boolean))];
  const colorText = colors.length ? `The ${colors.join(' and ')} palette works together` : 'The pieces make a versatile combination';
  return `${colorText}, with ${categories.join(', ')} covered for ${occasion.toLowerCase()}.`;
}
