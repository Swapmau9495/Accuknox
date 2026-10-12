import React, { useState, useRef } from 'react';
import { getCleanLabel } from '../../utils/chartDataHelper';

export const StackedBarWidget = ({ data }) => {
  const { totalMetric, totalLabel, segments = [] } = data;
  const totalValue = segments.reduce((sum, s) => sum + (Number(s.value) || 0), 0) || 1;

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltipX, setTooltipX] = useState(null);
  const trackRef = useRef(null);

  // Precompute segment percentages and center percentages
  let accumulatedPct = 0;
  const computedSegments = segments.map((seg) => {
    const val = Number(seg.value) || 0;
    const percentage = totalValue > 0 ? (val / totalValue) * 100 : 0;
    const centerPct = accumulatedPct + percentage / 2;
    accumulatedPct += percentage;
    return {
      ...seg,
      val,
      percentage,
      centerPct,
      cleanLabel: getCleanLabel(seg.label),
    };
  });

  const handleMouseEnterSegment = (idx, e) => {
    setHoveredIndex(idx);
    if (trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect();
      const clientX = e?.clientX !== undefined ? e.clientX : rect.left + ((computedSegments[idx]?.centerPct || 50) / 100) * rect.width;
      setTooltipX(clientX - rect.left);
    }
  };

  const handleMouseMoveSegment = (e) => {
    if (trackRef.current) {
      const rect = trackRef.current.getBoundingClientRect();
      setTooltipX(e.clientX - rect.left);
    }
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
    setTooltipX(null);
  };

  const handleMouseEnterLegend = (idx) => {
    setHoveredIndex(idx);
    if (trackRef.current && computedSegments[idx]) {
      const trackWidth = trackRef.current.offsetWidth || 300;
      setTooltipX((computedSegments[idx].centerPct / 100) * trackWidth);
    }
  };

  const activeSegment = hoveredIndex !== null ? computedSegments[hoveredIndex] : null;

  // Calculate clamped tooltip position
  let tooltipLeft = '50%';
  if (activeSegment) {
    if (trackRef.current) {
      const trackWidth = trackRef.current.offsetWidth || 300;
      const targetX = tooltipX !== null ? tooltipX : (activeSegment.centerPct / 100) * trackWidth;
      tooltipLeft = `${Math.max(55, Math.min(trackWidth - 55, targetX))}px`;
    } else {
      tooltipLeft = `${Math.max(15, Math.min(85, activeSegment.centerPct))}%`;
    }
  }

  return (
    <div className="stacked-bar-container">
      <div className="stacked-bar-header">
        <span className="stacked-bar-metric">{totalMetric}</span>
        <span className="stacked-bar-metric-label">{totalLabel}</span>
      </div>

      {/* Multi-segment horizontal bar with interactive tooltip */}
      <div className="stacked-track-wrapper" onMouseLeave={handleMouseLeave}>
        <div
          ref={trackRef}
          className="stacked-progress-track"
        >
          {computedSegments.map((seg, idx) => {
            const isHovered = hoveredIndex === idx;
            const isDimmed = hoveredIndex !== null && !isHovered;

            return (
              <div
                key={idx}
                className={`stacked-progress-segment ${isHovered ? 'segment-hovered' : ''} ${
                  isDimmed ? 'segment-dimmed' : ''
                }`}
                style={{
                  width: `${seg.percentage}%`,
                  backgroundColor: seg.color,
                }}
                onMouseEnter={(e) => handleMouseEnterSegment(idx, e)}
                onMouseMove={handleMouseMoveSegment}
                onClick={(e) => handleMouseEnterSegment(idx, e)}
              />
            );
          })}
        </div>

        {/* Custom floating tooltip positioned above the track */}
        {activeSegment && (
          <div
            className="stacked-custom-tooltip"
            style={{
              left: tooltipLeft,
            }}
          >
            <span
              className="tooltip-color-dot"
              style={{ backgroundColor: activeSegment.color }}
            />
            <span className="tooltip-title">{activeSegment.cleanLabel}:</span>
            <span className="tooltip-value">{activeSegment.val.toLocaleString()}</span>
            <span className="tooltip-pct">
              ({activeSegment.percentage.toFixed(activeSegment.percentage % 1 === 0 ? 0 : 1)}%)
            </span>
            <div className="tooltip-arrow" />
          </div>
        )}
      </div>

      {/* Legend below the bar */}
      <div className="stacked-bar-legend">
        {computedSegments.map((seg, idx) => {
          const isHovered = hoveredIndex === idx;
          const isDimmed = hoveredIndex !== null && !isHovered;

          return (
            <div
              key={idx}
              className={`stacked-legend-item ${isHovered ? 'legend-item-active' : ''} ${
                isDimmed ? 'legend-item-dimmed' : ''
              }`}
              onMouseEnter={() => handleMouseEnterLegend(idx)}
              onMouseLeave={handleMouseLeave}
              onClick={() => handleMouseEnterLegend(idx)}
            >
              <span
                className="legend-color-dot"
                style={{ backgroundColor: seg.color }}
              />
              <span className="legend-label">{seg.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StackedBarWidget;
