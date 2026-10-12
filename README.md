# CNAPP Dashboard - Accuknox Frontend Assignment

A dynamic, customizable Cloud Native Application Protection Platform (CNAPP) Dashboard built with **React**, **Vite**, **Redux Toolkit**, and **Vanilla CSS**.

Matches the specified dashboard UI design, featuring dynamic widget rendering from JSON, category-based drawer management, real-time search, interactive charts, and local state management with localStorage persistence.

---

## 🚀 Features

1. **Dynamic JSON Configuration**:
   - Entire dashboard structure (categories, widgets, chart configurations, and text) is loaded dynamically from [`src/data/initialData.json`](src/data/initialData.json).
   - Easily extensible with new categories and custom widget types.

2. **Add & Remove Widgets Dynamically**:
   - **Slide-out Drawer (`+ Add Widget`)**: Click the header button or any category's `+ Add Widget` card to open the drawer modal matching the design.
   - **Category Tabs**: Switch between `CSPM`, `CWPP`, `Image`, and `Ticket` categories.
   - **Checkbox Visibility Management**: Check or uncheck widgets to add or remove them from the dashboard, then click **Confirm** to apply.
   - **Cross Icon Removal**: Every widget card has an `✕` button to instantly remove it from the dashboard.
   - **Custom Widget Creation**: Add a custom widget with a **Widget Name** and **Widget Text** directly from the drawer (with a convenient "Quick Random Fill" button).

3. **Store Management (Redux Toolkit)**:
   - Built using `@reduxjs/toolkit` and `react-redux`.
   - Actions for `addWidget`, `removeWidget`, `toggleWidgetVisibility`, `batchUpdateVisibility`, `setSearchTerm`, and `resetToDefault`.
   - **Local Persistence**: State automatically persists across browser refreshes via `localStorage`.
   - **Reset to Default**: Easily revert all modifications back to the initial sample data using the options menu (`⋮`).

4. **Global Widget Search**:
   - Search bar in the top navigation bar (`Search anything...`) with real-time filtering across all categories and widgets.
   - Live badge showing total matches count, with a one-click clear button (`✕`).

5. **Pixel-Perfect Visualizations**:
   - **SVG Donut Charts**: Interactive multi-segment donut charts for *Cloud Accounts* and *Cloud Account Risk Assessment* with center metrics and color-coded legends.
   - **Stacked Horizontal Bars**: Proportional multi-category vulnerability metrics for *Image Risk Assessment* and *Image Security Issues*.
   - **Empty State Charts**: Clean vector chart illustrations with *"No Graph data available!"* message for *CWPP Dashboard*.
   - **Custom Text Widgets**: Clean typography, metadata, and timestamps for user-created widgets.

---

## 📁 Project Structure

```
accuknox/
├── public/
├── src/
│   ├── assets/
│   ├── data/
│   │   └── initialData.json          # Dynamic JSON defining dashboard categories & widgets
│   ├── store/
│   │   ├── index.js                  # Redux Store configuration
│   │   └── dashboardSlice.js         # Redux slice with reducers & localStorage sync
│   ├── components/
│   │   ├── Navbar.jsx                # Top navbar with breadcrumbs & global search
│   │   ├── DashboardHeader.jsx       # Header with actions & time range selector
│   │   ├── CategorySection.jsx       # Category container & widget grid
│   │   ├── WidgetCard.jsx            # Individual widget wrapper with removal trigger
│   │   ├── AddWidgetCard.jsx         # Card with + Add Widget button in each category
│   │   ├── AddWidgetDrawer.jsx       # Slide-out drawer with tabs, checkboxes, & custom form
│   │   └── widgets/
│   │       ├── DonutWidget.jsx       # SVG Donut chart component
│   │       ├── StackedBarWidget.jsx  # Multi-segment stacked horizontal bar component
│   │       ├── EmptyChartWidget.jsx  # Empty state illustration component
│   │       └── TextWidget.jsx        # Text & metadata widget component
│   ├── App.jsx                       # Root application component
│   ├── App.css                       # Dashboard styles & design system
│   ├── index.css                     # Global CSS variables & resets
│   └── main.jsx                      # App root with Redux Provider
├── index.html
├── package.json
└── vite.config.js
```

---

## 🛠️ Technology Stack

- **Framework**: React 19 + Vite 6
- **State Management**: Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Icons**: Lucide React (`lucide-react`)
- **Styling**: Vanilla CSS (TailwindCSS avoided as per specification; custom tokens & modern UI)
- **Persistence**: `localStorage`

---

## ⚙️ Getting Started

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### 2. Installation
```bash
npm install
```

### 3. Running Locally
Start the development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Production Build
Build for production:
```bash
npm run build
```

---

## 📄 JSON Data Schema

```json
{
  "categories": [
    {
      "id": "cspm",
      "name": "CSPM Executive Dashboard",
      "shortName": "CSPM",
      "widgets": [
        {
          "id": "cloud_accounts",
          "name": "Cloud Accounts",
          "text": "Connected: 2, Not Connected: 2",
          "type": "donut",
          "visible": true,
          "data": {
            "total": 2,
            "centerLabel": "Total",
            "segments": [
              { "label": "Connected (2)", "value": 2, "color": "#3b82f6" },
              { "label": "Not Connected (2)", "value": 2, "color": "#bfdbfe" }
            ]
          }
        }
      ]
    }
  ]
}
```
