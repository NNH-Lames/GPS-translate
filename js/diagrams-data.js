/**
 * Mermaid diagram data for system-presentation.html
 * Auto-generated from docs/walkthrough/diagrams/*.mermaid
 * DO NOT EDIT MANUALLY — run gen_diagrams_data.py to regenerate
 */
(function () {
    window.DIAGRAM_DATA = {
        sections: {
            overview: [
                { key: 'architecture', label: '🏗️ Kiến trúc hệ thống' },
                { key: 'routing', label: '🔀 Frontend Routing' }
            ],
            startup: [
                { key: 'backend-startup', label: '⚙️ Backend Startup' },
                { key: 'frontend-startup', label: '🖥️ Frontend Startup' },
                { key: 'runtime-hardening', label: '🧱 Runtime Hardening' }
            ],
            geofence: [
                { key: 'geofence-audio', label: '📡 Geofence + Audio' }
            ],
            content: [
                { key: 'poi-content', label: '📍 POI Content Pipeline' }
            ],
            audio: [
                { key: 'audio-tts', label: '🎧 Audio TTS Pipeline' }
            ],
            auth: [
                { key: 'auth-rbac', label: '🔐 Auth Flow' },
                { key: 'permissions', label: '🛡️ Permission Matrix' }
            ],
            localization: [
                { key: 'localization', label: '🌐 Localization Pipeline' },
                { key: 'ui-i18n-runtime', label: '🌍 UI I18N Runtime' }
            ],
            offline: [
                { key: 'offline-pwa', label: '📴 Offline Architecture' },
                { key: 'offline-hardening', label: '📦 Offline Hardening' },
                { key: 'runtime-resilience', label: '🛡️ Resilience + Observability' }
            ],
            maps: [
                { key: 'map-pack', label: '🗺️ Map Pack Flow' },
                { key: 'offline-hardening', label: '📦 Offline Hardening' }
            ],
            admin: [
                { key: 'admin-owner', label: '🏪 Owner Registration' },
                { key: 'ai-advisor', label: '🤖 AI Advisor Flow' },
                { key: 'public-analytics', label: '📊 Public Analytics' },
                { key: 'runtime-resilience', label: '🛡️ Resilience + Observability' }
            ],
            'full-flow': [
                { key: 'full-flow', label: '🔄 Full End-to-End Flow' }
            ]
        },
        diagrams: {
            'architecture': {
                title: 'Kiến trúc tổng quan hệ thống',
                mermaid: `graph TB
    subgraph Frontend["Frontend — React 19 + Vite PWA"]
        MAIN["main.jsx\\nEntry Point"]
        APP["App.jsx\\nRouter"]
        MAPAPP["MapApp.jsx\\nPublic Map UI\\n952 lines"]
        ADMIN["AdminLayout\\nAdmin Dashboard"]
        OWNER["OwnerLayout\\nOwner Portal"]
    end

    subgraph Backend["Backend — FastAPI + MongoDB"]
        FASTAPI["main.py\\nFastAPI App\\nLifespan Manager"]
        CONTENT["content module\\n/api/v1/poi\\nPOI CRUD"]
        AUDIO["audio module\\n/api/v1/audio\\nEdge-TTS + Task Manager"]
        ADMIN_BE["admin module\\n/api/v1/admin\\nAuth + RBAC + CRUD"]
        ANALYTICS["analytics module\\n/api/v1/analytics\\nConsent collect + read models"]
        AI["ai_advisor module\\n/api/v1/ai\\nGemini AI"]
        LOC["localization module\\n/api/v1/localizations\\ni18n + Warmup"]
        MAPS["maps module\\n/api/v1/maps\\nPMTiles + Styles"]
    end

    subgraph Data["Data Layer"]
        MONGO[("MongoDB\\nquan4_culinary\\nruntime collections + read models")]
        REDIS[("Redis\\npresence + rate limits")]
        IDB[("IndexedDB\\nQuan4DB\\npois_by_lang")]
        SW["Service Worker\\nsw.js Workbox\\n584 lines"]
        CACHE[("Cache API\\naudio-lang-{lang}\\nmap-pack-{version}")]
    end

    MAIN --> APP
    APP --> MAPAPP
    APP --> ADMIN
    APP --> OWNER
    MAPAPP -->|"axios /api/v1/poi"| CONTENT
    MAPAPP -->|"axios /api/v1/audio"| AUDIO
    MAPAPP -->|"axios /api/v1/analytics"| ANALYTICS
    MAPAPP -->|"axios /api/v1/localizations"| LOC
    MAPAPP -->|"API + static: /api/v1/maps + /static/maps/*"| MAPS
    ADMIN -->|"axios /api/v1/admin"| ADMIN_BE
    ADMIN -->|"axios /api/v1/ai"| AI
    OWNER -->|"axios /api/v1/owner"| ADMIN_BE
    FASTAPI --> CONTENT
    FASTAPI --> AUDIO
    FASTAPI --> ADMIN_BE
    FASTAPI --> ANALYTICS
    FASTAPI --> AI
    FASTAPI --> LOC
    FASTAPI --> MAPS
    CONTENT --> MONGO
    AUDIO --> MONGO
    ADMIN_BE --> MONGO
    ANALYTICS --> MONGO
    ANALYTICS --> REDIS
    LOC --> MONGO
    AI --> MONGO
    MAPAPP -->|"idb library"| IDB
    MAPAPP -->|"postMessage"| SW
    SW --> CACHE`
            },
            'routing': {
                title: 'Frontend Routing — React Router',
                mermaid: `graph TB
    ROOT["/ Browser URL"]

    ROOT -->|"path=/*"| PUBLIC["MapApp\\n🗺️ Public Map Portal\\nKhong can auth"]
    ROOT -->|"path=/admin/login"| LOGIN["LoginPage\\n🔐 GuestRoute\\nRedirect if logged in"]
    ROOT -->|"path=/admin/*"| ADMIN["AdminLayout\\n🛠️ ProtectedRoute\\nroles: super_admin, admin"]
    ROOT -->|"path=/owner/*"| OWNER["OwnerLayout\\n🏪 ProtectedRoute\\nroles: super_admin, admin, poi_owner\\nverified-owner gate on business pages"]
    ROOT -->|"path=/register/owner"| REG["PublicOwnerRegisterPage\\n📝 GuestRoute\\nPublic registration"]

    subgraph AdminRoutes["Admin Routes — Lazy Loaded"]
        ADMIN --> DASH["DashboardPage\\nThong ke tong quan"]
        ADMIN --> POIS["POIManagementPage\\nCRUD POI"]
        ADMIN --> USERS["UsersManagementPage\\nCRUD Users"]
        ADMIN --> ROLES["RoleManagementPage\\nCRUD Roles"]
        ADMIN --> REGS["RegistrationsPage\\nDuyet don owner"]
        ADMIN --> SUBS["SubmissionReviewPage\\nDuyet POI submissions"]
        ADMIN --> AUDIT["AuditLogsPage\\nNhat ky hoat dong"]
        ADMIN --> CHPW["ChangePasswordPage\\nDoi mat khau"]
    end

    subgraph OwnerRoutes["Owner Routes — Lazy Loaded"]
        OWNER --> ODASH["OwnerDashboardPage\\nThong ke POI cua minh"]
        OWNER --> OPOI["OwnerPOIPage\\nQuan ly POI so huu"]
        OWNER --> OSUB["OwnerSubmissionsPage\\nXem submissions"]
        OWNER --> OREG["RegistrationStatusPage\\nCanh bao chua xac minh"]
        OWNER --> ONOTI["OwnerNotificationDetailPage\\nThong bao review/admin_note"]
    end

    style PUBLIC fill:#4CAF50,color:white
    style ADMIN fill:#2196F3,color:white
    style OWNER fill:#FF9800,color:white
    style LOGIN fill:#9E9E9E,color:white
    style REG fill:#9E9E9E,color:white`
            },
            'backend-startup': {
                title: 'Backend Startup Sequence',
                mermaid: `sequenceDiagram
    participant OS as Server OS
    participant MAIN as main.py
    participant CFG as config/env
    participant DB as database.py
    participant MEDIA as media_storage
    participant ADMIN as AdminService
    participant RUNTIME as runtime_storage
    participant AUDIO as AudioTaskManager
    participant OBS as RuntimeObservability
    participant ANALYTICS as Analytics/Workers

    OS->>MAIN: uvicorn app.main:app --port 8000
    activate MAIN
    MAIN->>MAIN: lifespan() start

    rect rgb(255, 230, 230)
        Note over MAIN,CFG: Security + Bootstrap Validation (non-dev only)
        MAIN->>CFG: Check JWT_SECRET
        MAIN->>CFG: Check REFRESH_TOKEN_SECRET
        MAIN->>CFG: Check SECRET_KEY
        MAIN->>CFG: Validate SUPERADMIN_BOOTSTRAP_MODE
        Note over MAIN: Fail fast if placeholders or unsafe bootstrap config
    end

    rect rgb(230, 255, 230)
        Note over MAIN,DB: Database / Media Readiness
        MAIN->>DB: connect_db()
        DB->>DB: AsyncIOMotorClient(MONGODB_URI)
        DB->>DB: client[MONGODB_DB_NAME]
        DB-->>MAIN: MongoDB connected
        MAIN->>DB: assert_transaction_capability()
        MAIN->>MEDIA: check_backend_health() when MEDIA_BACKEND=s3
    end

    rect rgb(230, 230, 255)
        Note over MAIN,ADMIN: Seed defaults + admin bootstrap
        MAIN->>ADMIN: ensure_roles()
        Note over ADMIN: Upsert 4 default roles:<br/>super_admin, admin,<br/>poi_owner, user
        MAIN->>ADMIN: ensure_super_admin()
        Note over ADMIN: Behavior depends on bootstrap mode
    end

    rect rgb(255, 255, 230)
        Note over MAIN,RUNTIME: Runtime storage preparation
        MAIN->>RUNTIME: verify_runtime_storage() or ensure_runtime_storage()
        MAIN->>MAIN: refresh_transaction_readiness()
        MAIN->>MAIN: start_transaction_readiness_loop()
    end

    rect rgb(230, 245, 255)
        Note over MAIN,ANALYTICS: Recover stateful workers
        MAIN->>AUDIO: recover_after_restart()
        MAIN->>AUDIO: load_recent_tasks()
        MAIN->>AUDIO: start_maintenance_loop()
        MAIN->>OBS: ensure_indexes()
        MAIN->>ANALYTICS: analytics_worker.start()
        MAIN->>ANALYTICS: media_cleanup_worker.start()
    end

    MAIN->>MAIN: Mount 10 routers + /static + /health/ready
    Note over MAIN: Server ready on port 8000
    deactivate MAIN`
            },
            'frontend-startup': {
                title: 'Frontend Startup Sequence',
                mermaid: `sequenceDiagram
    participant Browser as User Browser
    participant MAIN as main.jsx
    participant APP as App.jsx
    participant ROUTER as React Router
    participant MAPAPP as MapApp.jsx
    participant SPLASH as SplashScreen
    participant LOC_SVC as LocationService
    participant STORE as poiStore (Zustand)
    participant API as api.js (Axios)
    participant BACKEND as Backend API
    participant IDB as IndexedDB (Quan4DB)
    participant SW as Service Worker

    Browser->>MAIN: Open https://localhost:5173
    MAIN->>MAIN: Dev mode: unregister old SWs
    MAIN->>SW: Register production SW (Workbox)
    MAIN->>APP: Render App in BrowserRouter

    APP->>ROUTER: Match pathname
    Note over ROUTER: path="/*" catch-all<br/>renders MapApp

    ROUTER->>MAPAPP: Render MapApp
    MAPAPP->>SPLASH: Show SplashScreen
    Note over SPLASH: Language selection UI<br/>(vi, en, zh, ja, ko, fr...)
    SPLASH-->>MAPAPP: onLanguageSelect("en")

    MAPAPP->>MAPAPP: handleSplashLanguageSelect("en")
    MAPAPP->>MAPAPP: setLanguagePreference("en")
    MAPAPP->>MAPAPP: NarrationEngine.setUserLanguage("en")

    rect rgb(230, 245, 255)
        Note over MAPAPP,BACKEND: preload() — Parallel Data Loading
        par GPS + Offline + Online
            MAPAPP->>LOC_SVC: waitForPosition()
            Note over LOC_SVC: navigator.geolocation.getCurrentPosition()
            LOC_SVC-->>MAPAPP: {lat, lng, accuracy}
        and
            MAPAPP->>IDB: getOfflinePOIs("en")
            Note over IDB: Fallback chain:<br/>en -> vi
            IDB-->>MAPAPP: cached POI[]
            Note over MAPAPP: Show cached data immediately
        and
            MAPAPP->>API: loadAllPOIs(true, "en")
            API->>BACKEND: GET /api/v1/poi/load-all?lang=en
            BACKEND-->>API: POI[] with localizations
            API-->>MAPAPP: fresh POI[]
        end
    end

    MAPAPP->>STORE: set restaurants = fresh POI[]
    MAPAPP->>IDB: savePOIs(freshPOIs, "en")
    MAPAPP->>MAPAPP: splashVisible = false

    Note over MAPAPP: Render MainAppView:<br/>MapContainer + ClusteredPOILayer<br/>+ useGeofence hook starts`
            },
            'geofence-audio': {
                title: 'GPS + Geofence + Audio Narration Flow',
                mermaid: `sequenceDiagram
    participant GPS as LocationService<br/>watchPosition throttle 5s
    participant HOOK as useGeofence hook
    participant GEO as GeofenceEngine<br/>reconcileLoop 1s
    participant NAR as NarrationEngine<br/>4-Tier Hybrid
    participant QUEUE as AudioQueueManager<br/>Priority Queue
    participant SW as Service Worker<br/>CacheFirst
    participant API as Backend API
    participant STORE as poiStore
    participant UI as Map UI Popup

    GPS->>GPS: navigator.geolocation.watchPosition()
    loop Every 5s (throttled)
        GPS->>HOOK: gpsCallback(pos)
        HOOK->>STORE: setUserPosition(pos) — move blue dot
        HOOK->>GEO: checkGeofences(pos)

        Note over GEO: For each POI:<br/>distance = turf.distance(pos, poi.coords)

        alt distance <= geofence_radius AND not inside
            GEO->>GEO: pendingEntries.set(poiId, now)
            Note over GEO: Start 3s debounce
        else distance > geofence_radius AND is inside
            GEO->>GEO: _handleExit(poiId)
            GEO->>HOOK: notifyExit(poi)
            HOOK->>UI: setCurrentPoiId(null) — close popup
            Note over GEO: Reset cooldown immediately
        end

        HOOK->>HOOK: _prefetchNearbyLocalizations(pos)
        Note over HOOK: Background: scan store POIs,<br/>queue top 3 fallback POIs within 500m,<br/>then drain sequentially
    end

    Note over GEO: reconcileLoop() every 1s

    GEO->>GEO: _processDebounce(now)
    Note over GEO: 3s elapsed → confirm ENTER<br/>insideZones.set(poiId, poi)

    GEO->>GEO: _processAudioDecision()
    Note over GEO: Sort active zones by:<br/>1. audio_priority (low=high)<br/>2. distance (near=high)

    GEO->>NAR: queueNarration(poi, false)
    GEO->>HOOK: notifyEnter(poi)
    HOOK->>UI: setCurrentPoiId(poiId) — show popup

    NAR->>QUEUE: enqueue(track)
    NAR->>NAR: processQueue()
    NAR->>NAR: playWithFallback(poi, lang, text)

    alt Tier 1: Pre-generated Audio (0ms)
        Note over NAR: poi.audio_url exists
        NAR->>SW: fetch(audio_url)
        SW->>SW: CacheFirst match
        SW-->>NAR: cached MP3
        NAR->>NAR: new Audio().play()
    else Tier 1.5: On-demand (2-5s)
        NAR->>API: POST /localizations/on-demand
        Note over API: translate vi→en<br/>Edge-TTS → save MP3
        API-->>NAR: {audio_url, description}
        NAR->>STORE: updatePOI(poiId, {audio_url})
        NAR->>NAR: playAudioUrl(new_url)
    else Tier 2: Realtime Cloud TTS (3-8s)
        NAR->>API: POST /audio/tts {text, lang}
        API-->>NAR: MP3 stream
        NAR->>NAR: play stream
    else Tier 3: Local TTS (0ms)
        NAR->>NAR: TTSService.speak(text, lang)
    end

    NAR-->>HOOK: subscribe → isPlaying=true
    Note over UI: Popup shows POI name + image
    
    NAR->>NAR: audio.onended
    NAR-->>HOOK: onFinished(track)
    HOOK->>UI: setCurrentPoiId(null) — close popup
    NAR->>NAR: processQueue() — next track`
            },
            'poi-content': {
                title: 'POI Content Pipeline',
                mermaid: `graph LR
    subgraph Router["content/router.py"]
        R_LOAD["GET /poi/load-all\\nload_all_pois()\\nPublic"]
        R_NEARBY["GET /poi/nearby\\nget_nearby_pois()\\nPublic"]
        R_DETAIL["GET /poi/{id}\\nget_poi_detail()\\nPublic"]
        R_CREATE["POST /poi/\\ncreate_poi()\\npoi:create"]
        R_UPDATE["PUT /poi/{id}\\nupdate_poi()\\npoi:update"]
        R_DELETE["DELETE /poi/{id}\\ndelete_poi()\\npoi:delete"]
    end

    subgraph Service["content/service.py\\nContentService"]
        S_ALL["get_all_pois(is_active)"]
        S_NEARBY["get_nearby_pois(lat, lng, radius)"]
        S_ONE["get_poi_by_id(poi_id)"]
        S_CREATE["create_poi(data)"]
        S_UPDATE["update_poi(poi_id, data)\\n+ cleanup orphan images"]
        S_DELETE["delete_poi(poi_id)\\n+ cascade delete"]
    end

    subgraph DB["MongoDB Collections"]
        COL_POI[("POI\\nname, description, category,\\nlocation, images, audio_status,\\ngeofence_radius, audio_priority")]
        COL_LOC[("poi_localizations\\npoi_id, lang, name,\\ndescription, audio_url, updated_at")]
    end

    subgraph Hydration["load-all & nearby Hydration\\n?lang=xx"]
        H1["1. Requested Language\\n(Special: Self-heal if EN)"]
        H2["2. English Fallback\\n(Use existing EN docs)"]
        H3["3. Vietnamese/Original\\n(Audio = None)"]
        H_V["Runtime URL decoration\\n?v=version&l=lang"]
    end

    R_LOAD --> S_ALL --> COL_POI
    R_NEARBY --> S_NEARBY --> COL_POI
    R_LOAD --> H1 --> H2 --> H3 --> H_V
    R_NEARBY --> H1
    H1 --> COL_LOC
    R_DETAIL --> S_ONE --> COL_POI
    R_CREATE --> S_CREATE --> COL_POI
    R_UPDATE --> S_UPDATE --> COL_POI
    R_DELETE --> S_DELETE
    S_DELETE --> COL_POI
    S_DELETE -->|"cascade"| COL_LOC`
            },
            'audio-tts': {
                title: 'Audio TTS Pipeline',
                mermaid: `graph TB
    subgraph Router["audio/router.py"]
        VOICES["GET /audio/voices\\nEdge-TTS voice catalog"]
        PACK["GET /audio/pack-manifest\\nOffline pack manifest"]
        TTS_EP["POST /audio/tts\\nRealtime TTS\\nReturns X-Static-Url"]
    end

    subgraph TTSService["audio/service.py — TTSService"]
        CACHE_KEY["get_cache_key()\\nMD5 text+lang"]
        TRANSLATE["translate_text()\\nGoogle Translate"]
        GEN_AUDIO["generate_audio()\\nEdge-TTS synthesis"]
        FIND_VOICE["find_best_voice()\\nPriority based"]
        VOICE_CACHE["Voice catalog cache\\nTTL + stale fallback"]
    end

    subgraph TaskManager["audio/task_manager.py — AudioTaskManager"]
        CREATE_TASK["create_task(poi_id)"]
        EXEC["execute_task()\\nParallel semaphore max=3"]
        SSE["subscribe_task()\\nServer-Sent Events"]
    end

    subgraph Storage["File System"]
        STATIC["app/static/audio/\\n{md5_hash}.mp3"]
    end

    subgraph DB["MongoDB"]
        LOC_COL[("poi_localizations\\naudio_url per lang")]
    end

    subgraph Decoration["URL Enhancement"]
        H_V["Runtime URL decoration\\n?v=version&l=lang"]
    end

    TTS_EP --> CACHE_KEY
    CACHE_KEY -->|"HIT"| STATIC
    CACHE_KEY -->|"MISS"| FIND_VOICE
    FIND_VOICE --> GEN_AUDIO
    GEN_AUDIO --> STATIC
    GEN_AUDIO --> LOC_COL
    STATIC --> H_V
    VOICES --> VOICE_CACHE
    PACK --> LOC_COL
    PACK --> STATIC
    CREATE_TASK --> EXEC
    EXEC --> TRANSLATE
    TRANSLATE --> GEN_AUDIO
    EXEC --> SSE

    style STATIC fill:#4CAF50,color:white
    style LOC_COL fill:#2196F3,color:white
    style H_V fill:#FF9800,color:white`
            },
            'auth-rbac': {
                title: 'Authentication + RBAC Flow',
                mermaid: `sequenceDiagram
    participant Client as Admin/Owner UI
    participant API as admin/router.py
    participant DEP as dependencies.py
    participant SVC as AdminService
    participant DB as MongoDB admin_users
    participant JWT as PyJWT

    rect rgb(230, 245, 255)
        Note over Client,JWT: LOGIN FLOW
        Client->>API: POST /admin/auth/login<br/>{email, password}
        API->>SVC: authenticate(login)
        SVC->>DB: find_one({email})
        DB-->>SVC: user document
        SVC->>SVC: verify_password(bcrypt)
        SVC->>SVC: _get_user_permissions(user)
        Note over SVC: Role perms from DB<br/>+ Extra user permissions
        SVC->>JWT: create_access_token<br/>{sub, role, permissions[]}<br/>expire: 30 min
        SVC->>JWT: create_refresh_token<br/>{sub, type: refresh}<br/>expire: 7 days
        JWT-->>SVC: tokens
        SVC-->>API: tokens
        API->>Client: Set-Cookie: access_token<br/>HttpOnly, Secure, SameSite=Lax
        API->>Client: Set-Cookie: refresh_token<br/>HttpOnly, Secure, SameSite=Lax
        Note over Client: JS CANNOT read cookies<br/>XSS protection
    end

    rect rgb(255, 245, 230)
        Note over Client,JWT: AUTHENTICATED REQUEST
        Client->>API: GET /admin/me<br/>Cookies auto-sent
        API->>DEP: get_current_admin(request)
        DEP->>DEP: request.cookies.get access_token
        DEP->>SVC: verify_admin_token(token)
        SVC->>JWT: decode(token, JWT_SECRET)
        JWT-->>SVC: {sub, role, permissions}
        SVC-->>DEP: AdminUser
        DEP-->>API: current_user
        API-->>Client: {id, email, role, permissions}
    end

    rect rgb(230, 255, 230)
        Note over Client,JWT: TOKEN REFRESH
        Client->>API: POST /admin/auth/refresh<br/>Cookies auto-sent
        API->>DEP: read refresh_token cookie
        DEP->>SVC: verify_refresh_token(token)
        SVC->>JWT: decode with REFRESH_TOKEN_SECRET
        SVC->>DB: find user — still active?
        SVC->>SVC: create new access_token
        API->>Client: Set-Cookie: new access_token
    end`
            },
            'permissions': {
                title: 'RBAC Permission Matrix',
                mermaid: `graph TB
    subgraph Static["permissions.py — Static Registry in Code"]
        POI["poi domain\\npoi:read, poi:create,\\npoi:update, poi:delete,\\npoi:approve, poi:toggle"]
        MENU["menu domain\\nmenu:read, menu:create,\\nmenu:update, menu:delete"]
        USER["user domain\\nuser:read, user:create,\\nuser:update, user:delete"]
        ROLE["role domain\\nrole:read, role:create,\\nrole:update, role:delete"]
        ANALYTICS["analytics domain\\nanalytics:view,\\nanalytics:export,\\nanalytics:view_own"]
        AUDIT["audit domain\\naudit:read, audit:manage"]
        SYSTEM["system domain\\nsystem:config,\\nsystem:logs, system:backup"]
        OWNER_P["owner domain\\nowner:register, owner:access,\\nowner:submit_poi,\\nowner:manage_own_poi"]
        CONTENT["content domain\\ncontent:moderate,\\ncontent:publish"]
    end

    subgraph Dynamic["MongoDB roles collection — Dynamic"]
        SA["super_admin\\nALL permissions\\npriority: 0\\nis_system: true"]
        ADMIN_R["admin\\nPOI + Menu + User +\\nAnalytics + Audit + Content\\npriority: 1\\nis_system: true"]
        OWNER_R["poi_owner\\npoi:read + owner:access +\\nowner:submit_poi + owner:manage_own_poi +\\nmenu read/create/update + analytics:view_own\\npriority: 10\\nis_system: true"]
        USER_R["user\\npoi:read + menu:read +\\nowner:register\\npriority: 100\\nis_system: true"]
    end

    subgraph Enforcement["dependencies.py — Route Guards"]
        DEP1["get_current_admin()\\nVerify JWT from cookie"]
        DEP2["require_permission(perm)\\nCheck user.permissions\\nincludes perm"]
        DEP3["require_role(roles...)\\nCheck user.role\\nin allowed list"]
        DEP4["require_any_permission()\\nAt least one match"]
        DEP5["require_verified_owner_permission()\\nrole=poi_owner +\\nis_poi_owner_verified=true"]
    end

    SA --- POI & MENU & USER & ROLE & ANALYTICS & AUDIT & SYSTEM & OWNER_P & CONTENT
    ADMIN_R --- POI & MENU & USER & ANALYTICS & AUDIT & CONTENT
    OWNER_R --- OWNER_P & POI & MENU & ANALYTICS
    USER_R --- OWNER_P & POI & MENU

    DEP1 --> DEP2
    DEP1 --> DEP3
    DEP1 --> DEP4
    DEP1 --> DEP5

    style SA fill:#f44336,color:white
    style ADMIN_R fill:#2196F3,color:white
    style OWNER_R fill:#FF9800,color:white
    style USER_R fill:#4CAF50,color:white`
            },
            'localization': {
                title: 'Localization Pipeline — 3 Flows',
                mermaid: `sequenceDiagram
    participant User as User Phone
    participant FE as Frontend
    participant API as localization/router.py
    participant LOC as LocalizationService
    participant TTS as TTSService
    participant WU as WarmupService
    participant DB as MongoDB<br/>poi_localizations

    Note over User: User selects language "ja"

    rect rgb(230, 245, 255)
        Note over FE,DB: Flow 1 — Bulk Load at Startup
        FE->>API: GET /poi/load-all?lang=ja
        API->>DB: get_by_lang_for_pois(all_ids, "ja")
        DB-->>API: localizations[]
        Note over API: Hydrate each POI with<br/>localized_name, description, audio_url
        API-->>FE: POI[] with Japanese content
    end

    rect rgb(255, 230, 255)
        Note over FE,DB: Flow 2.1 — Prepare Hotset (Nearby POIs)
        FE->>API: POST /localizations/prepare-hotset<br/>{poi_ids, lang: "ja"}
        Note over API: Concurrency: 3 semaphore
        API->>TTS: Batch translate + TTS
        API-->>FE: {ready_count, pending_count, items[]}
    end

    rect rgb(255, 245, 230)
        Note over FE,DB: Flow 2.2 — On-demand for single POI
        FE->>API: POST /localizations/on-demand<br/>{poi_id, lang: "ja"}
        API->>DB: Check existing localization

        alt Already has description + audio_url
            API-->>FE: {status: "cached", localization}
        else Missing — generate now
            API->>TTS: translate_text(vi_text, "ja")
            TTS-->>API: Japanese text
            API->>TTS: generate_audio(jp_text, "ja")
            Note over TTS: Edge-TTS synthesis<br/>Save MP3 to disk
            TTS-->>API: audio_url
            API->>LOC: upsert(poi_id, "ja",<br/>name, desc, audio_url)
            LOC->>DB: $set + $setOnInsert
            API-->>FE: {status: "generated", localization}
        end

        FE->>FE: updatePOI(poiId, {audio_url, description})
        Note over FE: POI now has Japanese content<br/>Next geofence trigger = Tier 1
    end

    rect rgb(230, 255, 230)
        Note over FE,DB: Flow 3 — Warmup for entire language
        FE->>API: POST /localizations/warmup<br/>{lang: "ja"}
        API->>WU: enqueue_or_get("ja")
        Note over WU: Idempotent:<br/>running? return status<br/>not started? start background

        loop For each active POI
            WU->>TTS: translate(vi_desc, "ja")
            WU->>TTS: generate_audio(ja_text, "ja")
            WU->>LOC: upsert(poi_id, "ja", ...)
        end

        FE->>API: GET /localizations/warmup/ja/status
        API->>WU: get_status("ja")
        WU-->>API: {status, total_pois, ready, progress}
        API-->>FE: Poll every 5 seconds

        Note over FE: When ready=true:<br/>Reload POI data with ?lang=ja
    end`
            },
            'offline-pwa': {
                title: 'Offline / PWA — 4 Layers',
                mermaid: `graph TB
    subgraph SW["Service Worker — sw.js (Workbox)"]
        PRECACHE["precacheAndRoute()\\nStatic assets"]
        API_ROUTE["API /api/v1/poi/*\\nNetworkFirst 8s timeout\\ncache: api-data-cache"]
        VOICE_ROUTE["Voices /audio/voices\\nNetworkFirst 12s timeout"]
        AUDIO_ROUTE["Audio /media/audio/* + /static/audio/*.mp3\\nCacheFirst per-language"]
        IMAGE_ROUTE["Images /static/poi-images/*\\nCacheFirst 30 days"]
        MAP_ROUTE["Map assets\\nCustom pack-cache matching"]
    end

    subgraph AudioSharding["Audio Cache Sharding"]
        AUDIO_VI["audio-lang-vi"]
        AUDIO_EN["audio-lang-en"]
        AUDIO_JA["audio-lang-ja"]
        LRU["LRU Eviction\\nMAX = 3 languages\\nDelete least-recently-used"]
    end

    subgraph IDB["IndexedDB — Quan4DB v2"]
        LANE_STORE["pois_by_lang store\\nkey: lang:poiId\\nindex: by_lang, by_poi_id"]
        FALLBACK["Offline fallback chain:\\ntarget lang → en → vi"]
    end

    subgraph AudioPack["AudioPackService"]
        MANIFEST["GET /audio/pack-manifest\\nURLs + SHA-256 hashes"]
        DOWNLOAD["Download all MP3s\\nconcurrency limited"]
        VERIFY["Verify checksums"]
        PACK_CACHE["audio-pack-{lang}-{version}"]
    end

    subgraph MapPack["MapPackService"]
        MAP_MANIFEST["GET /static/maps/packs/current/manifest.json\\n(primary) or /api/v1/maps/offline-manifest"]
        MAP_DOWNLOAD["Download /static/maps/* assets"]
        MAP_VERIFY["Verify SHA-256"]
        MAP_CACHE["map-pack-{version}\\nactivate via MAP_PACK_ACTIVATE"]
    end

    AUDIO_ROUTE --> AUDIO_VI & AUDIO_EN & AUDIO_JA
    AUDIO_VI & AUDIO_EN & AUDIO_JA --> LRU
    MANIFEST --> DOWNLOAD --> VERIFY --> PACK_CACHE
    MAP_MANIFEST --> MAP_DOWNLOAD --> MAP_VERIFY --> MAP_CACHE
    LANE_STORE --> FALLBACK

    style LRU fill:#f44336,color:white
    style FALLBACK fill:#FF9800,color:white`
            },
            'map-pack': {
                title: 'Map Pack Download Flow',
                mermaid: `sequenceDiagram
    participant UI as OfflineMapPanel
    participant STORE as mapPackStore
    participant SVC as MapPackService
    participant SW as Service Worker
    participant API as maps/router.py (compat)
    participant STATIC as /static/maps/*
    participant FS as Server Filesystem

    UI->>STORE: install()
    STORE->>SVC: install({onProgress})

    SVC->>API: GET /api/v1/maps/offline-manifest?version=current
    API->>FS: Read pack dir + compute SHA-256
    FS-->>API: file list + checksums
    API-->>SVC: manifest {version, assets -> /static/maps/*}

    Note over SVC: Create new Cache:<br/>map-pack-{version}

    loop Each asset in manifest
        SVC->>STATIC: GET /static/maps/packs/v1/q4.pmtiles
        Note over STATIC: Range request support<br/>Content-Type: application/octet-stream
        SVC->>STATIC: GET /static/maps/styles/offline-style.json
        SVC->>STATIC: GET /static/maps/fonts/{font}/{range}.pbf
        SVC->>STATIC: GET /static/maps/styles/sprite.png
        SVC->>SVC: Verify SHA-256 hash
        SVC->>SW: cache.put(url, response)
        SVC-->>STORE: onProgress({completed, total})
    end

    SVC->>SW: postMessage MAP_PACK_ACTIVATE<br/>{version, cacheName}

    rect rgb(230, 245, 255)
        Note over SW: Activate new pack
        SW->>SW: _activeMapPackCacheName = cacheName
        SW->>SW: _activeMapPackVersion = version
        SW->>SW: Delete old map-pack-* caches
    end

    SVC-->>STORE: {success: true}
    STORE->>UI: packState = INSTALLED

    Note over UI: Map now renders from<br/>local PMTiles via pmtiles:// protocol`
            },
            'admin-owner': {
                title: 'Owner Registration + Submission Flow',
                mermaid: `sequenceDiagram
    participant Owner as POI Owner
    participant FE as Frontend
    participant API as admin/router.py
    participant SVC as AdminService
    participant DB as MongoDB

    rect rgb(230, 245, 255)
        Note over Owner,DB: Phase 1 — Registration
        Owner->>FE: Go to /register/owner
        FE->>API: POST /admin/auth/register-owner<br/>{name, email, password, phone,<br/>business_name, business_address, id_card_number}
        Note over API: Public endpoint — no auth needed
        API->>SVC: hash_password(password)
        API->>SVC: encrypt_pii(id_card_number)
        Note over SVC: Fernet encryption: v1:encrypted_data
        API->>DB: Insert admin_users<br/>{role: poi_owner, is_verified: false}
        API->>DB: Insert poi_owner_registrations<br/>{status: pending, user_id}
        API-->>FE: Registration submitted
    end

    rect rgb(255, 245, 230)
        Note over Owner,DB: Phase 2 — Admin Approval
        Note right of DB: Admin sees registration<br/>in RegistrationsPage
        API->>DB: PATCH /admin/registrations/{id}<br/>{status: approved}
        API->>DB: Update admin_users<br/>is_verified = true<br/>is_poi_owner_verified = true
    end

    rect rgb(230, 255, 230)
        Note over Owner,DB: Phase 3 — Owner Login + Submit POI
        Owner->>FE: Login at /admin/login
        FE->>API: POST /admin/auth/login
        API-->>FE: Set httpOnly cookies
        FE->>FE: Redirect to /owner

        Owner->>FE: Create new POI
        FE->>API: POST /owner/submissions<br/>{name, description, category,<br/>address, location, images}
        API->>DB: Insert poi_submissions<br/>{status: pending, owner_id}
        API-->>FE: Submission created

        Note right of DB: Admin reviews in<br/>SubmissionReviewPage
        API->>DB: PATCH /admin/submissions/{id}<br/>{status: approved}
        DB->>DB: Create actual POI<br/>from submission data
        API->>DB: Insert owner_notifications<br/>{admin_note, is_read: false}
        Owner->>FE: Open notification bell
        FE->>API: GET /owner/notifications
        API-->>FE: 200 OK {owner_notifications}
    end`
            },
            'ai-advisor': {
                title: 'AI Advisor — Gemini Enhancement Flow',
                mermaid: `sequenceDiagram
    participant User as Admin or Owner
    participant FE as AIDescriptionButton
    participant API as ai_advisor/router.py
    participant SVC as AIAdvisorService
    participant LLM as Gemini 2.5 Flash / ProxyPal
    participant DB as MongoDB ai_usage_limits

    User->>FE: Click "Cai thien mo ta bang AI"
    FE->>API: POST /ai/enhance-description<br/>{name, description, category,<br/>address, price_range}

    API->>SVC: check_rate_limit(user_id, is_admin)
    SVC->>DB: db.ai_usage_limits.find_one<br/>{user_id, date: today}

    alt Admin user
        Note over SVC: Unlimited usage
        SVC->>SVC: choose provider + _build_gemini_prompt()
        Note over SVC: Rules:<br/>- Khong bia thong tin<br/>- Them tinh tu tich cuc<br/>- Tone than thien<br/>- 200-300 tu
    else POI Owner — under limit
        Note over SVC: Max 10 per day<br/>Current usage: 3/10 OK
        SVC->>SVC: choose provider + _build_gemini_prompt()
        Note over SVC: Rules:<br/>- Khong bia thong tin<br/>- Them tinh tu tich cuc<br/>- Tone than thien<br/>- 200-300 tu
    else POI Owner — limit exceeded
        SVC-->>API: Rate limit exceeded
        API-->>FE: 429 "Het luot hom nay"
        Note over FE: Show error message
    end

    SVC->>LLM: provider.generate(prompt)
    LLM-->>SVC: Enhanced description text

    SVC->>DB: increment_usage(user_id)
    Note over DB: Upsert {user_id, date, count+1}

    SVC-->>API: {enhanced, remaining: 7}
    API-->>FE: {enhanced_description,<br/>remaining_uses_today: 7}

    Note over FE: Show preview:<br/>Original vs Enhanced<br/>User chooses to accept or discard`
            },
            'full-flow': {
                title: 'End-to-End Flow — Mở App đến Nghe Audio',
                mermaid: `graph TB
    START["User mo app"] --> SW_REG["Service Worker dang ky\\nWorkbox precache static assets"]
    SW_REG --> SPLASH["SplashScreen hien\\nChon ngon ngu + cho GPS"]
    SPLASH --> PRELOAD["preload()\\nIDB fallback + API fetch\\nSong song"]

    PRELOAD --> IDB_READ["getOfflinePOIs(lang)\\nIndexedDB fallback chain:\\ntarget -> en -> vi"]
    PRELOAD --> API_CALL["loadAllPOIs(true, lang)\\nGET /api/v1/poi/load-all"]
    IDB_READ --> SHOW_CACHED["Hien data cached ngay lap tuc"]
    API_CALL --> SAVE_IDB["savePOIs -> IndexedDB"]
    API_CALL --> UPDATE_STORE["poiStore.set restaurants"]

    SAVE_IDB --> MAIN_VIEW
    UPDATE_STORE --> MAIN_VIEW["MainAppView render"]
    SHOW_CACHED --> MAIN_VIEW

    MAIN_VIEW --> MAP["MapContainer\\nMapLibre GL + PMTiles\\nCloud-first hybrid/offline switch"]
    MAIN_VIEW --> MARKERS["ClusteredPOILayer\\nPOI markers + clusters"]
    MAIN_VIEW --> GEOFENCE["useGeofence hook\\nGPS tracking bat dau"]
    MAIN_VIEW --> CONSENT["Analytics consent gate\\nconsent_status controls collect"]
    CONSENT -->|"Granted"| ANALYTICS["AnalyticsService\\nPOST /api/v1/analytics/collect\\nheartbeat + event batch"]

    GEOFENCE --> GPS_LOOP["GPS Update moi 5s\\nLocationService throttle"]
    GPS_LOOP --> CHECK["GeofenceEngine\\ncheckGeofences(pos)\\nturf.js distance calc"]
    GPS_LOOP --> PREFETCH["_prefetchNearbyLocalizations\\nScan store + queue top 3 fallback POIs\\n500m radius, adaptive backoff"]

    CHECK -->|"Vao zone POI"| DEBOUNCE["Debounce 3 giay\\npendingEntries"]
    DEBOUNCE --> AUDIO_DECIDE["_processAudioDecision\\nSort by priority + distance"]
    AUDIO_DECIDE --> NARRATE["NarrationEngine\\nqueueNarration(poi)"]

    NARRATE --> TIER1{"Tier 1:\\nPre-gen audio?\\npoi.audio_url"}
    TIER1 -->|"Co"| PLAY_URL["playAudioUrl()\\nSW CacheFirst\\n0ms latency"]
    TIER1 -->|"Khong"| TIER15{"Tier 1.5:\\nOn-demand?"}
    TIER15 -->|"On-demand available"| ON_DEMAND["requestOnDemandLocalization\\nTranslate + Edge-TTS\\n2-5s"]
    TIER15 -->|"Offline/Error"| TIER2["Tier 2: playCloudTTS\\nRealtime fallback\\n3-8s"]
    ON_DEMAND -->|"OK"| PLAY_URL
    ON_DEMAND -->|"Error"| TIER2
    TIER2 -->|"Cloud fail"| TIER3["Tier 3: localSpeechSynthesis\\nBrowser fallback\\n0ms"]

    PLAY_URL --> HIGHLIGHT["playingPoiId sync\\ncluster/overlay highlight"]
    TIER2 --> HIGHLIGHT
    TIER3 --> HIGHLIGHT
    HIGHLIGHT --> POPUP["Popup hien ten + anh POI"]
    POPUP -->|"Audio xong"| CLOSE["onFinished -> dong Popup"]

    CHECK -->|"Roi zone POI"| EXIT["handleExit\\nCooldown 5 phut"]

    style START fill:#4CAF50,color:white
    style PLAY_URL fill:#2196F3,color:white
    style ON_DEMAND fill:#FF9800,color:white
    style TIER2 fill:#f44336,color:white
    style TIER3 fill:#f44336,color:white
    style SPLASH fill:#9C27B0,color:white`
            },
            'public-analytics': {
                title: 'Public Analytics -> Dashboard Read Model',
                mermaid: `sequenceDiagram
    participant User as Public User
    participant FE as AnalyticsService.js
    participant OUTBOX as IndexedDB<br/>analytics outbox
    participant API as analytics/service.py
    participant REDIS as Redis<br/>presence + rate limit
    participant MDB as MongoDB
    participant WORKER as analytics/worker.py
    participant READ as analytics/read_service.py
    participant DASH as Admin Dashboard

    rect rgb(230, 245, 255)
        Note over User,OUTBOX: Frontend capture and batching
        User->>FE: grantConsent()
        FE->>FE: ensureAnonymousId() + ensureSessionId()
        FE->>OUTBOX: enqueue session_started / page_viewed / search / audio events
        FE->>FE: page_engaged after visible 10s
        loop Every 15s when queueCount > 0
            FE->>API: flush(events batch)
        end
        loop Every 20s when page visible
            FE->>API: heartbeat visible=true
        end
    end

    rect rgb(255, 245, 230)
        Note over API,MDB: Backend ingest gate
        API->>API: _detect_filtered_reason(User-Agent)
        API->>REDIS: anonymous 60 / 10m<br/>IP 600 / 10m
        API->>MDB: upsert_device() + upsert_session()
        opt heartbeat present
            API->>REDIS: presence_service.heartbeat()
            REDIS-->>API: count_online()
        end
        loop For each accepted event
            API->>API: sanitize_properties() + normalize_event_time()
            API->>MDB: insert_event(metric_date, metric_hour, poi_id...)
        end
        API->>MDB: enqueue_aggregation_job(metric_date, env)
        API-->>FE: accepted + tracked_online_users
    end

    rect rgb(230, 255, 230)
        Note over WORKER,DASH: Read model for dashboard
        WORKER->>MDB: lease_due_jobs()
        WORKER->>MDB: list_events_for_metric_date()
        WORKER->>MDB: replace daily / hourly / poi / search metrics
        DASH->>READ: get_dashboard_stats()
        READ->>MDB: list_daily_metrics() + list_poi_daily_metrics()
        READ->>REDIS: presence_service.count_online()
        READ-->>DASH: today_views / audio_plays / searches / top_pois / tracked_online_users
    end`
            },
            'ui-i18n-runtime': {
                title: 'UI I18N Runtime -> Static + Long-tail',
                mermaid: `sequenceDiagram
    participant User as Public App
    participant UI as UiLocaleService
    participant PROVIDER as UiBundleProvider
    participant CACHE as uiBundleCatalog<br/>+ IndexedDB cache
    participant API as ui_i18n/router.py
    participant SERVICE as UiBundleService
    participant STORE as ui_translation_bundles
    participant MT as translation_provider.py

    rect rgb(230, 245, 255)
        Note over User,CACHE: Top-level locales stay static
        User->>UI: request en / vi / zh / ja / ko
        UI->>PROVIDER: load(namespace='public-ui', locale)
        PROVIDER->>CACHE: ensureStaticUiBundle(locale)
        CACHE-->>PROVIDER: ready bundle
        PROVIDER-->>UI: resolvedUiLocale = static locale
    end

    rect rgb(255, 245, 230)
        Note over User,STORE: Long-tail locales use fallback + background generation
        User->>UI: request fr-FR / am-AM / th-TH
        UI->>PROVIDER: prepare('public-ui', requestedLocale)
        PROVIDER->>CACHE: readCachedReadyBundle(requested/base)
        alt cached ready bundle exists
            CACHE-->>PROVIDER: generated bundle + etag
        else fetch remote state
            PROVIDER->>API: GET /api/v1/ui-bundles/{locale}?ns=public-ui&sourceHash=...
            API->>SERVICE: get_bundle_payload()
            SERVICE->>SERVICE: load source catalog + current source_hash
            SERVICE->>STORE: get(exact/base, source_hash)
            alt generated record ready
                STORE-->>SERVICE: bundle(status=ready)
                SERVICE-->>API: ready + ETag
            else no generated bundle yet
                SERVICE->>STORE: upsert(status=pending, served_locale='en')
                SERVICE->>SERVICE: _schedule_generation(namespace:locale:source_hash)
                SERVICE-->>API: pending + English fallback
                Note over API: Cache-Control: no-store
                par background translation
                    SERVICE->>MT: translate_entries(flat_bundle, metadata, locale)
                    MT->>MT: protect {{placeholders}} + termHints
                    MT->>MT: batch translate + split SEG tokens
                    MT->>MT: restore tokens + validate placeholders
                    MT->>STORE: upsert(status=ready or failed)
                and frontend polling
                    PROVIDER->>API: poll until ready<br/>keep highest pending progress
                end
            end
        end
        PROVIDER->>CACHE: saveCachedUiBundle(ready generated bundle)
        PROVIDER-->>UI: bundle + progressPercent + uiFallbackActive
    end`
            },
            'runtime-hardening': {
                title: 'Runtime Hardening -> Startup + Cache + Auth',
                mermaid: `flowchart TB
    subgraph Backend["Backend startup hardening (backend/app/main.py)"]
        B0["lifespan()"] --> B1["validate JWT_SECRET / REFRESH_TOKEN_SECRET / SECRET_KEY"]
        B1 --> B2["validate SUPERADMIN_BOOTSTRAP_MODE"]
        B2 --> B3["connect_db() + assert_transaction_capability()"]
        B3 --> B4["media_storage.check_backend_health() when S3"]
        B4 --> B5["ensure_roles() + ensure_super_admin()"]
        B5 --> B6["verify_runtime_storage() or ensure_runtime_storage()"]
        B6 --> B7["refresh_transaction_readiness() + start_transaction_readiness_loop()"]
        B7 --> B8["audio_task_manager.recover_after_restart()<br/>load_recent_tasks() + start_maintenance_loop()"]
        B8 --> B9["runtime_observability.ensure_indexes()<br/>analytics_worker.start() + media_cleanup_worker.start()"]
    end

    subgraph PublicStartup["Public startup + POI delta sync"]
        P0["usePublicStartupCoordinator()"] --> P1["evaluate offline resume checkpoint"]
        P1 --> P2["probeStartupNetworkFailure()<br/>2 attempts / 8s window / 2.5s timeout"]
        P2 --> P3["buildStartupLocalePlan()<br/>quick-start or preferred language"]
        P3 --> P4["primeActiveContentLocale()"]
        P4 --> P5["PoiRepository.fetchPOIsFromNetwork()"]
        P5 --> P6{"shouldUseDeltaSync()?"}
        P6 -- yes --> P7["GET /poi/load-all?updated_after=serverSyncCursor"]
        P6 -- no --> P8["GET /poi/load-all full sync"]
        P7 --> P9["savePOIs(syncMode, removedPoiIds,<br/>serverSyncCursor, datasetVersion)"]
        P8 --> P9
        P9 --> P10["delta response => rebuild merged snapshot from IndexedDB"]
    end

    subgraph AdminAuth["Admin/owner cookie auth gate"]
        A0["ProtectedRoute / GuestRoute"] --> A1["bootstrapAuth()"]
        A1 --> A2["fetchMe() => GET /auth/me with httpOnly cookie"]
        A2 --> A3["normalizeAuthenticatedUserPayload()"]
        A3 --> A4["set authResolved before render / redirect"]
    end

    subgraph Quality["Quality gates wired in repo"]
        Q0["frontend/package.json"] --> Q1["lint:quality"]
        Q1 --> Q2["build"]
        Q2 --> Q3["test:node:regressions / test:smoke / perf:benchmark"]
        Q3 --> Q4[".github/workflows/quality.yml + perf-smoke.yml"]
    end`
            },
            'offline-hardening': {
                title: 'Offline Hardening -> Bundle + Map Pack + Resume',
                mermaid: `flowchart TB
    subgraph MapPack["MapPackService.js"]
        M0["checkForUpdate()"] --> M1{"remote update checks blocked?"}
        M1 -- yes --> M2["reuse activeVersion + skip remote manifest"]
        M1 -- no --> M3["fetch manifest + resolve install target"]
        M3 --> M4["compare version + manifest fingerprint"]
        M4 --> M5["inspectInstalledPackReuse()"]
        M5 --> M6["verify critical assets + style"]
        M6 --> M7["updateAvailable / selectedPackReusable"]
        M7 --> M8["install(updateMode = safe_update or replace_update)"]
        M8 --> M9["download assets + SHA-256 verify"]
        M9 --> M10["activate exactly one active pack"]
        M10 --> M11["cleanup old pack caches"]
    end

    subgraph Bundle["OfflineBundleService.js"]
        B0["install(lang)"] --> B1["Step 1: map"]
        B1 --> B2["Step 2: offline POI snapshot"]
        B2 --> B3["Step 3: POI image pack<br/>fingerprint => ready / partial / error"]
        B3 --> B4["Step 4: audio pack"]
        B4 --> B5["deriveOfflineBundleStateFromPieces()"]
        B5 --> B6["write offline_bundle_meta_v1"]
        B7["checkForUpdate()"] --> B8["combine map/audio/image updates + POI presence"]
        B8 --> B9["actionSummary => updateAvailable / repairRequired / poiMissing / actionRequired"]
        B10["reconcileStatus()"] --> B11["MapPackService.reconcileStatus()"]
        B11 --> B12["rewrite bundle meta or clear empty bundle"]
    end

    subgraph Resume["Offline resume shell"]
        R0["usePublicStartupCoordinator()"] --> R1["read offline bundle meta + map pack status + local snapshot"]
        R1 --> R2{"browser offline OR startup probe persistent failure?"}
        R2 -- yes --> R3["blockRemoteUpdateChecks()"]
        R3 --> R4["resumeIntoOfflineShell()"]
        R4 --> R5["applyUiLocaleState(immediateOnly)"]
        R5 --> R6["primeActiveContentLocale(refresh = false)"]
        R6 --> R7["SyncManager.init() + enter app shell"]
    end

    M11 --> B1
    B6 --> R1`
            },
            'runtime-resilience': {
                title: 'Runtime Resilience -> Chunk Recovery + Observability',
                mermaid: `flowchart TB
    subgraph BuildSync["Build sync + lazy chunk recovery"]
        C0["main.jsx"] --> C1["syncAppBuildWithServiceWorker(buildId)"]
        C1 --> C2["sw.js handles APP_BUILD_SYNC"]
        C2 --> C3["purge public-optional-chunk-cache when build changes"]
        C0 --> C4["installChunkRecovery(buildId)"]
        C4 --> C5["window.error + unhandledrejection listeners"]
        C0 --> C6["ChunkRecoveryBoundary"]
        C5 --> C7{"recoverable chunk error?"}
        C6 --> C7
        C7 -- first failure in session --> C8["mark sessionStorage sentinel"]
        C8 --> C9["purgePublicRuntimeChunks()"]
        C9 --> C10["window.location.replace(...__chunk_recover=buildId-stamp)"]
        C7 -- second failure or timeout --> C11["overlay or manual reload button"]
    end

    subgraph Observability["Runtime observability location telemetry"]
        O0["LocationService.trackOutcome()"] --> O1["LocationTelemetryService buffer"]
        O1 --> O2["flush every 60s / pagehide sendBeacon()"]
        O2 --> O3["POST /api/v1/runtime-observability/location"]
        O3 --> O4["validate origin host"]
        O4 --> O5["rate limit 60/min by IP<br/>20/min by session"]
        O5 --> O6["drop client env + enforce <= 16 KiB JSON"]
        O6 --> O7["upsert runtime_location_hourly buckets"]
        O7 --> O8["GET /api/v1/admin/runtime-observability/location<br/>window = 24h or 7d"]
    end

    subgraph Tests["Regression grid covering hard failures"]
        T0["Node tests"] --> T1["tests/chunk-recovery.test.mjs"]
        T0 --> T2["tests/ui-bundle-provider-network-backoff.test.mjs"]
        T0 --> T3["tests/poi-image-offline-contract.test.mjs"]
        T1 --> T4["chunk error pattern / recovery token / single-flight reload"]
        T5["Playwright"] --> T6["tests/language-quick-start.spec.js"]
        T5 --> T7["tests/offline-bundle.spec.js"]
        T5 --> T8["tests/offline-pack-resume-production.spec.js"]
        T5 --> T9["tests/offline-pack-cache-protocol.spec.js"]
        T5 --> T10["tests/geofence-manual-stop-reconcile.spec.js"]
    end`
            }
        }
    };
})();
