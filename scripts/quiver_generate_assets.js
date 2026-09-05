#!/usr/bin/env node

/**
 * Quiver AI Asset Generator for Bataa Mobile App
 * Generates and caches SVG vector assets using Quiver AI's arrow-1.1 model.
 */

const fs = require('fs');
const path = require('path');

const QUIVER_API_KEY = process.env.QUIVERAI_API_KEY || 'sk_live_MSXhaKFZbA2z2KErFRQJHj';
const BASE_URL = 'https://api.quiver.ai/v1';

const ASSET_SPECS = [
  {
    name: 'mascot_celebration',
    prompt: 'Cute 3D stylized white duck mascot jumping happily on a shiny golden 5-point star, celebration confetti particles in teal, orange, red and yellow floating around, playful cartoon style',
    instructions: 'Clean production-ready SVG with clean paths, no background rectangle, centered viewBox 0 0 240 240, high contrast, warm lighting',
  },
  {
    name: 'mascot_avatar',
    prompt: 'Cute friendly white duck face portrait with big expressive eyes and a bright yellow-orange bill, circular avatar style',
    instructions: 'Flat vector icon with subtle gradients, centered viewBox 0 0 100 100, no background',
  },
  {
    name: 'streak_freeze',
    prompt: 'A glowing faceted blue diamond ice crystal gem for gaming streak freeze',
    instructions: 'Isometric vector icon, cyan and sky-blue gradients, crisp facets, transparent background, viewBox 0 0 100 100',
  },
  {
    name: 'double_xp',
    prompt: 'Glossy purple circular token badge with bold white XP typography and golden sparkles',
    instructions: 'Rich purple and violet gradient circle, gold border, vector SVG icon, viewBox 0 0 100 100',
  },
  {
    name: 'hint_lightbulb',
    prompt: 'Bright glowing yellow idea lightbulb icon with soft ambient glow rays',
    instructions: 'Warm golden yellow bulb with screw base, flat vector illustration, viewBox 0 0 100 100',
  },
  {
    name: 'health_heart',
    prompt: 'Glossy 3D red heart gaming life health refill icon',
    instructions: 'Vibrant crimson and ruby heart with glossy specular highlight, clean vector SVG, viewBox 0 0 100 100',
  },
];

async function checkAccountAndModels() {
  console.log('Checking Quiver AI account status...');
  try {
    const res = await fetch(`${BASE_URL}/models`, {
      headers: {
        Authorization: `Bearer ${QUIVER_API_KEY}`,
      },
    });
    if (!res.ok) {
      console.error(`Failed to list models: HTTP ${res.status}`);
      return false;
    }
    const data = await res.json();
    console.log('Available Quiver models:', data.data?.map((m) => m.id).join(', '));
    return true;
  } catch (err) {
    console.error('Network error checking Quiver API:', err.message);
    return false;
  }
}

async function generateSVG(spec, outputDir) {
  console.log(`\nGenerating: ${spec.name}...`);
  try {
    const res = await fetch(`${BASE_URL}/svgs/generations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${QUIVER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'arrow-1.1',
        prompt: spec.prompt,
        instructions: spec.instructions,
        n: 1,
      }),
    });

    if (res.status === 402) {
      console.warn(`[Credit Notice] Quiver AI account currently has 0 credits. Top up at https://app.quiver.ai/settings/billing`);
      return false;
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error(`API Error for ${spec.name}:`, res.status, errData);
      return false;
    }

    const result = await res.json();
    const svgContent = result.data?.[0]?.svg;
    if (svgContent) {
      const outFile = path.join(outputDir, `${spec.name}.svg`);
      fs.writeFileSync(outFile, svgContent, 'utf-8');
      console.log(`Saved SVG to ${outFile} (credits debited: ${result.credits})`);
      return true;
    }
  } catch (err) {
    console.error(`Exception generating ${spec.name}:`, err.message);
  }
  return false;
}

async function main() {
  const outputDir = path.join(__dirname, '..', 'mobile', 'assets', 'svgs');
  fs.mkdirSync(outputDir, { recursive: true });

  const ok = await checkAccountAndModels();
  if (!ok) return;

  for (const spec of ASSET_SPECS) {
    await generateSVG(spec, outputDir);
  }
}

if (require.main === module) {
  main();
}

module.exports = { ASSET_SPECS, checkAccountAndModels, generateSVG };
