import React from 'react';

export const StackedBarWidget = ({ data }) => {
  const { totalMetric, totalLabel, segments = [] } = data;
  const totalValue = segments.reduce((sum, s) => sum + (Number(s.value) || 0), 0) || 1;

  return (
    <div className="stacked-bar-container">
      <div className="stacked-bar-header">
        <span className="stacked-bar-metric">{totalMetric}</span>
        <span className="stacked-bar-metric-label">{totalLabel}</span>
      </div>

      {/* Multi-segment horizontal bar */}
      <div className="stacked-progress-track">
        {segments.map((seg, idx) => {
          const percentage = ((Number(seg.value) || 0) / totalValue) * 100;
          return (
            <div
              key={idx}
              className="stacked-progress-segment"
              style={{
                width: `${percentage}%`,
                backgroundColor: seg.color,
              }}
              title={`${seg.label}: ${seg.value}`}
            />
          );
        })}
      </div>

      {/* Legend below the bar */}
      <div className="stacked-bar-legend">
        {segments.map((seg, idx) => (
          <div key={idx} className="stacked-legend-item">
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

export default StackedBarWidget;
