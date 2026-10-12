import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  removeWidget,
  batchUpdateVisibility,
  addWidget,
  deleteWidgetPermanently,
} from './store/dashboardSlice';
import Navbar from './components/Navbar';
import DashboardHeader from './components/DashboardHeader';
import CategorySection from './components/CategorySection';
import AddWidgetDrawer from './components/AddWidgetDrawer';
import './App.css';

export function App() {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.dashboard.categories);
  const searchTerm = useSelector((state) => state.dashboard.searchTerm);

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerCategoryId, setDrawerCategoryId] = useState('');

  const handleOpenAddDrawer = (catId) => {
    setDrawerCategoryId(catId || (categories[0] ? categories[0].id : ''));
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleRemoveWidget = (categoryId, widgetId) => {
    dispatch(removeWidget({ categoryId, widgetId }));
  };

  const handleBatchConfirm = (selections) => {
    dispatch(batchUpdateVisibility(selections));
  };

  const handleAddNewWidget = ({ categoryId, name, text }) => {
    dispatch(addWidget({ categoryId, name, text }));
  };

  const handleDeleteWidgetPermanently = (categoryId, widgetId) => {
    dispatch(deleteWidgetPermanently({ categoryId, widgetId }));
  };

  return (
    <div className="dashboard-app-wrapper">
      <Navbar />

      <main className="dashboard-content-area">
        <div className="dashboard-container">
          <DashboardHeader onOpenAddDrawer={handleOpenAddDrawer} />

          <div className="categories-list">
            {categories
              .filter((category) => category.id !== 'ticket')
              .map((category) => (
                <CategorySection
                  key={category.id}
                  category={category}
                  searchTerm={searchTerm}
                  onRemoveWidget={handleRemoveWidget}
                  onOpenAddDrawer={handleOpenAddDrawer}
                />
              ))}
          </div>
        </div>
      </main>

      <AddWidgetDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        categories={categories}
        initialCategoryId={drawerCategoryId}
        onBatchConfirm={handleBatchConfirm}
        onAddNewWidget={handleAddNewWidget}
        onDeleteWidget={handleDeleteWidgetPermanently}
      />
    </div>
  );
}

export default App;
