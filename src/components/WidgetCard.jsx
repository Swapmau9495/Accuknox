import React from 'react';
import { X } from 'lucide-react';
import DonutWidget from './widgets/DonutWidget';
import StackedBarWidget from './widgets/StackedBarWidget';
import EmptyChartWidget from './widgets/EmptyChartWidget';
import TextWidget from './widgets/TextWidget';
import { generateDonutData, generateStackedBarData } from '../utils/chartDataHelper';

export const WidgetCard = ({ widget, categoryId, onRemove, isSearchMatch }) => {
  const renderContent = () => {
    if (categoryId === 'cspm' || widget.type === 'donut') {
      const data = generateDonutData(widget.name, widget.text, widget.data);
      return <DonutWidget data={data} />;
    }

    if (categoryId === 'registry_scan' || categoryId === 'image' || widget.type === 'stacked_bar') {
      const data = generateStackedBarData(widget.name, widget.text, widget.data);
      return <StackedBarWidget data={data} />;
    }

    if (widget.type === 'empty_chart') {
      return <EmptyChartWidget data={widget.data} />;
    }

    // Ticket and text widgets
    return <TextWidget widget={widget} />;
  };

  return (
    <div
      className={`widget-card ${isSearchMatch ? 'widget-highlight' : ''}`}
      data-testid={`widget-${widget.id}`}
    >
      <div className="widget-header">
        <h3 className="widget-title" title={widget.name}>
          {widget.name}
        </h3>
        <button
          type="button"
          className="widget-remove-btn"
          onClick={() => onRemove(categoryId, widget.id)}
          aria-label={`Remove ${widget.name}`}
          title="Remove widget"
        >
          <X size={15} />
        </button>
      </div>

      <div className="widget-body">{renderContent()}</div>
    </div>
  );
};

export default WidgetCard;
