# Mobile Project - Block Flow Diagram (BFD)

## System Architecture Overview

```mermaid
flowchart TD
    %% External Systems
    User((👤 Người dùng))
    Browser[🌐 Trình duyệt Web / WebView]
    GPS[📍 GPS / Geolocation API]
    BackendAPI[🔌 Backend API\n/poi/load-all]
    
    %% Presentation Layer
    subgraph Presentation["📱 Presentation Layer"]
        App[App.jsx\nRoot Component]
        Toolbar[Desktop Toolbar\nView/Theme Toggle]
        MobileFrame[Mobile Device Frame\nStatus Bar + Home Indicator]
        Screen[Mobile Screen Content]
    end
    
    %% Screen Components
    subgraph ScreenComponents["🖥️ Screen Components"]
        MapScreen[MapScreen.jsx\nMain Controller]
        MapView[MapLibreView.jsx\nMap Rendering]
        ListView[List View\nDanh sách quán]
        SavedView[Saved View\nQuán đã lưu]
        BottomSheet[Bottom Sheet\nChi tiết quán]
        TabNav[Bottom Tab Navigation]
    end
    
    %% Business Logic
    subgraph BusinessLogic["⚙️ Business Logic"]
        StateMgmt[React State Management\nuseState, useEffect, useMemo]
        FilterLogic[Filter Logic\nMode/Dish/Search]
        SaveLogic[Save/Unsave Logic\nlocalStorage]
        LocateLogic[Geolocation Handler]
    end
    
    %% Data Layer
    subgraph DataLayer["📦 Data Layer"]
        POIApi[poiApi.js\nAPI Service]
        DemoData[pois.js\nDemo Data + Normalizer]
        LocalStorage[(localStorage\nquan4:saved-pois)]
    end
    
    %% Styling
    subgraph Styling["🎨 Styling System"]
        Tokens[tokens.css\nDesign Tokens]
        AppCSS[App.css\nLayout & Theme]
        MapCSS[map.css\nMap Components]
        MapLibreCSS[maplibre.css]
    end

    %% Connections
    User --> Browser
    Browser --> App
    Browser -.-> GPS
    GPS -.-> MapScreen
    
    App --> Toolbar
    App --> MobileFrame
    MobileFrame --> Screen
    Screen --> MapScreen
    
    MapScreen --> MapView
    MapScreen --> ListView
    MapScreen --> SavedView
    MapScreen --> BottomSheet
    MapScreen --> TabNav
    
    MapScreen --> StateMgmt
    StateMgmt --> FilterLogic
    StateMgmt --> SaveLogic
    StateMgmt --> LocateLogic
    
    MapScreen --> POIApi
    POIApi --> DemoData
    POIApi --> BackendAPI
    SaveLogic --> LocalStorage
    LocateLogic --> GPS
    
    MapScreen --> Styling
    MapView --> Styling
    ListView --> Styling
    SavedView --> Styling
    BottomSheet --> Styling
    TabNav --> Styling
```

## Data Flow Description

### 1. **Initialization Flow**
```
App Mount → MapScreen Mount → loadPois() → Backend API
                                              ↓
                    Success: API Data → Normalize → State
                                              ↓
                    Failure: Demo Data → Normalize → State
```

### 2. **User Interaction Flow**
```
User Action (Tap/Filter/Search)
    ↓
MapScreen State Update
    ↓
Filter Logic (Mode + Category + Search)
    ↓
Visible POIs Computed (useMemo)
    ↓
Render: MapView / ListView / SavedView
```

### 3. **Map Interaction Flow**
```
User taps marker on MapLibreView
    ↓
onSelect(poiId) callback
    ↓
MapScreen: setSelectedMarker(poi)
    ↓
Bottom Sheet renders with POI details
```

### 4. **Save/Unsave Flow**
```
User clicks heart icon
    ↓
toggleSave(id) → Update savedIds state
    ↓
localStorage.setItem('quan4:saved-pois')
    ↓
UI updates (List/Saved tabs, Bottom Sheet)
```

### 5. **Geolocation Flow**
```
User clicks location button
    ↓
navigator.geolocation.getCurrentPosition()
    ↓
Success: Map flies to user location
    ↓
Error: Shows permission/location error message
```

## Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| **App.jsx** | Root layout, theme/view mode, device frame simulation |
| **MapScreen.jsx** | Main controller, state orchestration, tab management |
| **MapLibreView.jsx** | MapLibre GL rendering, marker clustering, interactions |
| **poiApi.js** | API communication, timeout handling, fallback to demo data |
| **pois.js** | Demo data, POI normalization, category icons |
| **tokens.css** | Design system (colors, spacing, typography) |

## Technology Stack

- **Framework**: React 18 + Vite
- **Map**: MapLibre GL JS
- **State**: React Hooks (useState, useEffect, useMemo, useCallback)
- **Storage**: localStorage for favorites
- **API**: Fetch API with AbortController
- **Styling**: CSS Custom Properties + CSS Modules pattern
- **Icons**: Inline SVG + Emoji

## Deployment View

```mermaid
flowchart LR
    Dev[Development\nnpm run dev] --> Build[Build\nnpm run build]
    Build --> Dist[dist/ folder]
    Dist --> Deploy[Deploy\nVercel/Netlify/GitHub Pages]
    Deploy --> User
    
    subgraph Runtime["Runtime Environment"]
        BrowserRuntime[Browser / WebView]
        GPSRuntime[Geolocation API]
        APIRuntime[Backend API Server]
    end
    
    User --> BrowserRuntime
    BrowserRuntime --> GPSRuntime
    BrowserRuntime --> APIRuntime
```