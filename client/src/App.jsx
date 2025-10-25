import React, { useEffect, useState } from 'react';
import Filters from './components/Filters.jsx';
import ItemCard from './components/ItemCard.jsx';
import useInventory from './hooks/useInventory.js';

const EXAMPLE_STEAM_ID = '76561197960435530';

export default function App() {
  const [steamIdInput, setSteamIdInput] = useState('');
  const [rememberSteamId, setRememberSteamId] = useState(false);

  const {
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
  } = useInventory();

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const storedId = window.localStorage.getItem('cs2LastSteamId');
    if (storedId) {
      setSteamIdInput(storedId);
      setRememberSteamId(true);
      fetchInventory(storedId);
    }
  }, [fetchInventory]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (!rememberSteamId) {
      window.localStorage.removeItem('cs2LastSteamId');
    }
  }, [rememberSteamId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const success = await fetchInventory(steamIdInput);
    if (success && typeof window !== 'undefined') {
      if (rememberSteamId) {
        window.localStorage.setItem('cs2LastSteamId', steamIdInput.trim());
      } else {
        window.localStorage.removeItem('cs2LastSteamId');
      }
    }
  };

  const showEmptyState = hasFetched && items.length === 0;
  const showFilteredEmpty = hasFetched && items.length > 0 && filteredItems.length === 0;

  return (
    <div className="app">
      <main className="container">
        <header className="app__header">
          <h1>Counter-Strike 2 Inventory Viewer</h1>
          <form className="steam-form" onSubmit={handleSubmit} noValidate>
            <div>
              <label htmlFor="steam-id-input">SteamID64</label>
              <input
                id="steam-id-input"
                type="text"
                inputMode="numeric"
                aria-describedby="steam-id-helper"
                title="Enter a 17-digit SteamID64"
                placeholder={EXAMPLE_STEAM_ID}
                value={steamIdInput}
                onChange={(event) => setSteamIdInput(event.target.value)}
                onInvalid={(event) => event.preventDefault()}
              />
              <small id="steam-id-helper">Enter a 17-digit SteamID64.</small>
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Loading…' : 'Load Inventory'}
            </button>
            <label className="remember-control">
              <input
                type="checkbox"
                checked={rememberSteamId}
                onChange={(event) => setRememberSteamId(event.target.checked)}
              />
              Remember Steam ID
            </label>
          </form>
        </header>

        {loading && (
          <div className="status-message" role="status" aria-live="polite">
            <p>Loading inventory…</p>
          </div>
        )}

        {error && (
          <div className="status-message status-message--error" role="alert">
            <p>{error}</p>
            {lastSteamId && !error.startsWith('Please enter') && (
              <button type="button" onClick={() => fetchInventory(lastSteamId)} disabled={loading}>
                Try again
              </button>
            )}
          </div>
        )}

        {!hasFetched && !loading && !error && (
          <div className="status-message" role="status" aria-live="polite">
            <p>Enter a public SteamID64 above to load an inventory.</p>
          </div>
        )}

        {showEmptyState && !loading && !error && (
          <div className="status-message" role="status" aria-live="polite">
            <p>No items found for this inventory.</p>
          </div>
        )}

        {hasFetched && items.length > 0 && (
          <>
            <div className="summary-bar">
              <span>
                <strong>{items.length}</strong> total items
              </span>
              <span>
                <strong>{filteredItems.length}</strong> showing
              </span>
            </div>
            <Filters
              filters={filters}
              onFilterChange={setFilter}
              onReset={resetFilters}
              rarities={availableRarities}
              types={availableTypes}
            />
          </>
        )}

        {showFilteredEmpty && !loading && !error && (
          <div className="status-message" role="status" aria-live="polite">
            <p>No items match your current filters.</p>
          </div>
        )}

        {filteredItems.length > 0 && (
          <section className="inventory-grid" aria-live="polite">
            {filteredItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}
