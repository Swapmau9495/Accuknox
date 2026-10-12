import React from 'react';
import { Plus } from 'lucide-react';

export const AddWidgetCard = ({ onClick, categoryName }) => {
  return (
    <div className="add-widget-card" onClick={onClick} role="button" tabIndex={0}>
      <button
        type="button"
        className="add-widget-card-btn"
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        aria-label={`Add widget to ${categoryName}`}
      >
        <Plus size={16} strokeWidth={2.5} />
        <span>Add Widget</span>
      </button>
    </div>
  );
};

export default AddWidgetCard;
