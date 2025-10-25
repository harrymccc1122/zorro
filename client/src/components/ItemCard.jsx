import React from 'react';

export default function ItemCard({ item }) {
  const { iconUrl, name, type, rarity, tradable, marketHashName } = item;

  return (
    <article className="item-card" title={marketHashName || name}>
      <div className="item-card__image-wrapper">
        {iconUrl ? (
          <img src={iconUrl} alt={name} loading="lazy" />
        ) : (
          <div className="item-card__placeholder" aria-hidden="true" />
        )}
      </div>
      <div className="item-card__content">
        <h3>{name}</h3>
        {type && <p className="item-card__type">{type}</p>}
        <div className="item-card__meta">
          {rarity && <span className="item-card__badge item-card__badge--rarity">{rarity}</span>}
          <span
            className={`item-card__badge ${
              tradable ? 'item-card__badge--tradable' : 'item-card__badge--not-tradable'
            }`}
          >
            {tradable ? 'Tradable' : 'Not tradable'}
          </span>
        </div>
      </div>
    </article>
  );
}
