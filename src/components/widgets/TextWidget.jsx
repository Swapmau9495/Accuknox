import React from 'react';
import { FileText, Clock } from 'lucide-react';

export const TextWidget = ({ widget }) => {
  const { text, data = {}, createdAt } = widget;
  const description = data.description || text;
  const badge = data.badge;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null;

  return (
    <div className="text-widget-container">
      {badge && <div className="text-widget-badge">{badge}</div>}

      <div className="text-widget-content">
        <div className="text-widget-icon-wrap">
          <FileText size={18} className="text-widget-icon" />
        </div>
        <p className="text-widget-description">{description}</p>
      </div>

      {formattedDate && (
        <div className="text-widget-footer">
          <Clock size={12} />
          <span>Added {formattedDate}</span>
        </div>
      )}
    </div>
  );
};

export default TextWidget;
