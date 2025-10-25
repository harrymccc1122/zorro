const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cache = require('./cache');

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5174;
const STEAM_BASE = process.env.STEAM_PROXY_URL || process.env.STEAM_INVENTORY_BASE || 'https://steamcommunity.com/inventory';
const CACHE_TTL_MS = 60 * 1000;
const ALLOWED_ORIGIN = 'http://localhost:5173';

app.use(cors({ origin: ALLOWED_ORIGIN }));

const STEAM_ID_REGEX = /^\d{17}$/;

function mergeItems(assets = [], descriptions = []) {
  const descriptionMap = new Map();
  for (const description of descriptions) {
    const key = `${description.classid}_${description.instanceid}`;
    descriptionMap.set(key, description);
  }

  return assets.map((asset) => {
    const key = `${asset.classid}_${asset.instanceid}`;
    const description = descriptionMap.get(key) || {};
    const rarityTag = Array.isArray(description.tags)
      ? description.tags.find((tag) => tag.category === 'Rarity')
      : null;
    const iconUrl = description.icon_url
      ? `https://steamcommunity-a.akamaihd.net/economy/image/${description.icon_url}`
      : null;

    return {
      id: asset.assetid,
      name: description.name || description.market_hash_name || 'Unknown item',
      marketHashName: description.market_hash_name || null,
      type: description.type || null,
      tradable: description.tradable === 1,
      iconUrl,
      rarity: rarityTag ? rarityTag.localized_tag_name || rarityTag.name : null
    };
  });
}

async function fetchInventory(steamId, appId, contextId, language) {
  const cacheKey = `${steamId}:${appId}:${contextId}:${language}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const url = `${STEAM_BASE}/${steamId}/${appId}/${contextId}?l=${encodeURIComponent(language)}&count=5000`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Steam responded with status ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.success === false || !Array.isArray(data.assets)) {
      throw new Error('Steam returned an unexpected payload.');
    }

    const items = mergeItems(data.assets, data.descriptions || []);
    const result = { items };
    cache.set(cacheKey, result, CACHE_TTL_MS);
    return result;
  } finally {
    clearTimeout(timeout);
  }
}

app.get('/api/inventory/:steamId', async (req, res) => {
  const { steamId } = req.params;
  const { appId = '730', contextId = '2', language = 'english' } = req.query;

  if (!STEAM_ID_REGEX.test(steamId)) {
    return res.status(400).json({ error: 'Please enter a valid 17-digit SteamID64.' });
  }

  try {
    const payload = await fetchInventory(steamId, appId, contextId, language);
    res.json(payload);
  } catch (error) {
    console.error('Failed to fetch inventory', error);
    res.status(502).json({ error: 'Unable to load the inventory from Steam. Please try again.' });
  }
});

app.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
