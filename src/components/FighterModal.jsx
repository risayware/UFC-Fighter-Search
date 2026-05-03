import React from 'react'

const FighterModal = ({ fighter, onClose }) => {
  const {
    name,
    nickname,
    imgUrl,
    category,
    fightingStyle,
    placeOfBirth,
    age,
    height,
    weight,
    reach,
    legReach,
    octagonDebut,
    trainsAt,
  } = fighter;

  // The API returns these as strings, so coerce to numbers before any
  // arithmetic — otherwise "+" concatenates ("21" + "1" = "211").
  const wins   = Number(fighter.wins)   || 0;
  const losses = Number(fighter.losses) || 0;
  const draws  = Number(fighter.draws)  || 0;

  const totalFights = wins + losses + draws;
  const winPct = totalFights > 0 ? Math.round((wins / totalFights) * 100) : 0;

  const formatHeight = (inches) => {
    if (!inches) return null;
    const total = Number(inches);
    const feet  = Math.floor(total / 12);
    const inch  = Math.round(total % 12);
    return `${feet}'${inch}"`;
  };

  const formatReach = (val) => {
    if (!val) return null;
    return `${Number(val).toFixed(0)}"`;
  };

  const formatWeight = (val) => {
    if (!val) return null;
    return `${Number(val).toFixed(0)} lbs`;
  };

  // Stop clicks inside the modal from bubbling up to the backdrop and closing it.
  const handleModalClick = (e) => e.stopPropagation();

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Fighter details for ${name}`}
    >
      <div className="modal-content" onClick={handleModalClick}>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Close fighter details"
        >
          ✕
        </button>

        <div className="modal-header">
          <div className="modal-image-wrapper">
            <img
              src={imgUrl || '/no-fighter.svg'}
              alt={name}
              onError={(e) => { e.target.src = '/no-fighter.svg'; }}
            />
          </div>

          <div className="modal-basic-info">
            {nickname && (
              <p className="modal-nickname">"{nickname}"</p>
            )}

            <h2>{name}</h2>

            {category && (
              <span className="modal-weight-class">{category}</span>
            )}

            <div className="modal-record">
              <div className="record-stat">
                <span className="record-val wins">{wins}</span>
                <span className="record-lbl">Wins</span>
              </div>
              <div className="record-divider" />
              <div className="record-stat">
                <span className="record-val losses">{losses}</span>
                <span className="record-lbl">Losses</span>
              </div>
              <div className="record-divider" />
              <div className="record-stat">
                <span className="record-val draws">{draws}</span>
                <span className="record-lbl">Draws</span>
              </div>
            </div>

            {totalFights > 0 && (
              <div className="win-bar-wrapper">
                <div className="win-bar-label">
                  <span>Win Rate</span>
                  <span className="win-bar-pct">{winPct}%</span>
                </div>
                <div className="win-bar-track">
                  <div
                    className="win-bar-fill"
                    style={{ width: `${winPct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-divider" />

        <div className="modal-stats">
          <h3 className="stats-title">Fighter Profile</h3>

          <div className="stats-grid">
            {fightingStyle && <StatRow label="Fighting Style" value={fightingStyle} />}
            {age && <StatRow label="Age" value={`${age} years old`} />}
            {height && <StatRow label="Height" value={formatHeight(height)} />}
            {weight && <StatRow label="Weight" value={formatWeight(weight)} />}
            {reach && <StatRow label="Reach" value={formatReach(reach)} />}
            {legReach && <StatRow label="Leg Reach" value={formatReach(legReach)} />}
            {placeOfBirth && <StatRow label="Hometown" value={placeOfBirth} />}
            {trainsAt && <StatRow label="Trains At" value={trainsAt} />}
            {octagonDebut && <StatRow label="UFC Debut" value={octagonDebut} />}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatRow = ({ label, value }) => (
  <div className="stat-row">
    <span className="stat-label">{label}</span>
    <span className="stat-value">{value}</span>
  </div>
);

export default FighterModal;
