import React from 'react';

export const EmptyChartWidget = ({ data = {} }) => {
  const message = data.message || 'No Graph data available!';

  return (
    <div className="empty-chart-container">
      <div className="empty-chart-illustration">
        <svg
          width="64"
          height="54"
          viewBox="0 0 64 54"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="empty-chart-svg"
        >
          {/* Subtle grid background */}
          <line x1="2" y1="46" x2="62" y2="46" stroke="#e2e8f0" strokeWidth="1.5" />
          <line x1="2" y1="32" x2="62" y2="32" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 2" />
          <line x1="2" y1="18" x2="62" y2="18" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 2" />

          {/* Stepped bar outlines */}
          <rect x="8" y="28" width="8" height="18" rx="1.5" stroke="#cbd5e1" strokeWidth="1.5" fill="#f8fafc" />
          <rect x="22" y="16" width="8" height="30" rx="1.5" stroke="#cbd5e1" strokeWidth="1.5" fill="#f8fafc" />
          <rect x="36" y="22" width="8" height="24" rx="1.5" stroke="#cbd5e1" strokeWidth="1.5" fill="#f8fafc" />
          <rect x="50" y="10" width="8" height="36" rx="1.5" stroke="#cbd5e1" strokeWidth="1.5" fill="#f8fafc" />

          {/* Ascending trend line */}
          <path
            d="M12 28L26 16L40 22L54 10"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <p className="empty-chart-message">{message}</p>
    </div>
  );
};

export default EmptyChartWidget;
