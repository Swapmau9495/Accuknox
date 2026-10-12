import { createSlice } from '@reduxjs/toolkit';
import initialData from '../data/initialData.json';
import {
  generateDonutData,
  generateStackedBarData,
  getDefaultTypeForCategory,
} from '../utils/chartDataHelper';

const STORAGE_KEY = 'accuknox_dashboard_state_v1';

const migrateCategories = (categories) => {
  if (!Array.isArray(categories)) return initialData.categories;
  return categories.map((cat) => {
    if (cat.id === 'ticket') {
      return {
        ...cat,
        widgets: [],
      };
    }
    return {
      ...cat,
      widgets: (cat.widgets || []).map((w) => {
        // If widget in CSPM is text-only, migrate to donut
        if (cat.id === 'cspm' && (w.type === 'text' || !w.data?.segments)) {
          return {
            ...w,
            type: 'donut',
            data: generateDonutData(w.name, w.text, w.data),
          };
        }
        // If widget in registry_scan/image is text-only, migrate to stacked_bar
        if ((cat.id === 'registry_scan' || cat.id === 'image') && (w.type === 'text' || !w.data?.segments)) {
          return {
            ...w,
            type: 'stacked_bar',
            data: generateStackedBarData(w.name, w.text, w.data),
          };
        }
        return w;
      }),
    };
  });
};

const loadSavedState = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.categories)) {
        return {
          categories: migrateCategories(parsed.categories),
        };
      }
    }
  } catch (e) {
    console.error('Error loading dashboard state from localStorage:', e);
  }
  return {
    categories: initialData.categories,
  };
};

const saveStateToStorage = (categories) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ categories }));
  } catch (e) {
    console.error('Error saving dashboard state to localStorage:', e);
  }
};

const initialState = {
  categories: loadSavedState().categories,
  searchTerm: '',
};

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    // Add a new custom widget to a specific category
    addWidget: (state, action) => {
      const { categoryId, name, text, type } = action.payload;
      const category = state.categories.find((c) => c.id === categoryId);
      if (category) {
        const resolvedType = type || getDefaultTypeForCategory(categoryId);
        let widgetData = {};

        if (resolvedType === 'donut') {
          widgetData = generateDonutData(name, text);
        } else if (resolvedType === 'stacked_bar') {
          widgetData = generateStackedBarData(name, text);
        } else if (resolvedType === 'empty_chart') {
          widgetData = { message: text || 'No Graph data available!' };
        } else {
          widgetData = { description: text.trim() };
        }

        const newWidget = {
          id: `widget_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          name: name.trim(),
          text: text.trim(),
          type: resolvedType,
          visible: true,
          isCustom: true,
          createdAt: new Date().toISOString(),
          data: widgetData,
        };

        category.widgets.push(newWidget);
        saveStateToStorage(state.categories);
      }
    },

    // Remove widget from view (uncheck / cross icon)
    removeWidget: (state, action) => {
      const { categoryId, widgetId } = action.payload;
      state.categories.forEach((cat) => {
        if (!categoryId || cat.id === categoryId) {
          const widget = cat.widgets.find((w) => w.id === widgetId);
          if (widget) {
            widget.visible = false;
          }
        }
      });
      saveStateToStorage(state.categories);
    },

    // Toggle widget visibility (used by the drawer checklist)
    toggleWidgetVisibility: (state, action) => {
      const { categoryId, widgetId, visible } = action.payload;
      const category = state.categories.find((c) => c.id === categoryId);
      if (category) {
        const widget = category.widgets.find((w) => w.id === widgetId);
        if (widget) {
          widget.visible = typeof visible === 'boolean' ? visible : !widget.visible;
          saveStateToStorage(state.categories);
        }
      }
    },

    // Batch apply active widgets for multiple categories (from drawer confirm)
    batchUpdateVisibility: (state, action) => {
      const selections = action.payload;
      state.categories.forEach((category) => {
        if (selections[category.id] !== undefined) {
          const activeIds = selections[category.id];
          category.widgets.forEach((widget) => {
            widget.visible = activeIds.includes(widget.id);
          });
        }
      });
      saveStateToStorage(state.categories);
    },

    // Permanently delete a widget from a category
    deleteWidgetPermanently: (state, action) => {
      const { categoryId, widgetId } = action.payload;
      let changed = false;
      state.categories.forEach((cat) => {
        if (!categoryId || cat.id === categoryId) {
          const initialLength = cat.widgets.length;
          cat.widgets = cat.widgets.filter((w) => w.id !== widgetId);
          if (cat.widgets.length !== initialLength) {
            changed = true;
          }
        }
      });
      if (changed) {
        saveStateToStorage(state.categories);
      }
    },

    // Update global search term
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },

    // Reset dashboard state to initial data
    resetToDefault: (state) => {
      state.categories = JSON.parse(JSON.stringify(initialData.categories));
      state.searchTerm = '';
      saveStateToStorage(state.categories);
    },
  },
});

export const {
  addWidget,
  removeWidget,
  toggleWidgetVisibility,
  batchUpdateVisibility,
  deleteWidgetPermanently,
  setSearchTerm,
  resetToDefault,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
