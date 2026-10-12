import React, { useState } from 'react';
import { Plus, RotateCw, MoreVertical, Clock, ChevronDown, RotateCcw } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { resetToDefault } from '../store/dashboardSlice';

export const DashboardHeader = ({ onOpenAddDrawer }) => {
  const dispatch = useDispatch();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('Last 2 days');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);

  const timeOptions = ['Last 24 hours', 'Last 2 days', 'Last 7 days', 'Last 30 days'];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleReset = () => {
    if (window.confirm('Reset all widgets back to initial default data?')) {
      dispatch(resetToDefault());
    }
  };

  return (
    <div className="dashboard-header-container">
      <div className="dashboard-header-left">
        <h1 className="dashboard-title">CNAPP Dashboard</h1>
      </div>

      <div className="dashboard-header-right">
        {/* Add Widget Button */}
        <button
          type="button"
          className="btn-header-add-widget"
          onClick={() => onOpenAddDrawer()}
        >
          <span>Add Widget</span>
          <Plus size={16} />
        </button>

        <div className="header-actions-subrow">
          {/* Refresh Button */}
          <button
            type="button"
            className={`btn-header-icon ${isRefreshing ? 'spin-anim' : ''}`}
            onClick={handleRefresh}
            title="Refresh dashboard"
            aria-label="Refresh dashboard"
          >
            <RotateCw size={16} />
          </button>

          {/* More Options / Reset Menu */}
          <div className="menu-dropdown-wrapper">
            <button
              type="button"
              className="btn-header-icon"
              onClick={() => setShowMenuDropdown(!showMenuDropdown)}
              title="More actions"
              aria-label="More actions"
            >
              <MoreVertical size={16} />
            </button>

            {showMenuDropdown && (
              <div className="header-dropdown-menu">
                <button
                  type="button"
                  className="dropdown-menu-item"
                  onClick={() => {
                    setShowMenuDropdown(false);
                    handleReset();
                  }}
                >
                  <RotateCcw size={14} />
                  <span>Reset to Default Data</span>
                </button>
              </div>
            )}
          </div>

          {/* Time Selector Dropdown Button */}
          <div className="time-select-wrapper">
            <button
              type="button"
              className="btn-time-select"
              onClick={() => setShowTimeDropdown(!showTimeDropdown)}
              aria-expanded={showTimeDropdown}
            >
              <Clock size={16} className="time-select-icon" />
              <span className="time-select-label">{timeRange}</span>
              <ChevronDown size={14} className="time-select-chevron" />
            </button>

            {showTimeDropdown && (
              <div className="time-dropdown-menu">
                {timeOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={`time-option-item ${timeRange === opt ? 'selected' : ''}`}
                    onClick={() => {
                      setTimeRange(opt);
                      setShowTimeDropdown(false);
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
