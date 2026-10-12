import React from 'react';

export const DonutWidget = ({ data }) => {
  const { total, centerLabel = 'Total', segments = [] } = data;

  const totalValue = segments.reduce((sum, s) => sum + (Number(s.value) || 0), 0) || total || 1;
  const radius = 52;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  // Compute strokeDasharray and strokeDashoffset for each segment
  let accumulatedPercent = 0;
  const renderedSegments = segments.map((seg) => {
    const val = Number(seg.value) || 0;
    const ratio = totalValue > 0 ? val / totalValue : 0;
    const strokeDasharray = `${ratio * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += ratio;
    return {
      ...seg,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="donut-widget-container">
      <div className="donut-chart-wrapper">
        <svg
          viewBox="0 0 140 140"
          className="donut-svg"
          aria-label={`Donut chart with total ${total}`}
        >
          {/* Background track circle */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {/* Slices rotated -90deg so they start at 12 o'clock */}
          <g transform="rotate(-90 70 70)">
            {renderedSegments.map((seg, idx) => (
              <circle
                key={idx}
                cx="70"
                cy="70"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={seg.strokeDasharray}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="butt"
                className="donut-slice"
              />
            ))}
          </g>
        </svg>
        <div className="donut-center-text">
          <span className="donut-total-number">{total.toLocaleString()}</span>
          <span className="donut-total-label">{centerLabel}</span>
        </div>
      </div>

      <div className="donut-legend">
        {segments.map((seg, idx) => (
          <div key={idx} className="legend-item">
            <span
              className="legend-color-dot"
              style={{ backgroundColor: seg.color }}
            />
            <span className="legend-label">{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutWidget;
