import React from 'react'

const FighterCard = ({ fighter, onSelect }) => {
  const {
    name,
    imgUrl,
    category,
    wins,
    losses,
    draws,
    fightingStyle,
    nickname,
  } = fighter;

  const record = `${wins ?? 0}-${losses ?? 0}-${draws ?? 0}`;
  const isUndefeated = (losses ?? 0) === 0 && (draws ?? 0) === 0;

  return (
    <div
      className="fighter-card"
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
      aria-label={`View details for ${name}`}
    >
      <div className="card-image-wrapper">
        <img
          src={imgUrl || '/no-fighter.svg'}
          alt={name}
          onError={(e) => { e.target.src = '/no-fighter.svg'; }}
        />

        {isUndefeated && wins > 0 && (
          <span className="undefeated-badge">Undefeated</span>
        )}
      </div>

      <div className="card-info">
        {nickname && (
          <p className="fighter-nickname">"{nickname}"</p>
        )}

        <h3>{name}</h3>

        <div className="card-record">
          <span className="record-number">{record}</span>
          <span className="record-label">W-L-D</span>
        </div>

        <div className="card-meta">
          {category && (
            <span className="weight-class-tag">{category}</span>
          )}

          {fightingStyle && (
            <>
              <span className="dot">•</span>
              <span className="fighting-style">{fightingStyle}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FighterCard;
