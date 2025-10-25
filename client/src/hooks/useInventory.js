import { useCallback, useMemo, useState } from 'react';

const DEFAULT_FILTERS = {
  q: '',
  rarity: '',
  type: '',
  tradableOnly: false
};

const STEAM_ID_REGEX = /^\d{17}$/;

const getInitialFilters = () => {
  if (typeof window === 'undefined') {
    return { ...DEFAULT_FILTERS };
  }
  try {
    const stored = window.localStorage.getItem('cs2InventoryFilters');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_FILTERS,
        ...parsed,
        tradableOnly: Boolean(parsed?.tradableOnly)
      };
    }
  } catch (error) {
    console.warn('Failed to parse stored filters', error);
  }
  return { ...DEFAULT_FILTERS };
};

export default function useInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(getInitialFilters);
  const [hasFetched, setHasFetched] = useState(false);
  const [lastSteamId, setLastSteamId] = useState(null);

  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5174';

  const persistFilters = useCallback((nextFilters) => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      window.localStorage.setItem('cs2InventoryFilters', JSON.stringify(nextFilters));
    } catch (storageError) {
      console.warn('Failed to persist filters', storageError);
    }
  }, []);

  const updateFilters = useCallback((updates) => {
    setFilters((prev) => {
      const next = { ...prev, ...updates };
      persistFilters(next);
      return next;
    });
  }, [persistFilters]);

  const resetFilters = useCallback(() => {
    const next = { ...DEFAULT_FILTERS };
    setFilters(next);
    persistFilters(next);
  }, [persistFilters]);

  const fetchInventory = useCallback(
    async (steamId) => {
      const trimmed = (steamId || '').trim();

      if (!STEAM_ID_REGEX.test(trimmed)) {
        setError('Please enter a valid 17-digit SteamID64.');
        setItems([]);
        setHasFetched(false);
        setLastSteamId(null);
        return false;
      }

      setLoading(true);
      setError(null);
      setLastSteamId(trimmed);

      try {
        const response = await fetch(`${apiBase}/api/inventory/${trimmed}`);

        if (!response.ok) {
          let message = 'Unable to load the inventory from Steam. Please try again.';
          try {
            const payload = await response.json();
            if (payload?.error) {
              message = payload.error;
            }
          } catch (parseError) {
            // ignore
          }
          setError(message);
          return false;
        }

        const data = await response.json();
        const fetchedItems = Array.isArray(data.items) ? data.items : [];
        setItems(fetchedItems);
        setHasFetched(true);
        return true;
      } catch (fetchError) {
        console.error('Inventory request failed', fetchError);
        if (fetchError.name === 'AbortError') {
          setError('The request timed out. Please try again.');
        } else {
          setError('Unable to reach the server. Please try again.');
        }
        return false;
      } finally {
        setLoading(false);
      }
    },
    [apiBase]
  );

  const filteredItems = useMemo(() => {
    const search = filters.q.trim().toLowerCase();

    return items.filter((item) => {
      const matchesSearch = !search
        || (item.name && item.name.toLowerCase().includes(search))
        || (item.marketHashName && item.marketHashName.toLowerCase().includes(search));
      const matchesRarity = !filters.rarity || item.rarity === filters.rarity;
      const matchesType = !filters.type || item.type === filters.type;
      const matchesTradable = !filters.tradableOnly || item.tradable;
      return matchesSearch && matchesRarity && matchesType && matchesTradable;
    });
  }, [items, filters]);

  const availableRarities = useMemo(() => {
    const unique = new Set();
    items.forEach((item) => {
      if (item.rarity) {
        unique.add(item.rarity);
      }
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const availableTypes = useMemo(() => {
    const unique = new Set();
    items.forEach((item) => {
      if (item.type) {
        unique.add(item.type);
      }
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [items]);

  const setFilter = useCallback((name, value) => {
    updateFilters({ [name]: value });
  }, [updateFilters]);

  return {
    items,
    filteredItems,
    filters,
    setFilter,
    resetFilters,
    availableRarities,
    availableTypes,
    loading,
    error,
    hasFetched,
    lastSteamId,
    fetchInventory
  };
}
