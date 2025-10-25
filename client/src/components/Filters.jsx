import React from 'react';

export default function Filters({
  filters,
  onFilterChange,
  onReset,
  rarities,
  types
}) {
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    onFilterChange(name, value);
  };

  const handleTradableChange = (event) => {
    onFilterChange('tradableOnly', event.target.checked);
  };

  const isFiltersDefault = !filters.q && !filters.rarity && !filters.type && !filters.tradableOnly;

  return (
    <section className="filters" aria-label="Inventory filters">
      <div className="filters__row">
        <div>
          <label htmlFor="filter-search">Search</label>
          <input
            id="filter-search"
            type="text"
            name="q"
            placeholder="Search by name or market hash name"
            value={filters.q}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label htmlFor="filter-rarity">Rarity</label>
          <select
            id="filter-rarity"
            name="rarity"
            value={filters.rarity}
            onChange={handleInputChange}
          >
            <option value="">All rarities</option>
            {rarities.map((rarity) => (
              <option key={rarity} value={rarity}>
                {rarity}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="filter-type">Type</label>
          <select
            id="filter-type"
            name="type"
            value={filters.type}
            onChange={handleInputChange}
          >
            <option value="">All types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="filters__row">
        <label className="filters__checkbox" htmlFor="filter-tradable">
          <input
            id="filter-tradable"
            type="checkbox"
            name="tradableOnly"
            checked={filters.tradableOnly}
            onChange={handleTradableChange}
          />
          Show only tradable items
        </label>
      </div>
      <div className="filters__actions">
        <button type="button" onClick={onReset} disabled={isFiltersDefault}>
          Reset filters
        </button>
      </div>
    </section>
  );
}
