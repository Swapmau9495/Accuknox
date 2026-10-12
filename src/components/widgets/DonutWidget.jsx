import React, { useState, useRef } from 'react';
import { getCleanLabel } from '../../utils/chartDataHelper';

export const DonutWidget = ({ data }) => {
  const { total, centerLabel = 'Total', segments = [] } = data;

  const totalValue = segments.reduce((sum, s) => sum + (Number(s.value) || 0), 0) || total || 1;
  const radius = 52;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // Compute strokeDasharray and strokeDashoffset for each segment
  let accumulatedPercent = 0;
  const computedSegments = segments.map((seg, idx) => {
    const val = Number(seg.value) || 0;
    const ratio = totalValue > 0 ? val / totalValue : 0;
    const strokeDasharray = `${ratio * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedPercent * circumference;
    accumulatedPercent += ratio;
    const cleanLabel = getCleanLabel(seg.label);
    const pct = (ratio * 100).toFixed((ratio * 100) % 1 === 0 ? 0 : 1);
    return {
      ...seg,
      val,
      ratio,
      strokeDasharray,
      strokeDashoffset,
      cleanLabel,
      pct,
      index: idx,
    };
  });

  const updateMousePos = (e) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleSliceMouseEnter = (idx, e) => {
    setHoveredIndex(idx);
    updateMousePos(e);
  };

  const handleMouseMove = (e) => {
    updateMousePos(e);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const handleLegendMouseEnter = (idx, e) => {
    setHoveredIndex(idx);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // Default to near the donut center/slice
      setMousePos({
        x: 70,
        y: 60,
      });
    }
  };

  const activeSegment = hoveredIndex !== null ? computedSegments[hoveredIndex] : null;

  // Clamped position for tooltip
  let clampedX = mousePos.x;
  let clampedY = mousePos.y;
  let isNearTop = false;
  if (containerRef.current) {
    const width = containerRef.current.offsetWidth || 280;
    clampedX = Math.max(60, Math.min(width - 60, mousePos.x));
    isNearTop = mousePos.y < 50;
  }

  return (
    <div
      ref={containerRef}
      className="donut-widget-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
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
            {computedSegments.map((seg, idx) => {
              const isHovered = hoveredIndex === idx;
              const isDimmed = hoveredIndex !== null && !isHovered;

              return (
                <circle
                  key={idx}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  strokeLinecap="butt"
                  className={`donut-slice ${isHovered ? 'slice-hovered' : ''} ${
                    isDimmed ? 'slice-dimmed' : ''
                  }`}
                  onMouseEnter={(e) => handleSliceMouseEnter(idx, e)}
                  onClick={(e) => handleSliceMouseEnter(idx, e)}
                  style={{
                    cursor: 'pointer',
                    transition: 'stroke-width 0.2s ease, opacity 0.2s ease, filter 0.2s ease',
                    filter: isHovered
                      ? 'brightness(1.1) drop-shadow(0 2px 5px rgba(0,0,0,0.2))'
                      : 'none',
                    opacity: isDimmed ? 0.6 : 1,
                  }}
                />
              );
            })}
          </g>
        </svg>
        <div className="donut-center-text">
          <span className="donut-total-number">{total.toLocaleString()}</span>
          <span className="donut-total-label">{centerLabel}</span>
        </div>
      </div>

      <div className="donut-legend">
        {computedSegments.map((seg, idx) => {
          const isHovered = hoveredIndex === idx;
          const isDimmed = hoveredIndex !== null && !isHovered;

          return (
            <div
              key={idx}
              className={`legend-item ${isHovered ? 'legend-item-active' : ''} ${
                isDimmed ? 'legend-item-dimmed' : ''
              }`}
              onMouseEnter={(e) => handleLegendMouseEnter(idx, e)}
              onMouseLeave={handleMouseLeave}
              onClick={(e) => handleLegendMouseEnter(idx, e)}
              style={{ cursor: 'pointer' }}
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

      {/* Floating Tooltip */}
      {activeSegment && (
        <div
          className={`chart-floating-tooltip ${isNearTop ? 'tooltip-bottom' : 'tooltip-top'}`}
          style={{
            left: `${clampedX}px`,
            top: `${clampedY}px`,
          }}
        >
          <span
            className="tooltip-color-dot"
            style={{ backgroundColor: activeSegment.color }}
          />
          <span className="tooltip-title">{activeSegment.cleanLabel}:</span>
          <span className="tooltip-value">{activeSegment.val.toLocaleString()}</span>
          <span className="tooltip-pct">({activeSegment.pct}%)</span>
          <div className="tooltip-arrow" />
        </div>
      )}
    </div>
  );
};

export default DonutWidget;
