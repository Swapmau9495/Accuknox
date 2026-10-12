import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckSquare, Square } from 'lucide-react';
import {
  getDefaultTypeForCategory,
  createChartDataFromPairs,
} from '../utils/chartDataHelper';

// Initially keep only 1 row and that too blank with placeholder
const getInitialMetricPair = () => [{ key: '', value: '' }];

const getKeyPlaceholder = (catId, idx) => {
  if (catId === 'cspm') return idx === 0 ? 'e.g. Active' : 'e.g. Inactive';
  if (catId === 'registry_scan' || catId === 'image') return idx === 0 ? 'e.g. Critical' : idx === 1 ? 'e.g. High' : 'e.g. Medium';
  if (catId === 'ticket') return idx === 0 ? 'e.g. Open' : 'e.g. Resolved';
  return 'e.g. Metric Label';
};

const getValuePlaceholder = (catId, idx) => {
  if (catId === 'cspm') return idx === 0 ? 'e.g. 10' : 'e.g. 5';
  if (catId === 'registry_scan' || catId === 'image') return idx === 0 ? 'e.g. 3' : idx === 1 ? 'e.g. 7' : 'e.g. 12';
  return 'e.g. Count';
};

export const AddWidgetDrawer = ({
  isOpen,
  onClose,
  categories,
  initialCategoryId,
  onBatchConfirm,
  onAddNewWidget,
  onDeleteWidget,
}) => {
  const [activeTabId, setActiveTabId] = useState(initialCategoryId || categories[0]?.id || '');
  // Map of categoryId -> Set of selected widget IDs
  const [selectedWidgetIds, setSelectedWidgetIds] = useState({});

  // Custom widget form state - initially only 1 blank row
  const [customName, setCustomName] = useState('');
  const [metricPairs, setMetricPairs] = useState(getInitialMetricPair());
  const [formError, setFormError] = useState('');

  // Delete confirmation state
  const [widgetToDelete, setWidgetToDelete] = useState(null);

  // When active category tab switches, reset to 1 blank row
  useEffect(() => {
    setMetricPairs(getInitialMetricPair());
    setFormError('');
  }, [activeTabId]);

  // Initialize checked state when the drawer is opened
  useEffect(() => {
    if (isOpen) {
      const initialMap = {};
      categories.forEach((cat) => {
        const visibleIds = cat.widgets.filter((w) => w.visible !== false).map((w) => w.id);
        initialMap[cat.id] = visibleIds;
      });
      setSelectedWidgetIds(initialMap);

      const targetId = initialCategoryId && categories.some((c) => c.id === initialCategoryId)
        ? initialCategoryId
        : categories[0]?.id || '';

      setActiveTabId(targetId);
      setCustomName('');
      setMetricPairs(getInitialMetricPair());
      setFormError('');
      setWidgetToDelete(null);
    }
  }, [isOpen]);

  // When categories change (widgets added/deleted), keep selectedWidgetIds in sync
  useEffect(() => {
    if (isOpen) {
      setSelectedWidgetIds((prev) => {
        const updated = { ...prev };
        categories.forEach((cat) => {
          const existingIds = new Set(cat.widgets.map((w) => w.id));
          // Filter out deleted widgets
          const currentList = (updated[cat.id] || []).filter((id) => existingIds.has(id));
          // Add any newly added widgets that are visible
          cat.widgets.forEach((w) => {
            if (w.visible !== false && !currentList.includes(w.id)) {
              currentList.push(w.id);
            }
          });
          updated[cat.id] = currentList;
        });
        return updated;
      });
    }
  }, [categories, isOpen]);

  if (!isOpen) return null;

  const currentCategory = categories.find((c) => c.id === activeTabId) || categories[0];
  const currentSelectedList = selectedWidgetIds[activeTabId] || [];

  const handleToggleWidget = (widgetId) => {
    setSelectedWidgetIds((prev) => {
      const currentIds = prev[activeTabId] || [];
      const updated = currentIds.includes(widgetId)
        ? currentIds.filter((id) => id !== widgetId)
        : [...currentIds, widgetId];
      return {
        ...prev,
        [activeTabId]: updated,
      };
    });
  };

  // Open confirmation box when delete icon is clicked
  const handleDeleteIconClick = (e, widget) => {
    e.preventDefault();
    e.stopPropagation();
    setWidgetToDelete({
      categoryId: activeTabId,
      widgetId: widget.id,
      widgetName: widget.name,
    });
  };

  // User confirms deletion inside the confirmation box
  const handleConfirmDelete = () => {
    if (!widgetToDelete) return;
    const { categoryId, widgetId } = widgetToDelete;

    // 1. Immediately remove from local drawer selection state
    setSelectedWidgetIds((prev) => {
      const currentList = prev[categoryId] || [];
      return {
        ...prev,
        [categoryId]: currentList.filter((id) => id !== widgetId),
      };
    });

    // 2. Dispatch delete permanently to store
    onDeleteWidget(categoryId, widgetId);

    // 3. Close confirmation modal
    setWidgetToDelete(null);
  };

  const handleConfirm = () => {
    onBatchConfirm(selectedWidgetIds);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  // Metric pairs management
  const handleAddMetricRow = () => {
    setMetricPairs((prev) => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveMetricRow = (index) => {
    if (metricPairs.length <= 1) return;
    setMetricPairs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMetricChange = (index, field, value) => {
    setMetricPairs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!customName.trim()) {
      setFormError('Please enter a widget name');
      return;
    }

    const validPairs = metricPairs.filter(
      (p) => p && p.key && p.key.trim() && p.value !== '' && !isNaN(Number(p.value)) && Number(p.value) >= 0
    );

    if (validPairs.length === 0) {
      setFormError('Please provide at least one metric key and count (e.g. Active - 10)');
      return;
    }

    setFormError('');
    const targetType = getDefaultTypeForCategory(activeTabId);
    const chartData = createChartDataFromPairs(validPairs, targetType);
    const summaryText = validPairs.map((p) => `${p.key}: ${p.value}`).join(', ');

    onAddNewWidget({
      categoryId: activeTabId,
      name: customName.trim(),
      text: summaryText,
      type: targetType,
      data: chartData,
    });

    setCustomName('');
    setMetricPairs(getInitialMetricPair());
  };

  return (
    <div className="drawer-overlay" onClick={handleCancel}>
      <aside
        className="drawer-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="drawer-title"
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <h2 id="drawer-title" className="drawer-title">
            Add Widget
          </h2>
          <button
            type="button"
            className="drawer-close-btn"
            onClick={handleCancel}
            aria-label="Close add widget modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Subtitle */}
        <div className="drawer-subhead">
          <p className="drawer-description">
            Personalise your dashboard by adding the following widget
          </p>
        </div>

        {/* Category Tabs */}
        <div className="drawer-tabs-wrapper">
          <div className="drawer-tabs" role="tablist">
            {categories.map((cat) => {
              const isActive = cat.id === activeTabId;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`drawer-tab-btn ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTabId(cat.id)}
                >
                  {cat.shortName || cat.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Body Content */}
        <div className="drawer-body">
          {activeTabId === 'ticket' ? (
            <div className="drawer-blank-tab" />
          ) : (
            <>
              {/* Section 1: Checkbox list of widgets in active category with delete confirmation */}
              <div className="drawer-section">
                <div className="section-title-row">
                  <span className="section-label">
                    Widgets in {currentCategory?.shortName || currentCategory?.name}
                  </span>
                  <span className="section-count">
                    {currentSelectedList.length} of {currentCategory?.widgets?.length || 0} active
                  </span>
                </div>

                <div className="widget-checklist">
                  {currentCategory?.widgets?.map((widget) => {
                    const isChecked = currentSelectedList.includes(widget.id);
                    return (
                      <div
                        key={widget.id}
                        className={`checklist-item ${isChecked ? 'item-checked' : ''}`}
                        onClick={() => handleToggleWidget(widget.id)}
                      >
                        <label className="checklist-label" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleWidget(widget.id)}
                            className="checklist-checkbox"
                          />
                          <span className="checklist-custom-box">
                            {isChecked ? <CheckSquare size={17} /> : <Square size={17} />}
                          </span>
                          <span className="checklist-widget-name">{widget.name}</span>
                        </label>

                        {/* Delete button: triggers confirmation box */}
                        <button
                          type="button"
                          className="checklist-delete-btn"
                          title={`Delete widget "${widget.name}"`}
                          onClick={(e) => handleDeleteIconClick(e, widget)}
                          aria-label={`Delete ${widget.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    );
                  })}

                  {(!currentCategory?.widgets || currentCategory.widgets.length === 0) && (
                    <div className="checklist-empty">
                      No widgets in this category. Add a new widget below!
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Form to Add a New Custom Widget (only for categories that support custom widgets) */}
              {activeTabId !== 'cwpp' && activeTabId !== 'ticket' && (
                <div className="drawer-custom-form-wrapper">
                  <div className="custom-form-header">
                    <span className="custom-form-title">
                      + Add New Widget to {currentCategory?.shortName || currentCategory?.name}
                    </span>
                  </div>

                  <form onSubmit={handleAddCustom} className="custom-widget-form">
                    {formError && <div className="form-error-banner">{formError}</div>}

                    <div className="form-group">
                      <label htmlFor="custom-widget-name" className="form-label">
                        Widget Name *
                      </label>
                      <input
                        id="custom-widget-name"
                        type="text"
                        placeholder="e.g. Cluster Health, Security Alert..."
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    {/* Key-Value Pair Metrics Editor (Label: Widget Metrics *) */}
                    <div className="form-group">
                      <div className="metrics-label-row">
                        <label className="form-label">
                          Widget Metrics *
                        </label>
                        <button
                          type="button"
                          className="btn-add-metric-row"
                          onClick={handleAddMetricRow}
                        >
                          <Plus size={13} strokeWidth={2.5} />
                          <span>Add Metric</span>
                        </button>
                      </div>

                      <div className="metric-pairs-container">
                        {metricPairs.map((pair, idx) => (
                          <div key={idx} className="metric-pair-row">
                            <input
                              type="text"
                              className="form-input metric-key-input"
                              placeholder={getKeyPlaceholder(activeTabId, idx)}
                              value={pair.key}
                              onChange={(e) => handleMetricChange(idx, 'key', e.target.value)}
                            />
                            <span className="metric-row-dash">-</span>
                            <input
                              type="number"
                              className="form-input metric-value-input"
                              placeholder={getValuePlaceholder(activeTabId, idx)}
                              value={pair.value}
                              onChange={(e) => handleMetricChange(idx, 'value', e.target.value)}
                              min="0"
                            />
                            {metricPairs.length > 1 && (
                              <button
                                type="button"
                                className="btn-remove-metric-row"
                                onClick={() => handleRemoveMetricRow(idx)}
                                title="Remove this metric row"
                                aria-label="Remove metric"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button type="submit" className="btn-add-custom">
                      <Plus size={15} />
                      <span>Add Widget</span>
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>

        {/* Drawer Action Footer */}
        <div className="drawer-footer">
          <button type="button" className="drawer-btn-cancel" onClick={handleCancel}>
            Cancel
          </button>
          <button type="button" className="drawer-btn-confirm" onClick={handleConfirm}>
            Confirm
          </button>
        </div>
      </aside>

      {/* Delete Confirmation Box Modal */}
      {widgetToDelete && (
        <div
          className="confirm-modal-overlay"
          onClick={() => setWidgetToDelete(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="confirm-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="confirm-modal-header">
              <h3 className="confirm-modal-title">Confirm Deletion</h3>
              <button
                type="button"
                className="confirm-modal-close"
                onClick={() => setWidgetToDelete(null)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <p className="confirm-modal-body">
              Are you sure you want to delete <strong>"{widgetToDelete.widgetName}"</strong>? This will permanently remove it from the dashboard.
            </p>
            <div className="confirm-modal-actions">
              <button
                type="button"
                className="confirm-btn-cancel"
                onClick={() => setWidgetToDelete(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-btn-delete"
                onClick={handleConfirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddWidgetDrawer;
