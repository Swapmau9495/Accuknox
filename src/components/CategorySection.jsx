import React from 'react';
import WidgetCard from './WidgetCard';
import AddWidgetCard from './AddWidgetCard';

export const CategorySection = ({
  category,
  onRemoveWidget,
  onOpenAddDrawer,
  searchTerm,
}) => {
  // Filter widgets by visibility and search query
  const visibleWidgets = category.widgets.filter((w) => w.visible !== false);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredWidgets = visibleWidgets.filter((w) => {
    if (!normalizedSearch) return true;
    const nameMatch = w.name?.toLowerCase().includes(normalizedSearch);
    const textMatch = w.text?.toLowerCase().includes(normalizedSearch);
    return nameMatch || textMatch;
  });

  // If search is active and nothing matches in this category, we can show a subtle indicator
  const hasHiddenBySearch = normalizedSearch && visibleWidgets.length > 0 && filteredWidgets.length === 0;

  return (
    <section className="category-section" id={`category-${category.id}`}>
      <div className="category-header">
        <h2 className="category-title">{category.name}</h2>
        <span className="category-count-badge">
          {filteredWidgets.length} {filteredWidgets.length === 1 ? 'widget' : 'widgets'}
        </span>
      </div>

      <div className="widgets-grid">
        {filteredWidgets.map((widget) => {
          const isSearchMatch =
            normalizedSearch &&
            (widget.name?.toLowerCase().includes(normalizedSearch) ||
              widget.text?.toLowerCase().includes(normalizedSearch));

          return (
            <WidgetCard
              key={widget.id}
              widget={widget}
              categoryId={category.id}
              onRemove={onRemoveWidget}
              isSearchMatch={isSearchMatch}
            />
          );
        })}

        {hasHiddenBySearch && (
          <div className="category-no-search-results">
            No matching widgets in this category for "{searchTerm}"
          </div>
        )}

        <AddWidgetCard
          onClick={() => onOpenAddDrawer(category.id)}
          categoryName={category.name}
        />
      </div>
    </section>
  );
};

export default CategorySection;
