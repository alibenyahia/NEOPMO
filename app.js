// PMO Dashboard - Application Logic

// --- SUPABASE CLIENT (base de données partagée) ---
// SUPABASE_URL / SUPABASE_ANON_KEY sont définis dans config.js.
// Si config.js n'est pas renseigné, l'app fonctionne en mode local uniquement.
const WORKSPACE_ROW_ID = 'main';
const supabaseClient = (
    typeof supabase !== 'undefined' &&
    typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL &&
    typeof SUPABASE_ANON_KEY !== 'undefined' && SUPABASE_ANON_KEY
) ? supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Global state
let state = {
    projects: [],
    currentWeek: '',
    trainings: [],
    tickets: [],
    ticketsLastImport: null
};

// Selected project in Editor Split-View
let selectedProjectId = null;

// Chart instances
let charts = {
    progress: null,
    weather: null,
    status: null,
    billing: null
};

// UI Elements
const els = {
    globalWeekSelect: document.getElementById('global-week-select'),
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    themeIconLight: document.getElementById('theme-icon-light'),
    themeIconDark: document.getElementById('theme-icon-dark'),
    importDataBtn: document.getElementById('import-data-btn'),
    importFileInput: document.getElementById('import-file-input'),
    exportDataBtn: document.getElementById('export-data-btn'),
    clearDemoDataBtn: document.getElementById('clear-demo-data-btn'),
    currentWeekBtn: document.getElementById('current-week-btn'),
    addProjectBtn: document.getElementById('add-project-btn'),
    
    // Tabs Navigation
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    tabBtnEditor: document.getElementById('tab-btn-editor'),
    
    // KPIs
    kpiActiveCount: document.getElementById('kpi-active-count'),
    kpiUsersCount: document.getElementById('kpi-users-count'),
    kpiProgressValue: document.getElementById('kpi-progress-value'),
    kpiAlertsValue: document.getElementById('kpi-alerts-value'),
    
    // Filters (Dashboard Tab)
    searchInput: document.getElementById('search-input'),
    filterStatus: document.getElementById('filter-status'),
    filterWeather: document.getElementById('filter-weather'),
    filterPm: document.getElementById('filter-pm'),
    clearFiltersBtn: document.getElementById('clear-filters-btn'),
    
    // Table (Dashboard Tab)
    projectsTableBody: document.getElementById('projects-table-body'),
    projectsEmptyState: document.getElementById('projects-empty-state'),
    emptyAddBtn: document.getElementById('empty-add-btn'),
    emptyDemoBtn: document.getElementById('empty-demo-btn'),

    // Billing Follow-up Chart (Dashboard Tab)
    billingFilterMonth: document.getElementById('billing-filter-month'),
    billingFilterClient: document.getElementById('billing-filter-client'),
    billingFilterPm: document.getElementById('billing-filter-pm'),
    billingChartCanvas: document.getElementById('billing-chart'),
    billingChartEmptyState: document.getElementById('billing-chart-empty-state'),
    billingSummaryBar: document.getElementById('billing-summary-bar'),
    billingMonthlyList: document.getElementById('billing-monthly-list'),
    
    // --- SPLIT-VIEW EDITOR TAB ELEMENTS ---
    editorSearchInput: document.getElementById('editor-search-input'),
    editorProjectsList: document.getElementById('editor-projects-list'),
    editorEmptyState: document.getElementById('editor-empty-state'),
    editorWorkspace: document.getElementById('editor-workspace'),
    
    editorProjectName: document.getElementById('editor-project-name'),
    editorProjectClient: document.getElementById('editor-project-client'),
    editorEditInfoBtn: document.getElementById('editor-edit-info-btn'),
    editorPmVal: document.getElementById('editor-pm-val'),
    editorTypeVal: document.getElementById('editor-type-val'),
    editorDatesVal: document.getElementById('editor-dates-val'),
    
    editorWeekSelect: document.getElementById('editor-week-select'),
    editorWeeklyForm: document.getElementById('editor-weekly-form'),
    editorStatus: document.getElementById('editor-status'),
    editorWeather: document.getElementById('editor-weather'),
    editorProgress: document.getElementById('editor-progress'),
    editorUsers: document.getElementById('editor-users'),
    editorDone: document.getElementById('editor-done'),
    editorCurrentStep: document.getElementById('editor-current-step'),
    editorNextStep: document.getElementById('editor-next-step'),
    editorBlockers: document.getElementById('editor-blockers'),
    editorRisks: document.getElementById('editor-risks'),
    editorHistoryTimeline: document.getElementById('editor-history-timeline'),

    // Billing (Facturation) management table (Editor Split-View)
    billingAddRowBtn: document.getElementById('billing-add-row-btn'),
    billingTable: document.getElementById('billing-table'),
    billingTableBody: document.getElementById('billing-table-body'),
    billingEmptyState: document.getElementById('billing-empty-state'),
    billingTotalBar: document.getElementById('billing-total-bar'),
    billingTotalAmount: document.getElementById('billing-total-amount'),
    billingTotalInvoiced: document.getElementById('billing-total-invoiced'),
    billingTotalPercent: document.getElementById('billing-total-percent'),
    
    // --- MODALS ---
    projectModal: document.getElementById('project-modal'),
    projectForm: document.getElementById('project-form'),
    projectModalTitle: document.getElementById('project-modal-title'),
    projectModalCloseBtn: document.getElementById('project-modal-close-btn'),
    projectModalCancel: document.getElementById('project-modal-cancel'),
    editProjectId: document.getElementById('edit-project-id'),
    projectName: document.getElementById('project-name'),
    projectClient: document.getElementById('project-client'),
    projectPm: document.getElementById('project-pm'),
    projectType: document.getElementById('project-type'),
    cloudAbonnementContainer: document.getElementById('cloud-abonnement-container'),
    projectAbonnement: document.getElementById('project-abonnement'),
    onpremLicencesContainer: document.getElementById('onprem-licences-container'),
    projectLicences: document.getElementById('project-licences'),
    projectPrestations: document.getElementById('project-prestations'),
    partnerNameContainer: document.getElementById('partner-name-container'),
    partnerName: document.getElementById('partner-name'),
    projectStartDate: document.getElementById('project-start-date'),
    projectEndDate: document.getElementById('project-end-date'),
    projectHasDeadlineMarket: document.getElementById('project-has-deadline-market'),
    contractualDateContainer: document.getElementById('contractual-date-container'),
    projectContractualDate: document.getElementById('project-contractual-date'),
    
    weeklyUpdateModal: document.getElementById('weekly-update-modal'),
    weeklyUpdateForm: document.getElementById('weekly-update-form'),
    weeklyModalCloseBtn: document.getElementById('weekly-modal-close-btn'),
    weeklyModalCancel: document.getElementById('weekly-modal-cancel'),
    weeklyProjectId: document.getElementById('weekly-project-id'),
    weeklyWeek: document.getElementById('weekly-week'),
    weeklyStatus: document.getElementById('weekly-status'),
    weeklyWeather: document.getElementById('weekly-weather'),
    weeklyProgress: document.getElementById('weekly-progress'),
    weeklyUsers: document.getElementById('weekly-users'),
    weeklyDone: document.getElementById('weekly-done'),
    weeklyCurrentStep: document.getElementById('weekly-current-step'),
    weeklyNextStep: document.getElementById('weekly-next-step'),
    weeklyBlockers: document.getElementById('weekly-blockers'),
    weeklyRisks: document.getElementById('weekly-risks'),
    
    // --- TICKETS NEOPROJECT TAB (IMPORT XLS) ---
    tabBtnTickets: document.getElementById('tab-btn-tickets'),
    ticketsImportBtn: document.getElementById('tickets-import-btn'),
    ticketsEmptyImportBtn: document.getElementById('tickets-empty-import-btn'),
    ticketsImportInput: document.getElementById('tickets-import-input'),
    ticketsClearBtn: document.getElementById('tickets-clear-btn'),
    ticketsImportInfo: document.getElementById('tickets-import-info'),
    ticketsStatsCard: document.getElementById('tickets-stats-card'),
    ticketsKpiRow: document.getElementById('tickets-kpi-row'),
    ticketsBreakdownTeam: document.getElementById('tickets-breakdown-team'),
    ticketsBreakdownAuthor: document.getElementById('tickets-breakdown-author'),
    ticketsBreakdownStatus: document.getElementById('tickets-breakdown-status'),
    ticketsBreakdownPriority: document.getElementById('tickets-breakdown-priority'),
    ticketsSearchInput: document.getElementById('tickets-search-input'),
    ticketsFilterTeam: document.getElementById('tickets-filter-team'),
    ticketsFilterStatus: document.getElementById('tickets-filter-status'),
    ticketsFilterPriority: document.getElementById('tickets-filter-priority'),
    ticketsClearFiltersBtn: document.getElementById('tickets-clear-filters-btn'),
    ticketsTable: document.getElementById('tickets-table'),
    ticketsTableBody: document.getElementById('tickets-table-body'),
    ticketsEmptyState: document.getElementById('tickets-empty-state'),
    ticketDetailsModal: document.getElementById('ticket-details-modal'),
    ticketDetailsModalTitle: document.getElementById('ticket-details-modal-title'),
    ticketDetailsCloseBtn: document.getElementById('ticket-details-close-btn'),
    ticketDetailsCloseBtn2: document.getElementById('ticket-details-close-btn-2'),
    ticketDetailsBody: document.getElementById('ticket-details-body'),
    ticketsTeamDatalist: document.getElementById('tickets-team-datalist'),
    ticketsTypeDatalist: document.getElementById('tickets-type-datalist'),
    ticketsStatusDatalist: document.getElementById('tickets-status-datalist'),
    ticketsPriorityDatalist: document.getElementById('tickets-priority-datalist'),
    ticketsAssigneeDatalist: document.getElementById('tickets-assignee-datalist'),
    ticketsAuthorDatalist: document.getElementById('tickets-author-datalist'),

    // --- FORMATION TAB (CALENDRIER) ---
    tabBtnFormation: document.getElementById('tab-btn-formation'),
    trainingCalendarGrid: document.getElementById('training-calendar-grid'),
    trainingCalendarLabel: document.getElementById('training-calendar-label'),
    trainingPrevMonthBtn: document.getElementById('training-prev-month-btn'),
    trainingNextMonthBtn: document.getElementById('training-next-month-btn'),
    trainingTodayBtn: document.getElementById('training-today-btn'),
    addTrainingBtn: document.getElementById('add-training-btn'),
    trainingUpcomingList: document.getElementById('training-upcoming-list'),

    trainingModal: document.getElementById('training-modal'),
    trainingForm: document.getElementById('training-form'),
    trainingModalTitle: document.getElementById('training-modal-title'),
    trainingModalCloseBtn: document.getElementById('training-modal-close-btn'),
    trainingModalCancel: document.getElementById('training-modal-cancel'),
    trainingDeleteBtn: document.getElementById('training-delete-btn'),
    editTrainingId: document.getElementById('edit-training-id'),
    trainingClient: document.getElementById('training-client'),
    trainingName: document.getElementById('training-name'),
    trainingTrainer: document.getElementById('training-trainer'),
    trainingLocation: document.getElementById('training-location'),
    trainingStartDate: document.getElementById('training-start-date'),
    trainingEndDate: document.getElementById('training-end-date'),

    historyModal: document.getElementById('history-modal'),
    historyModalCloseBtn: document.getElementById('history-modal-close-btn'),
    historyModalClose: document.getElementById('history-modal-close'),
    historyModalTitle: document.getElementById('history-modal-title'),
    historyModalSubtitle: document.getElementById('history-modal-subtitle'),
    detailClient: document.getElementById('detail-client'),
    detailPm: document.getElementById('detail-pm'),
    detailTypeMode: document.getElementById('detail-typemode'),
    detailUsers: document.getElementById('detail-users'),
    detailStart: document.getElementById('detail-start'),
    detailEnd: document.getElementById('detail-end'),
    historyTimelineContainer: document.getElementById('history-timeline-container'),
    historyAddUpdateBtn: document.getElementById('history-add-update-btn'),
    
    toastContainer: document.getElementById('toast-container')
};

// --- HELPER FUNCTIONS ---

// ISO Week Calculator
function getISOWeek(date) {
    const tempDate = new Date(date.valueOf());
    tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7));
    const yearStart = new Date(tempDate.getFullYear(), 0, 1);
    const weekNo = Math.ceil((((tempDate - yearStart) / 86400000) + 1) / 7);
    return `${tempDate.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;
}

// Generate weeks list: toutes les semaines ISO de l'année précédente + l'année en cours
// (la semaine actuelle se trouve donc naturellement "centrée", ni tronquée avant ni après).
function generateWeeksList() {
    const list = [];
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear - 1, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        list.push(getISOWeek(new Date(d)));
    }

    const uniqueWeeks = [...new Set(list)].sort();
    return uniqueWeeks;
}

// Toast Notifications
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let iconName = 'check-circle';
    if (type === 'error') iconName = 'alert-circle';
    else if (type === 'info') iconName = 'info';
    
    toast.innerHTML = `<i data-lucide="${iconName}"></i> <span>${message}</span>`;
    els.toastContainer.appendChild(toast);
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// Lucide icon refresher
function refreshIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Format dates nicely
function formatDateString(dateStr) {
    if (!dateStr) return 'Non définie';
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Fetch the report of a project for a specific week, or fall back to the closest past report
function getProjectStatusForWeek(project, targetWeek) {
    const updates = project.weeklyUpdates || {};
    
    if (updates[targetWeek]) {
        return {
            ...updates[targetWeek],
            isFallback: false,
            actualWeek: targetWeek
        };
    }
    
    const sortedWeeks = Object.keys(updates).sort();
    let closestWeek = null;
    
    for (const w of sortedWeeks) {
        if (w <= targetWeek) {
            closestWeek = w;
        } else {
            break;
        }
    }
    
    if (closestWeek) {
        return {
            ...updates[closestWeek],
            isFallback: true,
            actualWeek: closestWeek
        };
    }
    
    return {
        status: 'planifié',
        weather: 'tout va bien',
        progress: 0,
        users: 0,
        done: '',
        currentStep: '',
        nextStep: '',
        blockers: '',
        risks: '',
        isFallback: true,
        actualWeek: null
    };
}

// --- STATE MANAGEMENT ---

// Ensures backward-compatible shape regardless of where `state` came from
// (fresh localStorage, Supabase row, or an older saved file).
function normalizeStateShape() {
    if (!Array.isArray(state.trainings)) {
        state.trainings = [];
    }
    if (!Array.isArray(state.tickets)) {
        state.tickets = [];
    }
    if (typeof state.ticketsLastImport === 'undefined') {
        state.ticketsLastImport = null;
    }
    if (Array.isArray(state.projects)) {
        state.projects.forEach(p => {
            if (!Array.isArray(p.billing)) {
                p.billing = [];
            }
        });
    } else {
        state.projects = [];
    }
}

// Saves the current state locally (instant, for snappy UI / offline resilience)
// and, if Supabase is configured, synchronizes it to the shared database so
// every user opening the URL sees the same data.
async function saveState() {
    localStorage.setItem('pmo_dashboard_state', JSON.stringify(state));

    if (!supabaseClient) return; // Mode local uniquement : rien de plus à faire

    try {
        const { error } = await supabaseClient
            .from('workspace_state')
            .upsert({ id: WORKSPACE_ROW_ID, data: state, updated_at: new Date().toISOString() });

        if (error) {
            console.error("Erreur de synchronisation Supabase :", error);
            showToast("Sauvegardé localement, mais la synchronisation en ligne a échoué.", "error");
        }
    } catch (e) {
        console.error("Erreur de synchronisation Supabase :", e);
        showToast("Sauvegardé localement, mais la synchronisation en ligne a échoué.", "error");
    }
}

// Loads the shared state from Supabase if configured, otherwise falls back to
// the local browser cache. Must be awaited before the first render.
async function loadState() {
    if (supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('workspace_state')
                .select('data')
                .eq('id', WORKSPACE_ROW_ID)
                .maybeSingle();

            if (error) throw error;

            if (data && data.data) {
                state = data.data;
            } else {
                // Aucune ligne partagée encore : on démarre depuis le cache local
                // (le cas échéant) puis on l'envoie sur Supabase pour l'initialiser.
                const raw = localStorage.getItem('pmo_dashboard_state');
                if (raw) {
                    try { state = JSON.parse(raw); } catch (e) { /* ignore, garde l'état par défaut */ }
                }
                normalizeStateShape();
                await saveState();
                return;
            }
        } catch (e) {
            console.error("Impossible de charger les données depuis Supabase, mode local utilisé.", e);
            showToast("Connexion à la base de données impossible : mode local.", "error");
            const raw = localStorage.getItem('pmo_dashboard_state');
            if (raw) {
                try { state = JSON.parse(raw); } catch (err) { /* ignore */ }
            }
        }
    } else {
        // Supabase non configuré (config.js vide) : comportement local d'origine
        const raw = localStorage.getItem('pmo_dashboard_state');
        if (raw) {
            try {
                state = JSON.parse(raw);
            } catch (e) {
                console.error("Erreur lors de la lecture du LocalStorage", e);
                showToast("Erreur lors de la restauration locale.", "error");
            }
        }
    }

    normalizeStateShape();
}

// Theme handling
function initTheme() {
    const isLight = localStorage.getItem('pmo_theme') === 'light';
    if (isLight) {
        document.body.classList.add('light-theme');
        els.themeIconLight.style.display = 'none';
        els.themeIconDark.style.display = 'block';
    } else {
        document.body.classList.remove('light-theme');
        els.themeIconLight.style.display = 'block';
        els.themeIconDark.style.display = 'none';
    }
}

// --- CHARTS RENDERER ---

function updateCharts(projectsForWeek) {
    if (typeof Chart === 'undefined') {
        console.warn("Chart.js n'est pas chargé. Les graphiques ne seront pas affichés.");
        document.querySelectorAll('.chart-wrapper').forEach(wrapper => {
            if (!wrapper.querySelector('.chart-offline-placeholder')) {
                wrapper.innerHTML = `<div class="chart-offline-placeholder" style="display:flex; align-items:center; justify-content:center; height:100%; color:var(--text-muted); font-size:0.9rem;">Graphique indisponible (mode hors-ligne)</div>`;
            }
        });
        return;
    }
    const weatherCounts = { 'tout va bien': 0, 'c\'est compliqué': 0, 'bloqué': 0 };
    const statusCounts = { 'planifié': 0, 'en cours': 0, 'en retard': 0, 'terminé': 0 };
    const projectNames = [];
    const progresses = [];
    const weatherColors = [];

    const weatherColorMap = {
        'tout va bien': '#22AF53',
        'c\'est compliqué': '#F6C900',
        'bloqué': '#BC2F2F'
    };

    projectsForWeek.forEach(item => {
        weatherCounts[item.weekInfo.weather] = (weatherCounts[item.weekInfo.weather] || 0) + 1;
        statusCounts[item.weekInfo.status] = (statusCounts[item.weekInfo.status] || 0) + 1;
        
        projectNames.push(item.project.name);
        progresses.push(item.weekInfo.progress);
        weatherColors.push(weatherColorMap[item.weekInfo.weather]);
    });

    const isDark = !document.body.classList.contains('light-theme');
    const chartTextCol = isDark ? '#a1a1aa' : '#64748b';
    const chartBorderCol = isDark ? 'rgba(63, 63, 70, 0.4)' : 'rgba(226, 232, 240, 0.8)';

    // --- Weather Chart ---
    if (charts.weather) charts.weather.destroy();
    const weatherCtx = document.getElementById('weatherChart').getContext('2d');
    charts.weather = new Chart(weatherCtx, {
        type: 'doughnut',
        data: {
            labels: ['Tout va bien', "C'est compliqué", 'Bloqué'],
            datasets: [{
                data: [weatherCounts['tout va bien'], weatherCounts["c'est compliqué"], weatherCounts['bloqué']],
                backgroundColor: ['#22AF53', '#F6C900', '#BC2F2F'],
                borderWidth: isDark ? 2 : 1,
                borderColor: isDark ? '#18181b' : '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: chartTextCol, font: { family: 'Outfit', size: 12 } }
                }
            },
            cutout: '70%'
        }
    });

    // --- Status Chart ---
    if (charts.status) charts.status.destroy();
    const statusCtx = document.getElementById('statusChart').getContext('2d');
    charts.status = new Chart(statusCtx, {
        type: 'doughnut',
        data: {
            labels: ['Planifié', 'En cours', 'En retard', 'Terminé'],
            datasets: [{
                data: [statusCounts['planifié'], statusCounts['en cours'], statusCounts['en retard'], statusCounts['terminé']],
                backgroundColor: ['#F6C900', '#0A6E89', '#BC2F2F', '#22AF53'],
                borderWidth: isDark ? 2 : 1,
                borderColor: isDark ? '#18181b' : '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: chartTextCol, font: { family: 'Outfit', size: 12 } }
                }
            },
            cutout: '70%'
        }
    });

    // --- Progress Chart ---
    if (charts.progress) charts.progress.destroy();
    const progressCtx = document.getElementById('progressChart').getContext('2d');
    charts.progress = new Chart(progressCtx, {
        type: 'bar',
        data: {
            labels: projectNames,
            datasets: [{
                label: 'Avancement %',
                data: progresses,
                backgroundColor: weatherColors,
                borderRadius: 8,
                barThickness: 16
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                x: {
                    min: 0,
                    max: 100,
                    grid: { color: chartBorderCol },
                    ticks: { color: chartTextCol, font: { family: 'Outfit' } }
                },
                y: {
                    grid: { display: false },
                    ticks: { color: chartTextCol, font: { family: 'Outfit', weight: 'bold' } }
                }
            }
        }
    });
}

// --- TIMELINE ROADMAP WIDGET (DASHBOARD TAB) ---

const TIMELINE_YEAR = new Date().getFullYear();
const TIMELINE_MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

const TIMELINE_STATUS_COLORS = {
    'planifié': 'var(--status-planned)',
    'en cours': 'var(--status-ongoing)',
    'en retard': 'var(--status-delayed)',
    'terminé': 'var(--status-completed)'
};

// Computes { startPct, endPct } of a project's [start, end] dates relative to the
// TIMELINE_YEAR calendar (0-100), clamped to the year's bounds.
// Returns null if dates are missing/invalid. Returns { outOfRange: true } if the
// project is entirely outside the year.
function computeTimelineBounds(startDateStr, endDateStr) {
    if (!startDateStr || !endDateStr) return null;

    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;

    const yearStart = new Date(TIMELINE_YEAR, 0, 1).getTime();
    const yearEnd = new Date(TIMELINE_YEAR, 11, 31, 23, 59, 59, 999).getTime();
    const yearSpan = yearEnd - yearStart;

    if (end.getTime() < yearStart || start.getTime() > yearEnd) {
        return { outOfRange: true };
    }

    const clampedStart = Math.max(start.getTime(), yearStart);
    const clampedEnd = Math.min(end.getTime(), yearEnd);

    let startPct = ((clampedStart - yearStart) / yearSpan) * 100;
    let endPct = ((clampedEnd - yearStart) / yearSpan) * 100;

    startPct = Math.max(0, Math.min(100, startPct));
    endPct = Math.max(0, Math.min(100, endPct));

    // Ensure a minimum visible width so very short projects remain visible/hoverable
    if (endPct - startPct < 0.8) {
        endPct = Math.min(100, startPct + 0.8);
    }

    return { outOfRange: false, startPct, endPct };
}

// Renders the annual Gantt-style roadmap under the charts grid.
// `projectsWithWeekInfo` is the list of { project, weekInfo } already resolved for the
// currently selected global week, and already passed through the active dashboard filters.
function renderTimelineRoadmap(projectsWithWeekInfo) {
    const container = document.getElementById('dashboard-timeline-grid');
    if (!container) return;

    const titleEl = document.getElementById('timeline-roadmap-title');
    if (titleEl) titleEl.textContent = `Planning Annuel des Projets (Roadmap ${TIMELINE_YEAR})`;

    container.innerHTML = '';

    // --- Header row (12 months) ---
    const headerRow = document.createElement('div');
    headerRow.className = 'timeline-header-row';

    const cornerCell = document.createElement('div');
    cornerCell.className = 'timeline-header-cell';
    cornerCell.style.textAlign = 'left';
    cornerCell.textContent = `Projets ${TIMELINE_YEAR}`;
    headerRow.appendChild(cornerCell);

    TIMELINE_MONTH_LABELS.forEach(label => {
        const cell = document.createElement('div');
        cell.className = 'timeline-header-cell';
        cell.textContent = label;
        headerRow.appendChild(cell);
    });

    container.appendChild(headerRow);

    if (!projectsWithWeekInfo || projectsWithWeekInfo.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.style.cssText = 'padding: 1.5rem 0.25rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;';
        emptyState.textContent = 'Aucun projet à afficher dans le planning pour la sélection actuelle.';
        container.appendChild(emptyState);
        return;
    }

    // --- One row per project ---
    projectsWithWeekInfo.forEach(item => {
        const p = item.project;
        const w = item.weekInfo;

        const row = document.createElement('div');
        row.className = 'timeline-project-row';

        // Title column: name + client
        const infoCell = document.createElement('div');
        infoCell.className = 'timeline-project-info';
        infoCell.innerHTML = `
            <span class="timeline-proj-name">${p.name}</span>
            <span class="timeline-proj-client">${p.client || 'Client non défini'}</span>
        `;
        row.appendChild(infoCell);

        // Bar container spanning the 12 month columns
        const barContainer = document.createElement('div');
        barContainer.className = 'timeline-bar-container';

        // Dashed month separator lines
        const gridLines = document.createElement('div');
        gridLines.className = 'timeline-month-grid-lines';
        for (let i = 0; i < 12; i++) {
            const line = document.createElement('div');
            line.className = 'timeline-month-grid-line';
            gridLines.appendChild(line);
        }
        barContainer.appendChild(gridLines);

        const bounds = computeTimelineBounds(p.startDate, p.endDate);

        if (!bounds) {
            // Dates missing or invalid -> sober placeholder inviting completion
            const placeholder = document.createElement('div');
            placeholder.style.cssText = 'position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-style: italic; color: var(--text-muted); letter-spacing: 0.01em;';
            placeholder.textContent = 'Dates non définies';
            barContainer.appendChild(placeholder);
        } else if (bounds.outOfRange) {
            const placeholder = document.createElement('div');
            placeholder.style.cssText = 'position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-style: italic; color: var(--text-muted);';
            placeholder.textContent = `Hors période ${TIMELINE_YEAR}`;
            barContainer.appendChild(placeholder);
        } else {
            const bar = document.createElement('div');
            bar.className = 'timeline-project-bar';
            bar.dataset.status = w.status;
            bar.style.left = `${bounds.startPct}%`;
            bar.style.width = `${bounds.endPct - bounds.startPct}%`;

            const color = TIMELINE_STATUS_COLORS[w.status] || TIMELINE_STATUS_COLORS['planifié'];
            bar.style.background = `linear-gradient(135deg, ${color}, ${color})`;
            bar.style.filter = 'saturate(1.15)';

            const pmLabel = p.pm ? p.pm : 'CP non assigné';
            bar.title = `${p.name} • ${formatDateString(p.startDate)} → ${formatDateString(p.endDate)} • CP : ${pmLabel} • Statut : ${w.status}`;

            const label = document.createElement('span');
            label.textContent = `${formatDateString(p.startDate)} → ${formatDateString(p.endDate)}`;
            bar.appendChild(label);

            barContainer.appendChild(bar);
        }

        row.appendChild(barContainer);
        container.appendChild(row);
    });
}

// --- FACTURATION: SUIVI DE FACTURATION PRÉVISIONNELLE (DASHBOARD) ---

// Fills the Client / Chef de Projet filter dropdowns for the billing chart, from all projects
// that actually have at least one billing milestone defined.
function populateBillingFilterSelects() {
    const projectsWithBilling = state.projects.filter(p => Array.isArray(p.billing) && p.billing.length > 0);

    const fillFilter = (selectEl, field, placeholder) => {
        if (!selectEl) return;
        const currentVal = selectEl.value;
        const values = [...new Set(projectsWithBilling.map(p => p[field]).filter(Boolean))].sort();

        selectEl.innerHTML = `<option value="">${placeholder}</option>` +
            values.map(v => `<option value="${v.replace(/"/g, '&quot;')}">${v}</option>`).join('');

        if (values.includes(currentVal)) {
            selectEl.value = currentVal;
        }
    };

    fillFilter(els.billingFilterClient, 'client', 'Tous les clients');
    fillFilter(els.billingFilterPm, 'pm', 'Tous les chefs de projet');

    // Month filter: distinct months across all billing milestones, sorted chronologically
    if (els.billingFilterMonth) {
        const currentMonthVal = els.billingFilterMonth.value;
        const months = [...new Set(
            projectsWithBilling.flatMap(p => (p.billing || []).map(b => b.month).filter(Boolean))
        )].sort();

        els.billingFilterMonth.innerHTML = '<option value="">Tous les mois</option>' +
            months.map(m => `<option value="${m}">${formatMonthLabel(m)}</option>`).join('');

        if (months.includes(currentMonthVal)) {
            els.billingFilterMonth.value = currentMonthVal;
        }
    }
}

// Aggregates all billing milestones (across projects matching the optional client/pm filters)
// into per-month totals: montant planifié (all milestones) vs montant facturé (état facturé/payé).
function getBillingMonthlyAggregates(clientFilter, pmFilter, monthFilter) {
    const monthTotals = {}; // { 'YYYY-MM': { planned: number, invoiced: number } }

    state.projects.forEach(project => {
        if (clientFilter && project.client !== clientFilter) return;
        if (pmFilter && project.pm !== pmFilter) return;

        (project.billing || []).forEach(entry => {
            if (!entry.month) return;
            if (monthFilter && entry.month !== monthFilter) return;
            const amount = Number(entry.amount) || 0;

            if (!monthTotals[entry.month]) {
                monthTotals[entry.month] = { planned: 0, invoiced: 0 };
            }

            monthTotals[entry.month].planned += amount;
            if (entry.state === 'facturé' || entry.state === 'payé') {
                monthTotals[entry.month].invoiced += amount;
            }
        });
    });

    return Object.keys(monthTotals)
        .sort()
        .map(month => {
            const { planned, invoiced } = monthTotals[month];
            const percent = planned > 0 ? Math.round((invoiced / planned) * 100) : 0;
            return { month, planned, invoiced, percent };
        });
}

// Renders the "Suivi de Facturation Prévisionnelle" dashboard widget: summary KPIs,
// grouped bar chart (Planifié vs Facturé per month), and a detailed monthly breakdown list.
function renderBillingChart() {
    if (!els.billingChartCanvas) return;

    populateBillingFilterSelects();

    const clientFilter = els.billingFilterClient.value;
    const pmFilter = els.billingFilterPm.value;
    const monthFilter = els.billingFilterMonth.value;
    const monthlyData = getBillingMonthlyAggregates(clientFilter, pmFilter, monthFilter);

    // --- Summary KPI cards ---
    const totalPlanned = monthlyData.reduce((sum, m) => sum + m.planned, 0);
    const totalInvoiced = monthlyData.reduce((sum, m) => sum + m.invoiced, 0);
    const globalPct = totalPlanned > 0 ? Math.round((totalInvoiced / totalPlanned) * 100) : 0;

    els.billingSummaryBar.innerHTML = `
        <div class="billing-summary-card is-planned">
            <span class="billing-summary-label">Montant planifié</span>
            <span class="billing-summary-value">${formatAmount(totalPlanned)}</span>
        </div>
        <div class="billing-summary-card is-invoiced">
            <span class="billing-summary-label">Montant facturé / payé</span>
            <span class="billing-summary-value">${formatAmount(totalInvoiced)}</span>
        </div>
        <div class="billing-summary-card is-percent">
            <span class="billing-summary-label">Avancement global</span>
            <span class="billing-summary-value">${globalPct}%</span>
        </div>
    `;

    // --- Empty state ---
    if (monthlyData.length === 0) {
        els.billingChartCanvas.style.display = 'none';
        els.billingChartEmptyState.style.display = 'flex';
        els.billingMonthlyList.innerHTML = '';
        if (charts.billing) {
            charts.billing.destroy();
            charts.billing = null;
        }
        refreshIcons();
        return;
    }

    els.billingChartCanvas.style.display = 'block';
    els.billingChartEmptyState.style.display = 'none';

    // --- Monthly breakdown list ---
    els.billingMonthlyList.innerHTML = monthlyData.map(m => `
        <div class="billing-month-row">
            <span class="billing-month-label">${formatMonthLabel(m.month)}</span>
            <span class="billing-month-metric">Planifié : <strong>${formatAmount(m.planned)}</strong></span>
            <span class="billing-month-metric">Facturé : <strong>${formatAmount(m.invoiced)}</strong></span>
            <span class="billing-month-percent ${m.percent >= 100 ? 'is-complete' : ''}">${m.percent}%</span>
        </div>
    `).join('');

    // --- Chart.js grouped bar chart ---
    if (typeof Chart === 'undefined') {
        console.warn("Chart.js n'est pas chargé. Le graphique de facturation ne sera pas affiché.");
        return;
    }

    const isDark = !document.body.classList.contains('light-theme');
    const chartTextCol = isDark ? '#a1a1aa' : '#64748b';
    const chartBorderCol = isDark ? 'rgba(63, 63, 70, 0.4)' : 'rgba(226, 232, 240, 0.8)';

    const labels = monthlyData.map(m => formatMonthLabel(m.month));
    const plannedData = monthlyData.map(m => m.planned);
    const invoicedData = monthlyData.map(m => m.invoiced);
    const percentByIndex = monthlyData.map(m => m.percent);

    if (charts.billing) charts.billing.destroy();
    const billingCtx = els.billingChartCanvas.getContext('2d');
    charts.billing = new Chart(billingCtx, {
        type: 'bar',
        data: {
            labels,
            datasets: [
                {
                    label: 'Montant Planifié',
                    data: plannedData,
                    backgroundColor: '#F6C900',
                    borderRadius: 6,
                    barThickness: 22
                },
                {
                    label: 'Montant Facturé / Payé',
                    data: invoicedData,
                    backgroundColor: '#0A6E89',
                    borderRadius: 6,
                    barThickness: 22
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: chartTextCol, font: { family: 'Outfit', size: 12 } }
                },
                tooltip: {
                    callbacks: {
                        afterBody: (items) => {
                            if (!items.length) return '';
                            const idx = items[0].dataIndex;
                            return `Avancement facturation : ${percentByIndex[idx]}%`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: chartTextCol, font: { family: 'Outfit' } }
                },
                y: {
                    beginAtZero: true,
                    grid: { color: chartBorderCol },
                    ticks: {
                        color: chartTextCol,
                        font: { family: 'Outfit' },
                        callback: (value) => formatAmount(value)
                    }
                }
            }
        }
    });

    refreshIcons();
}

// --- RENDERING & FILTERS (DASHBOARD TAB) ---

function populatePmFilter() {
    const currentFilterVal = els.filterPm.value;
    els.filterPm.innerHTML = '<option value="">Tous les Chefs de Projet</option>';
    
    const pms = [...new Set(state.projects.map(p => p.pm).filter(Boolean))].sort();
    pms.forEach(pm => {
        const opt = document.createElement('option');
        opt.value = pm;
        opt.textContent = pm;
        if (pm === currentFilterVal) opt.selected = true;
        els.filterPm.appendChild(opt);
    });
}

function renderDashboard() {
    const selectedWeek = els.globalWeekSelect.value;
    if (!selectedWeek) return;
    
    const projectsWithWeekInfo = state.projects.map(project => {
        const weekInfo = getProjectStatusForWeek(project, selectedWeek);
        return { project, weekInfo };
    });

    // Update KPIs
    const totalCount = state.projects.length;
    const activeCount = projectsWithWeekInfo.filter(item => item.weekInfo.status !== 'terminé').length;
    const totalUsers = projectsWithWeekInfo.reduce((acc, item) => acc + (parseInt(item.weekInfo.users) || 0), 0);
    const avgProgress = totalCount > 0 
        ? Math.round(projectsWithWeekInfo.reduce((acc, item) => acc + item.weekInfo.progress, 0) / totalCount)
        : 0;
    const alertCount = projectsWithWeekInfo.filter(item => 
        item.weekInfo.status === 'en retard' || item.weekInfo.weather === 'bloqué'
    ).length;

    els.kpiActiveCount.textContent = activeCount;
    els.kpiUsersCount.textContent = totalUsers.toLocaleString('fr-FR');
    els.kpiProgressValue.textContent = `${avgProgress}%`;
    els.kpiAlertsValue.textContent = alertCount;

    // Filters application
    const searchVal = els.searchInput.value.toLowerCase().trim();
    const statusVal = els.filterStatus.value;
    const weatherVal = els.filterWeather.value;
    const pmVal = els.filterPm.value;

    const filtered = projectsWithWeekInfo.filter(item => {
        const matchSearch = !searchVal || 
            item.project.name.toLowerCase().includes(searchVal) ||
            item.project.client.toLowerCase().includes(searchVal) ||
            item.project.pm.toLowerCase().includes(searchVal) ||
            (item.project.partnerName && item.project.partnerName.toLowerCase().includes(searchVal));

        const matchStatus = !statusVal || item.weekInfo.status === statusVal;
        const matchWeather = !weatherVal || item.weekInfo.weather === weatherVal;
        const matchPm = !pmVal || item.project.pm === pmVal;

        return matchSearch && matchStatus && matchWeather && matchPm;
    });

    updateCharts(projectsWithWeekInfo);

    // Roadmap annuelle (réagit aux filtres et à la semaine globale sélectionnée)
    renderTimelineRoadmap(filtered);

    renderBillingChart();

    // Render Table
    els.projectsTableBody.innerHTML = '';
    
    if (filtered.length === 0) {
        els.projectsTableBody.parentElement.style.display = 'none';
        els.projectsEmptyState.style.display = 'flex';
    } else {
        els.projectsTableBody.parentElement.style.display = 'table';
        els.projectsEmptyState.style.display = 'none';

        filtered.forEach(item => {
            const p = item.project;
            const w = item.weekInfo;
            
            const tr = document.createElement('tr');
            tr.id = `project-row-${p.id}`;

            const weatherBadge = w.actualWeek 
                ? `<span class="badge badge-meteo" data-val="${w.weather}"><i data-lucide="${w.weather === 'tout va bien' ? 'smile' : w.weather === 'c\'est compliqué' ? 'meh' : 'frown'}"></i> ${w.weather}</span>`
                : `<span class="badge badge-secondary" style="opacity: 0.5">Non saisi</span>`;
                
            const statusBadge = w.actualWeek
                ? `<span class="badge badge-status" data-val="${w.status}">${w.status}</span>`
                : `<span class="badge badge-secondary" style="opacity: 0.5">Non saisi</span>`;

            const modeLabel = p.mode === 'Partenaire' ? `Partenaire (${p.partnerName})` : 'Direct';
            const usersCount = w.actualWeek ? w.users.toLocaleString('fr-FR') : '-';

            let doneText = `<span style="color: var(--text-muted); font-style: italic;">Aucun rapport pour cette semaine.</span>`;
            if (w.actualWeek === selectedWeek) {
                doneText = `<span title="${w.done}">${w.done}</span>`;
            } else if (w.actualWeek) {
                doneText = `<span style="color: var(--text-muted); font-size: 0.8rem; font-style: italic;" title="Dernier rapport (S${w.actualWeek.split('-W')[1]}): ${w.done}">
                    Dernier rapport (S${w.actualWeek.split('-W')[1]}) : ${w.done}
                </span>`;
            }

            tr.innerHTML = `
                <td>
                    <div class="project-cell-info">
                        <span class="project-name-text">${p.name}</span>
                        <span class="project-client-text">${p.client}</span>
                    </div>
                </td>
                <td>${statusBadge}</td>
                <td>${weatherBadge}</td>
                <td>
                    <div class="progress-container">
                        <div class="progress-track">
                            <div class="progress-fill" style="width: ${w.progress}%"></div>
                        </div>
                        <span class="progress-percent">${w.progress}%</span>
                    </div>
                </td>
                <td><strong>${p.pm}</strong></td>
                <td>
                    <div style="font-size: 0.85rem;">
                        <strong>${p.type}</strong><br>
                        <span style="color: var(--text-muted); font-size: 0.8rem;">${modeLabel}</span>
                    </div>
                </td>
                <td>${usersCount}</td>
                <td>
                    <div class="weekly-summary-cell">${doneText}</div>
                </td>
                <td style="text-align: right;">
                    <div class="row-actions">
                        <button class="btn btn-secondary btn-icon-only dashboard-view-btn" data-id="${p.id}" title="Consulter dans l'espace de saisie & historique">
                            <i data-lucide="eye"></i>
                        </button>
                        <button class="btn btn-secondary btn-icon-only dashboard-report-btn" data-id="${p.id}" title="Saisir/Modifier le rapport hebdomadaire">
                            <i data-lucide="calendar-plus"></i>
                        </button>
                        <button class="btn btn-secondary btn-icon-only edit-btn" data-id="${p.id}" title="Modifier les infos de projet">
                            <i data-lucide="edit-3"></i>
                        </button>
                        <button class="btn btn-secondary btn-icon-only delete-btn" data-id="${p.id}" title="Supprimer le projet" style="color: var(--weather-danger); border-color: rgba(239, 68, 68, 0.2);">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                </td>
            `;

            els.projectsTableBody.appendChild(tr);
        });
        
        refreshIcons();
        attachRowEventListeners();
    }
}

// Dashboard table rows actions (redirect to Split-View Tab)
function attachRowEventListeners() {
    // View history (Goes to Tab 2 and shows Project details)
    document.querySelectorAll('.dashboard-view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            switchToEditorTab(id, 'history');
        });
    });

    // Saisir le rapport (Goes to Tab 2 and sets focus on form)
    document.querySelectorAll('.dashboard-report-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            switchToEditorTab(id, 'form');
        });
    });

    // Edit project info (Trigger popup)
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            openProjectModal(id);
        });
    });

    // Delete project
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-id');
            const proj = state.projects.find(p => p.id === id);
            if (confirm(`Êtes-vous sûr de vouloir supprimer le projet "${proj.name}" ?`)) {
                state.projects = state.projects.filter(p => p.id !== id);
                if (selectedProjectId === id) selectedProjectId = null;
                saveState();
                populatePmFilter();
                renderDashboard();
                renderEditorProjectsList();
                renderEditorWorkspace();
                showToast(`Projet "${proj.name}" supprimé.`, 'info');
            }
        });
    });
}

// Redirects user to Tab 2 (Split-View Editor)
function switchToEditorTab(projectId, focusTarget = 'form') {
    // 1. Activate tab buttons
    els.tabButtons.forEach(btn => btn.classList.remove('active'));
    els.tabBtnEditor.classList.add('active');

    // 2. Toggle content divs
    els.tabContents.forEach(cont => cont.classList.remove('active'));
    document.getElementById('tab-editor').classList.add('active');
    document.getElementById('tab-dashboard').style.display = 'none';
    document.getElementById('tab-editor').style.display = 'block';

    // 3. Select project
    selectedProjectId = projectId;
    renderEditorProjectsList();
    renderEditorWorkspace();

    // 4. Scroll & Focus
    if (focusTarget === 'form') {
        setTimeout(() => {
            els.editorStatus.focus();
            showToast("Prêt pour la saisie hebdomadaire.", "info");
        }, 100);
    } else {
        setTimeout(() => {
            els.editorHistoryTimeline.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    }
}

// --- FORMATION: CALENDRIER INTERACTIF DES SESSIONS DE FORMATION ---

// Month currently displayed in the calendar (day is irrelevant, always normalized to the 1st)
let trainingCalendarViewDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

const TRAINING_MONTH_LABELS = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

// Parses a 'YYYY-MM-DD' date string into a local Date at midnight (avoids UTC shift issues)
function parseLocalDate(dateStr) {
    if (!dateStr) return null;
    const [y, m, d] = dateStr.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
}

function toDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

// Returns true if the given day (Date, midnight) falls within [start, end] inclusive
function isDayWithinSession(day, session) {
    const start = parseLocalDate(session.startDate);
    const end = parseLocalDate(session.endDate);
    if (!start || !end) return false;
    const dayTime = day.getTime();
    return dayTime >= start.getTime() && dayTime <= end.getTime();
}

// Renders the monthly interactive calendar grid for the Formation tab
function renderTrainingCalendar() {
    if (!els.trainingCalendarGrid) return;

    const year = trainingCalendarViewDate.getFullYear();
    const month = trainingCalendarViewDate.getMonth();

    els.trainingCalendarLabel.textContent = `${TRAINING_MONTH_LABELS[month]} ${year}`;

    // Determine the first Monday to display (French week starts on Monday)
    const firstOfMonth = new Date(year, month, 1);
    const firstWeekday = (firstOfMonth.getDay() + 6) % 7; // 0 = Monday ... 6 = Sunday
    const gridStart = new Date(year, month, 1 - firstWeekday);

    const today = new Date();
    const todayKey = toDateKey(new Date(today.getFullYear(), today.getMonth(), today.getDate()));

    els.trainingCalendarGrid.innerHTML = '';

    // Always render 6 full weeks (42 cells) for a stable, premium grid layout
    for (let i = 0; i < 42; i++) {
        const cellDate = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + i);
        const cellKey = toDateKey(cellDate);
        const isOtherMonth = cellDate.getMonth() !== month;
        const isToday = cellKey === todayKey;

        const dayEl = document.createElement('div');
        dayEl.className = 'training-calendar-day';
        if (isOtherMonth) dayEl.classList.add('other-month');
        if (isToday) dayEl.classList.add('is-today');
        dayEl.dataset.date = cellKey;

        const numberEl = document.createElement('div');
        numberEl.className = 'training-day-number';
        numberEl.textContent = cellDate.getDate();
        dayEl.appendChild(numberEl);

        // Sessions overlapping this specific day
        const sessionsForDay = state.trainings.filter(s => isDayWithinSession(cellDate, s));

        if (sessionsForDay.length > 0) {
            const sessionsWrap = document.createElement('div');
            sessionsWrap.className = 'training-day-sessions';

            const maxVisible = 3;
            sessionsForDay.slice(0, maxVisible).forEach(session => {
                const chip = document.createElement('div');
                chip.className = 'training-session-chip';
                chip.textContent = session.name;
                chip.title = `${session.name} • Client : ${session.client} • Formateur : ${session.trainer} • Lieu : ${session.location} • Du ${formatDateString(session.startDate)} au ${formatDateString(session.endDate)}`;
                chip.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openTrainingModal(session.id);
                });
                sessionsWrap.appendChild(chip);
            });

            if (sessionsForDay.length > maxVisible) {
                const moreEl = document.createElement('div');
                moreEl.className = 'training-session-more';
                moreEl.textContent = `+${sessionsForDay.length - maxVisible} autre(s)`;
                sessionsWrap.appendChild(moreEl);
            }

            dayEl.appendChild(sessionsWrap);
        }

        // Clicking an empty area of the day pre-fills a new session with that start date
        dayEl.addEventListener('click', () => {
            openTrainingModal(null, cellKey);
        });

        els.trainingCalendarGrid.appendChild(dayEl);
    }

    renderTrainingUpcomingList();
    refreshIcons();
}

// Renders the compact list of upcoming (or currently running) training sessions
function renderTrainingUpcomingList() {
    if (!els.trainingUpcomingList) return;

    const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

    const upcoming = state.trainings
        .filter(s => {
            const end = parseLocalDate(s.endDate);
            return end && end.getTime() >= today.getTime();
        })
        .sort((a, b) => (a.startDate || '').localeCompare(b.startDate || ''));

    els.trainingUpcomingList.innerHTML = '';

    if (upcoming.length === 0) {
        const empty = document.createElement('p');
        empty.style.cssText = 'color: var(--text-muted); font-size: 0.85rem; font-style: italic; text-align: center; padding: 1rem 0;';
        empty.textContent = 'Aucune session de formation à venir. Cliquez sur un jour du calendrier pour en planifier une.';
        els.trainingUpcomingList.appendChild(empty);
        return;
    }

    upcoming.forEach(session => {
        const item = document.createElement('div');
        item.className = 'training-upcoming-item';
        item.innerHTML = `
            <div>
                <div class="training-upcoming-name">${session.name}</div>
                <div class="training-upcoming-meta">${session.client} • Formateur : ${session.trainer} • ${session.location}</div>
            </div>
            <div class="training-upcoming-dates">${formatDateString(session.startDate)} → ${formatDateString(session.endDate)}</div>
        `;
        item.addEventListener('click', () => openTrainingModal(session.id));
        els.trainingUpcomingList.appendChild(item);
    });
}

// Opens the training session modal, either empty (new) or pre-filled (edit).
// `prefillDate` (YYYY-MM-DD) is used to pre-fill the start date when creating from a day click.
function openTrainingModal(sessionId = null, prefillDate = null) {
    els.trainingForm.reset();
    els.trainingDeleteBtn.style.display = 'none';

    if (sessionId) {
        const session = state.trainings.find(s => s.id === sessionId);
        if (!session) return;

        els.trainingModalTitle.textContent = 'Modifier la Session de Formation';
        els.editTrainingId.value = session.id;
        els.trainingClient.value = session.client;
        els.trainingName.value = session.name;
        els.trainingTrainer.value = session.trainer;
        els.trainingLocation.value = session.location;
        els.trainingStartDate.value = session.startDate;
        els.trainingEndDate.value = session.endDate;

        els.trainingDeleteBtn.style.display = 'inline-flex';
    } else {
        els.trainingModalTitle.textContent = 'Nouvelle Session de Formation';
        els.editTrainingId.value = '';
        if (prefillDate) {
            els.trainingStartDate.value = prefillDate;
            els.trainingEndDate.value = prefillDate;
        }
    }

    els.trainingModal.classList.add('active');
}

function closeTrainingModal() {
    els.trainingModal.classList.remove('active');
}

// --- TICKETS NEOPROJECT: IMPORT XLS & TABLEAU INTERACTIF ---

// Maps a normalized column header (accents/case/spacing stripped) to an internal field key.
const TICKET_HEADER_ALIASES = {
    'equipe': 'team',
    'team': 'team',

    'id': 'ticketId',
    'ticket id': 'ticketId',
    'id ticket': 'ticketId',

    'sujet': 'subject',
    'subject': 'subject',
    'titre': 'subject',

    'type': 'type',

    'statut': 'status',
    'status': 'status',

    'priorite': 'priority',
    'priority': 'priority',

    'assigne a': 'assignee',
    'assigne': 'assignee',
    'assignee': 'assignee',
    'assigned to': 'assignee',

    'cree le': 'createdAt',
    'date de creation': 'createdAt',
    'date creation': 'createdAt',
    'created': 'createdAt',
    'created at': 'createdAt',

    'date echeance souhaitee': 'dueDate',
    'echeance souhaitee': 'dueDate',
    'date d echeance souhaitee': 'dueDate',
    'due date': 'dueDate',
    'echeance': 'dueDate',

    'auteur': 'author',
    'author': 'author',
    'reporter': 'author'
};

const TICKET_FIELD_LABELS = {
    team: 'Équipe',
    ticketId: 'ID',
    subject: 'Sujet',
    type: 'Type',
    status: 'Statut',
    priority: 'Priorité',
    assignee: 'Assigné à',
    createdAt: 'Créé le',
    dueDate: 'Date Échéance Souhaitée',
    author: 'Auteur'
};

// Strips accents/case/punctuation from a column header to allow flexible XLS header matching
function normalizeHeaderKey(str) {
    return String(str || '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

// Converts a raw Excel cell value (Date object, serial number, or string) into a 'YYYY-MM-DD' string
function excelValueToDateStr(value) {
    if (value === undefined || value === null || value === '') return '';

    if (value instanceof Date) {
        if (isNaN(value.getTime())) return '';
        return toDateKey(value);
    }

    if (typeof value === 'number') {
        if (typeof XLSX !== 'undefined' && XLSX.SSF && XLSX.SSF.parse_date_code) {
            const parsed = XLSX.SSF.parse_date_code(value);
            if (parsed) {
                return `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`;
            }
        }
        return '';
    }

    const trimmed = String(value).trim();
    if (!trimmed) return '';

    // French format DD/MM/YYYY or DD-MM-YYYY
    let m = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) {
        return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    }

    // Already ISO-like YYYY-MM-DD
    m = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (m) {
        return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
    }

    const parsedDate = new Date(trimmed);
    if (!isNaN(parsedDate.getTime())) return toDateKey(parsedDate);

    return trimmed; // leave unparsed value as-is rather than losing data
}

// Reads and parses an XLS/XLSX File into an array of ticket objects using flexible header matching
function parseTicketsXlsFile(file) {
    return new Promise((resolve, reject) => {
        if (typeof XLSX === 'undefined') {
            reject(new Error("La librairie de lecture Excel (XLSX) n'a pas pu être chargée."));
            return;
        }

        const reader = new FileReader();
        reader.onerror = () => reject(new Error("Impossible de lire le fichier sélectionné."));
        reader.onload = (evt) => {
            try {
                const data = new Uint8Array(evt.target.result);
                const workbook = XLSX.read(data, { type: 'array', cellDates: true });
                const firstSheetName = workbook.SheetNames[0];
                if (!firstSheetName) {
                    reject(new Error("Le fichier ne contient aucune feuille exploitable."));
                    return;
                }
                const sheet = workbook.Sheets[firstSheetName];
                const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

                if (!rows.length) {
                    reject(new Error("Le fichier importé ne contient aucune ligne de données."));
                    return;
                }

                // Build a header -> field map from whatever headers are actually present
                const headerFieldMap = {};
                Object.keys(rows[0]).forEach(header => {
                    const norm = normalizeHeaderKey(header);
                    if (TICKET_HEADER_ALIASES[norm]) {
                        headerFieldMap[header] = TICKET_HEADER_ALIASES[norm];
                    }
                });

                if (Object.keys(headerFieldMap).length === 0) {
                    reject(new Error("Aucune colonne reconnue dans le fichier. Colonnes attendues : Equipe, ID, Sujet, Type, Statut, Priorité, Assigné à, Créé le, Date Echéance Souhaitée, Auteur."));
                    return;
                }

                const tickets = rows.map((row, idx) => {
                    const ticket = {
                        id: 'ticket-' + Date.now() + '-' + idx,
                        team: '', ticketId: '', subject: '', type: '', status: '',
                        priority: '', assignee: '', createdAt: '', dueDate: '', author: ''
                    };

                    Object.entries(headerFieldMap).forEach(([header, field]) => {
                        const rawVal = row[header];
                        if (field === 'createdAt' || field === 'dueDate') {
                            ticket[field] = excelValueToDateStr(rawVal);
                        } else {
                            ticket[field] = (rawVal !== undefined && rawVal !== null) ? String(rawVal).trim() : '';
                        }
                    });

                    return ticket;
                });

                resolve(tickets);
            } catch (err) {
                reject(err);
            }
        };
        reader.readAsArrayBuffer(file);
    });
}

// Handles the "Importer un fichier XLS" file input change event
function handleTicketsXlsImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const runImport = () => {
        parseTicketsXlsFile(file)
            .then(tickets => {
                state.tickets = tickets;
                state.ticketsLastImport = new Date().toISOString();
                saveState();
                renderTicketsTable();
                showToast(`${tickets.length} ticket(s) importé(s) avec succès depuis "${file.name}".`);
            })
            .catch(err => {
                console.error("Erreur lors de l'import des tickets NeoProject", err);
                showToast(err.message || "Erreur lors de la lecture du fichier XLS.", "error");
            })
            .finally(() => {
                els.ticketsImportInput.value = '';
            });
    };

    if (state.tickets.length > 0) {
        const confirmed = confirm(
            `Le tableau contient déjà ${state.tickets.length} ticket(s).\nL'import va remplacer toutes les données existantes par le contenu du nouveau fichier.\nSouhaitez-vous continuer ?`
        );
        if (!confirmed) {
            els.ticketsImportInput.value = '';
            return;
        }
    }

    runImport();
}

// Clears all imported ticket data (used to reset the table before a fresh weekly import)
function clearAllTickets() {
    if (state.tickets.length === 0) {
        showToast("Le tableau des tickets est déjà vide.", "info");
        return;
    }

    const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer les ${state.tickets.length} ticket(s) actuellement affichés ? Cette action est irréversible.`);
    if (!confirmed) return;

    state.tickets = [];
    state.ticketsLastImport = null;
    saveState();
    renderTicketsTable();
    showToast("Le tableau des tickets a été vidé.", "info");
}

// Updates a single field of a ticket in-place (called on inline table edits) without a full re-render
function updateTicketField(ticketId, field, value) {
    const ticket = state.tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    if (ticket[field] === value) return;

    ticket[field] = value;
    saveState();

    // Refresh filters/datalists so newly typed values become selectable, without rebuilding rows
    populateTicketDatalists();
    populateTicketFilterSelects();

    // Keep the "en retard / priorité immédiate" row highlighting in sync without a full rebuild
    if (field === 'priority' || field === 'dueDate') {
        const rowEl = document.getElementById(`ticket-row-${ticket.id}`);
        if (rowEl) {
            rowEl.classList.toggle('ticket-row-critical', isTicketOverdue(ticket) || isTicketImmediatePriority(ticket));
        }
    }

    // Statistics (counts, breakdowns) may have shifted regardless of which field changed
    renderTicketsStats();
}

function deleteTicketRow(ticketId) {
    const ticket = state.tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const confirmed = confirm(`Supprimer le ticket "${ticket.ticketId || ticket.subject || 'sans nom'}" du tableau ?`);
    if (!confirmed) return;

    state.tickets = state.tickets.filter(t => t.id !== ticketId);
    saveState();
    renderTicketsTable();
    showToast("Ticket supprimé.", "info");
}
// Builds one "label / value" block for the ticket details modal
function buildTicketDetailsItem(label, value, options = {}) {
    const isEmpty = value === undefined || value === null || value === '';
    const displayValue = isEmpty ? 'Non renseigné' : value;

    const classes = ['ticket-details-value'];
    if (isEmpty) classes.push('is-empty');
    if (options.critical && !isEmpty) classes.push('is-critical');

    return `
        <div class="ticket-details-item${options.span2 ? ' span-2' : ''}">
            <span class="ticket-details-label">${label}</span>
            <span class="${classes.join(' ')}">${displayValue}</span>
        </div>
    `;
}

// Opens the read-only "Détails du Ticket" modal for the given ticket
function openTicketDetailsModal(ticketId) {
    const ticket = state.tickets.find(t => t.id === ticketId);
    if (!ticket) return;

    const overdue = isTicketOverdue(ticket);
    const immediate = isTicketImmediatePriority(ticket);

    els.ticketDetailsModalTitle.textContent = ticket.ticketId
        ? `Ticket ${ticket.ticketId}`
        : 'Détails du Ticket';

    els.ticketDetailsBody.innerHTML = [
        buildTicketDetailsItem('Équipe', ticket.team),
        buildTicketDetailsItem('ID', ticket.ticketId),
        buildTicketDetailsItem('Sujet', ticket.subject, { span2: true }),
        buildTicketDetailsItem('Type', ticket.type),
        buildTicketDetailsItem('Statut', ticket.status),
        buildTicketDetailsItem('Priorité', ticket.priority, { critical: immediate }),
        buildTicketDetailsItem('Assigné à', ticket.assignee),
        buildTicketDetailsItem('Auteur', ticket.author),
        buildTicketDetailsItem('Créé le', formatDateString(ticket.createdAt)),
        buildTicketDetailsItem(
            'Date Échéance Souhaitée',
            formatDateString(ticket.dueDate) + (overdue ? ' — En retard' : ''),
            { critical: overdue }
        )
    ].join('');

    els.ticketDetailsModal.classList.add('active');
}

function closeTicketDetailsModal() {
    els.ticketDetailsModal.classList.remove('active');
}

// Fills the <datalist> elements used for autocompletion on free-text editable columns
function populateTicketDatalists() {
    const fillDatalist = (datalistEl, field) => {
        if (!datalistEl) return;
        const values = [...new Set(state.tickets.map(t => t[field]).filter(Boolean))].sort();
        datalistEl.innerHTML = values.map(v => `<option value="${v.replace(/"/g, '&quot;')}"></option>`).join('');
    };

    fillDatalist(els.ticketsTeamDatalist, 'team');
    fillDatalist(els.ticketsTypeDatalist, 'type');
    fillDatalist(els.ticketsStatusDatalist, 'status');
    fillDatalist(els.ticketsPriorityDatalist, 'priority');
    fillDatalist(els.ticketsAssigneeDatalist, 'assignee');
    fillDatalist(els.ticketsAuthorDatalist, 'author');
}

// Fills the "Équipe / Statut / Priorité" filter dropdowns from currently loaded ticket data
function populateTicketFilterSelects() {
    const fillFilter = (selectEl, field, placeholder) => {
        if (!selectEl) return;
        const currentVal = selectEl.value;
        const values = [...new Set(state.tickets.map(t => t[field]).filter(Boolean))].sort();

        selectEl.innerHTML = `<option value="">${placeholder}</option>` +
            values.map(v => `<option value="${v.replace(/"/g, '&quot;')}">${v}</option>`).join('');

        if (values.includes(currentVal)) {
            selectEl.value = currentVal;
        }
    };

    fillFilter(els.ticketsFilterTeam, 'team', 'Toutes les équipes');
    fillFilter(els.ticketsFilterStatus, 'status', 'Tous les statuts');
    fillFilter(els.ticketsFilterPriority, 'priority', 'Toutes les priorités');
}

// Builds a single editable <td> containing a text/date input bound to a ticket field
function buildTicketEditableCell(ticket, field, options = {}) {
    const td = document.createElement('td');
    const input = document.createElement('input');

    input.type = options.type || 'text';
    input.className = 'ticket-cell-input' + (options.extraClass ? ' ' + options.extraClass : '');
    input.value = ticket[field] || '';
    input.placeholder = TICKET_FIELD_LABELS[field] || '';

    if (options.datalistId) {
        input.setAttribute('list', options.datalistId);
    }

    input.addEventListener('change', () => {
        updateTicketField(ticket.id, field, input.value.trim());
    });

    td.appendChild(input);
    return td;
}

// Renders the interactive, editable Tickets NeoProject table (applies search + filters)
// Returns true if the ticket has a due date that has already passed (strictly before today)
function isTicketOverdue(ticket) {
    if (!ticket.dueDate) return false;
    const due = parseLocalDate(ticket.dueDate);
    if (!due) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due.getTime() < today.getTime();
}

// Returns true if the ticket's priority is "Immédiate" (accent/case-insensitive,
// since the value comes from a freeform imported XLS column)
function isTicketImmediatePriority(ticket) {
    if (!ticket.priority) return false;
    return normalizeHeaderKey(ticket.priority) === 'immediate';
}

// Builds a compact "name — bar — count" breakdown list for a given ticket field
// (e.g. team, author, status, priority), sorted by descending count.
function renderTicketBreakdown(container, tickets, field) {
    if (!container) return;

    const counts = {};
    tickets.forEach(t => {
        const val = (t[field] || '').trim() || 'Non renseigné';
        counts[val] = (counts[val] || 0) + 1;
    });

    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);

    if (entries.length === 0) {
        container.innerHTML = '<p class="tickets-breakdown-empty">Aucune donnée.</p>';
        return;
    }

    const maxCount = entries[0][1];

    container.innerHTML = entries.map(([name, count]) => `
        <div class="tickets-breakdown-row">
            <span class="tickets-breakdown-name" title="${name}">${name}</span>
            <span class="tickets-breakdown-bar-track">
                <span class="tickets-breakdown-bar-fill" style="width: ${Math.round((count / maxCount) * 100)}%;"></span>
            </span>
            <span class="tickets-breakdown-count">${count}</span>
        </div>
    `).join('');
}

// Renders the KPI cards + breakdown lists (Équipe / Auteur / Statut / Priorité) for all
// currently imported tickets (independent of the table's search/filters, to always show
// the full picture).
function renderTicketsStats() {
    if (!els.ticketsStatsCard) return;

    if (state.tickets.length === 0) {
        els.ticketsStatsCard.style.display = 'none';
        return;
    }

    els.ticketsStatsCard.style.display = 'block';

    const overdueCount = state.tickets.filter(isTicketOverdue).length;
    const immediateCount = state.tickets.filter(isTicketImmediatePriority).length;
    const openTeams = new Set(state.tickets.map(t => t.team).filter(Boolean)).size;

    els.ticketsKpiRow.innerHTML = `
        <div class="tickets-kpi-card">
            <span class="tickets-kpi-label">Total tickets</span>
            <span class="tickets-kpi-value">${state.tickets.length}</span>
        </div>
        <div class="tickets-kpi-card is-danger">
            <span class="tickets-kpi-label">Tickets en retard</span>
            <span class="tickets-kpi-value">${overdueCount}</span>
        </div>
        <div class="tickets-kpi-card is-warning">
            <span class="tickets-kpi-label">Priorité Immédiate</span>
            <span class="tickets-kpi-value">${immediateCount}</span>
        </div>
        <div class="tickets-kpi-card">
            <span class="tickets-kpi-label">Équipes impliquées</span>
            <span class="tickets-kpi-value">${openTeams}</span>
        </div>
    `;

    renderTicketBreakdown(els.ticketsBreakdownTeam, state.tickets, 'team');
    renderTicketBreakdown(els.ticketsBreakdownAuthor, state.tickets, 'author');
    renderTicketBreakdown(els.ticketsBreakdownStatus, state.tickets, 'status');
    renderTicketBreakdown(els.ticketsBreakdownPriority, state.tickets, 'priority');
}
// Returns true if the ticket has a due date that has already passed (strictly before today)
function isTicketOverdue(ticket) {
    if (!ticket.dueDate) return false;
    const due = parseLocalDate(ticket.dueDate);
    if (!due) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due.getTime() < today.getTime();
}

// Returns true if the ticket's priority is "Immédiate" (accent/case-insensitive,
// since the value comes from a freeform imported XLS column)
function isTicketImmediatePriority(ticket) {
    if (!ticket.priority) return false;
    return normalizeHeaderKey(ticket.priority) === 'immediate';
}

function renderTicketsTable() {
    if (!els.ticketsTableBody) return;

    // Import info banner
    if (state.ticketsLastImport) {
        const importDate = new Date(state.ticketsLastImport);
        const formatted = importDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
            ' à ' + importDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        els.ticketsImportInfo.textContent = `${state.tickets.length} ticket(s) — dernier import le ${formatted}.`;
    } else {
        els.ticketsImportInfo.textContent = "Aucun import effectué pour le moment.";
    }

    populateTicketDatalists();
    populateTicketFilterSelects();
    renderTicketsStats();

    // Apply search & filters
    const searchVal = (els.ticketsSearchInput.value || '').toLowerCase().trim();
    const teamVal = els.ticketsFilterTeam.value;
    const statusVal = els.ticketsFilterStatus.value;
    const priorityVal = els.ticketsFilterPriority.value;

    const filtered = state.tickets.filter(t => {
        const matchSearch = !searchVal ||
            (t.ticketId && t.ticketId.toLowerCase().includes(searchVal)) ||
            (t.subject && t.subject.toLowerCase().includes(searchVal)) ||
            (t.assignee && t.assignee.toLowerCase().includes(searchVal)) ||
            (t.author && t.author.toLowerCase().includes(searchVal));

        const matchTeam = !teamVal || t.team === teamVal;
        const matchStatus = !statusVal || t.status === statusVal;
        const matchPriority = !priorityVal || t.priority === priorityVal;

        return matchSearch && matchTeam && matchStatus && matchPriority;
    });

    els.ticketsTableBody.innerHTML = '';

    if (state.tickets.length === 0) {
        els.ticketsTable.style.display = 'none';
        els.ticketsEmptyState.style.display = 'flex';
        els.ticketsEmptyState.querySelector('h3').textContent = 'Aucun ticket importé';
        els.ticketsEmptyState.querySelector('p').textContent = "Importez votre extraction hebdomadaire NeoProject au format XLS pour afficher et mettre à jour les tickets ici.";
        refreshIcons();
        return;
    }

    if (filtered.length === 0) {
        els.ticketsTable.style.display = 'none';
        els.ticketsEmptyState.style.display = 'flex';
        els.ticketsEmptyState.querySelector('h3').textContent = 'Aucun ticket ne correspond aux filtres';
        els.ticketsEmptyState.querySelector('p').textContent = "Modifiez votre recherche ou réinitialisez les filtres pour afficher les tickets importés.";
        refreshIcons();
        return;
    }

    els.ticketsTable.style.display = 'table';
    els.ticketsEmptyState.style.display = 'none';

    filtered.forEach(ticket => {
        const tr = document.createElement('tr');
        tr.id = `ticket-row-${ticket.id}`;
        if (isTicketOverdue(ticket) || isTicketImmediatePriority(ticket)) {
            tr.classList.add('ticket-row-critical');
        }

        tr.appendChild(buildTicketEditableCell(ticket, 'team', { datalistId: 'tickets-team-datalist' }));
        tr.appendChild(buildTicketEditableCell(ticket, 'ticketId', { extraClass: 'ticket-id-input' }));
        tr.appendChild(buildTicketEditableCell(ticket, 'subject', { extraClass: 'ticket-subject-input' }));
        tr.appendChild(buildTicketEditableCell(ticket, 'type', { datalistId: 'tickets-type-datalist' }));
        tr.appendChild(buildTicketEditableCell(ticket, 'status', { datalistId: 'tickets-status-datalist' }));
        tr.appendChild(buildTicketEditableCell(ticket, 'priority', { datalistId: 'tickets-priority-datalist' }));
        tr.appendChild(buildTicketEditableCell(ticket, 'assignee', { datalistId: 'tickets-assignee-datalist' }));
        tr.appendChild(buildTicketEditableCell(ticket, 'createdAt', { type: 'date' }));
        tr.appendChild(buildTicketEditableCell(ticket, 'dueDate', { type: 'date' }));
        tr.appendChild(buildTicketEditableCell(ticket, 'author', { datalistId: 'tickets-author-datalist' }));

        const actionsTd = document.createElement('td');
        actionsTd.style.textAlign = 'right';
        actionsTd.innerHTML = `
            <button class="btn btn-secondary btn-icon-only ticket-details-btn" title="Voir les détails du ticket">
                <i data-lucide="eye"></i>
            </button>
            <button class="btn btn-secondary btn-icon-only ticket-delete-btn" title="Supprimer ce ticket">
                <i data-lucide="trash-2"></i>
            </button>
        `;
        actionsTd.querySelector('.ticket-details-btn').addEventListener('click', () => openTicketDetailsModal(ticket.id));
        actionsTd.querySelector('.ticket-delete-btn').addEventListener('click', () => deleteTicketRow(ticket.id));
        tr.appendChild(actionsTd);

        els.ticketsTableBody.appendChild(tr);
    });

    refreshIcons();
}

// --- TAB NAV SYSTEM ---

function initTabSystem() {
    els.tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-tab');
            
            els.tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            els.tabContents.forEach(cont => {
                cont.classList.remove('active');
                if (cont.id === targetId) {
                    cont.classList.add('active');
                    cont.style.display = 'block';
                } else {
                    cont.style.display = 'none';
                }
            });

            // If entering dashboard, re-render charts to avoid render sizing issues
            if (targetId === 'tab-dashboard') {
                renderDashboard();
            } else if (targetId === 'tab-editor') {
                renderEditorProjectsList();
                renderEditorWorkspace();
            } else if (targetId === 'tab-formation') {
                renderTrainingCalendar();
            } else if (targetId === 'tab-tickets') {
                renderTicketsTable();
            }
        });
    });
}

// --- SPLIT-VIEW LOGIC (TAB 2) ---

function renderEditorProjectsList() {
    els.editorProjectsList.innerHTML = '';
    const searchVal = els.editorSearchInput.value.toLowerCase().trim();
    const currentWeek = els.globalWeekSelect.value; // Use global week context for initial indicators

    const filtered = state.projects.filter(p => {
        return !searchVal || 
            p.name.toLowerCase().includes(searchVal) ||
            p.client.toLowerCase().includes(searchVal) ||
            p.pm.toLowerCase().includes(searchVal);
    });

    if (filtered.length === 0) {
        els.editorProjectsList.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 1.5rem 0;">
                Aucun projet trouvé
            </div>
        `;
        return;
    }

    filtered.forEach(p => {
        const info = getProjectStatusForWeek(p, currentWeek);
        const card = document.createElement('div');
        card.className = `project-select-card ${selectedProjectId === p.id ? 'active' : ''}`;
        
        let weatherEmoji = '🟢';
        if (info.weather === 'c\'est compliqué') weatherEmoji = '🟡';
        else if (info.weather === 'bloqué') weatherEmoji = '🔴';

        card.innerHTML = `
            <div class="select-card-header">
                <span class="select-card-title">${p.name}</span>
                <span>${weatherEmoji}</span>
            </div>
            <div class="select-card-meta">
                <span class="select-card-client">${p.client}</span>
                <span class="select-card-progress">${info.progress}%</span>
            </div>
        `;

        card.addEventListener('click', () => {
            selectedProjectId = p.id;
            // Refresh list selections styling
            document.querySelectorAll('.project-select-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            renderEditorWorkspace();
        });

        els.editorProjectsList.appendChild(card);
    });
}

function renderEditorWorkspace() {
    if (!selectedProjectId) {
        els.editorEmptyState.style.display = 'flex';
        els.editorWorkspace.style.display = 'none';
        return;
    }

    const p = state.projects.find(x => x.id === selectedProjectId);
    if (!p) {
        selectedProjectId = null;
        renderEditorWorkspace();
        return;
    }

    els.editorEmptyState.style.display = 'none';
    els.editorWorkspace.style.display = 'block';

    // Populate general headers
    els.editorProjectName.textContent = p.name;
    els.editorProjectClient.textContent = `Client : ${p.client}`;
    els.editorPmVal.textContent = p.pm;
    els.editorTypeVal.textContent = `${p.type} (${p.mode === 'Partenaire' ? 'Partenaire: ' + p.partnerName : 'Direct'})`;
    els.editorDatesVal.textContent = `${formatDateString(p.startDate)} au ${formatDateString(p.endDate)}`;

    // Populate week selector inside Editor
    const weeks = generateWeeksList();
    const activeWeek = els.editorWeekSelect.value || els.globalWeekSelect.value;
    
    els.editorWeekSelect.innerHTML = '';
    weeks.forEach(w => {
        const opt = document.createElement('option');
        opt.value = w;
        opt.textContent = `Semaine ${w.split('-W')[1]} (${w.split('-W')[0]})`;
        if (w === activeWeek) opt.selected = true;
        els.editorWeekSelect.appendChild(opt);
    });

    // Configure info button trigger
    els.editorEditInfoBtn.onclick = () => {
        openProjectModal(p.id);
    };

    // Load report for the active editor week
    loadEditorWeeklyData(p, els.editorWeekSelect.value);
    
    // Render timeline
    renderEditorTimeline(p);

    // Render billing (facturation) milestones table
    renderBillingTable(p);
}

function loadEditorWeeklyData(project, week) {
    const info = getProjectStatusForWeek(project, week);

    els.editorStatus.value = info.status;
    els.editorWeather.value = info.weather;
    els.editorProgress.value = info.progress;
    els.editorUsers.value = info.users || 0;

    // Reset narratives if it's a fallback report to let user start typing clean weekly logs
    if (info.isFallback) {
        els.editorDone.value = '';
        els.editorCurrentStep.value = info.currentStep || ''; // Retain step helper if available
        els.editorNextStep.value = '';
        els.editorBlockers.value = '';
        els.editorRisks.value = '';
    } else {
        els.editorDone.value = info.done || '';
        els.editorCurrentStep.value = info.currentStep || '';
        els.editorNextStep.value = info.nextStep || '';
        els.editorBlockers.value = info.blockers || '';
        els.editorRisks.value = info.risks || '';
    }
}

// --- FACTURATION: MODALITÉS DE FACTURATION PAR PROJET (ÉDITEUR) ---

const BILLING_STATE_LABELS = {
    'planifié': 'Planifié',
    'facturé': 'Facturé',
    'payé': 'Payé',
    'risqué': 'Risqué (à reporter)'
};

// Formats a number with French thousands separators, no fixed currency symbol
function formatAmount(num) {
    const n = Number(num) || 0;
    return n.toLocaleString('fr-FR', { maximumFractionDigits: 2 });
}

// Formats a 'YYYY-MM' month key into a readable French label, e.g. "Mars 2026"
function formatMonthLabel(monthKey) {
    if (!monthKey) return '';
    const [y, m] = monthKey.split('-').map(Number);
    if (!y || !m) return monthKey;
    const d = new Date(y, m - 1, 1);
    return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

// Adds a new billing milestone (échéance) to the given project, with sensible defaults
function addBillingRow(project) {
    if (!Array.isArray(project.billing)) project.billing = [];

    const now = new Date();
    const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    project.billing.push({
        id: 'billing-' + Date.now(),
        month: defaultMonth,
        state: 'planifié',
        amount: 0,
        percent: 0
    });

    saveState();
    renderBillingTable(project);
}

// Updates a single field of a billing milestone in place, without a full table rebuild
function updateBillingField(project, entryId, field, value) {
    const entry = (project.billing || []).find(b => b.id === entryId);
    if (!entry) return;

    if (field === 'amount' || field === 'percent') {
        entry[field] = Number(value) || 0;
    } else {
        entry[field] = value;
    }

    saveState();
    renderBillingTotals(project);
}

function deleteBillingRow(project, entryId) {
    const entry = (project.billing || []).find(b => b.id === entryId);
    if (!entry) return;

    const confirmed = confirm(`Supprimer cette échéance de facturation (${formatMonthLabel(entry.month)}) ?`);
    if (!confirmed) return;

    project.billing = project.billing.filter(b => b.id !== entryId);
    saveState();
    renderBillingTable(project);
    showToast("Échéance de facturation supprimée.", "info");
}

// Recomputes and displays the totals bar (planned / invoiced / progress %) without rebuilding rows
function renderBillingTotals(project) {
    const billing = project.billing || [];

    if (billing.length === 0) {
        els.billingTotalBar.style.display = 'none';
        return;
    }

    const totalPlanned = billing.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
    const totalInvoiced = billing
        .filter(b => b.state === 'facturé' || b.state === 'payé')
        .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
    const pct = totalPlanned > 0 ? Math.round((totalInvoiced / totalPlanned) * 100) : 0;

    els.billingTotalBar.style.display = 'flex';
    els.billingTotalAmount.textContent = formatAmount(totalPlanned);
    els.billingTotalInvoiced.textContent = formatAmount(totalInvoiced);
    els.billingTotalPercent.textContent = `${pct}%`;
}

// Builds a single editable <td> for a billing milestone row
function buildBillingEditableCell(project, entry, field, options = {}) {
    const td = document.createElement('td');

    if (field === 'state') {
        const select = document.createElement('select');
        select.className = 'billing-cell-input billing-state-select';
        select.dataset.val = entry.state;
        Object.entries(BILLING_STATE_LABELS).forEach(([value, label]) => {
            const opt = document.createElement('option');
            opt.value = value;
            opt.textContent = label;
            if (value === entry.state) opt.selected = true;
            select.appendChild(opt);
        });
        select.addEventListener('change', () => {
            select.dataset.val = select.value;
            updateBillingField(project, entry.id, 'state', select.value);
        });
        td.appendChild(select);
        return td;
    }

    const input = document.createElement('input');
    input.type = options.type || 'text';
    input.className = 'billing-cell-input';
    input.value = entry[field] !== undefined && entry[field] !== null ? entry[field] : '';

    if (options.min !== undefined) input.min = options.min;
    if (options.max !== undefined) input.max = options.max;
    if (options.step !== undefined) input.step = options.step;

    input.addEventListener('change', () => {
        updateBillingField(project, entry.id, field, input.value);
    });

    td.appendChild(input);
    return td;
}

// Renders the editable table of billing milestones (échéances) for the currently selected project
function renderBillingTable(project) {
    if (!els.billingTableBody) return;
    if (!Array.isArray(project.billing)) project.billing = [];

    els.billingAddRowBtn.onclick = () => addBillingRow(project);

    const billing = [...project.billing].sort((a, b) => (a.month || '').localeCompare(b.month || ''));

    els.billingTableBody.innerHTML = '';

    if (billing.length === 0) {
        els.billingTable.style.display = 'none';
        els.billingEmptyState.style.display = 'flex';
        els.billingTotalBar.style.display = 'none';
        refreshIcons();
        return;
    }

    els.billingTable.style.display = 'table';
    els.billingEmptyState.style.display = 'none';

    billing.forEach(entry => {
        const tr = document.createElement('tr');

        tr.appendChild(buildBillingEditableCell(project, entry, 'month', { type: 'month' }));
        tr.appendChild(buildBillingEditableCell(project, entry, 'state'));
        tr.appendChild(buildBillingEditableCell(project, entry, 'amount', { type: 'number', min: 0, step: 0.01 }));
        tr.appendChild(buildBillingEditableCell(project, entry, 'percent', { type: 'number', min: 0, max: 100, step: 0.1 }));

        const actionsTd = document.createElement('td');
        actionsTd.style.textAlign = 'right';
        actionsTd.innerHTML = `
            <button type="button" class="btn btn-secondary btn-icon-only billing-delete-btn" title="Supprimer cette échéance">
                <i data-lucide="trash-2"></i>
            </button>
        `;
        actionsTd.querySelector('.billing-delete-btn').addEventListener('click', () => deleteBillingRow(project, entry.id));
        tr.appendChild(actionsTd);

        els.billingTableBody.appendChild(tr);
    });

    renderBillingTotals(project);
    refreshIcons();
}

function renderEditorTimeline(project) {
    els.editorHistoryTimeline.innerHTML = '';
    
    const updates = project.weeklyUpdates || {};
    const sortedWeeks = Object.keys(updates).sort().reverse();

    if (sortedWeeks.length === 0) {
        els.editorHistoryTimeline.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); font-size: 0.9rem; padding: 2rem 0;">
                <i data-lucide="calendar-x" style="width: 32px; height: 32px; margin-bottom: 0.5rem; display: block; margin-left: auto; margin-right: auto;"></i>
                Aucun rapport hebdomadaire enregistré
            </div>
        `;
        refreshIcons();
        return;
    }

    sortedWeeks.forEach(w => {
        const report = updates[w];
        const card = document.createElement('div');
        card.className = 'weekly-report-card';
        
        card.innerHTML = `
            <div class="weekly-report-header">
                <span class="weekly-report-week" style="color: #0A6E89;">Semaine ${w.split('-W')[1]} (${w.split('-W')[0]})</span>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <span class="badge badge-status" data-val="${report.status}">${report.status}</span>
                    <span class="badge badge-meteo" data-val="${report.weather}">${report.weather}</span>
                    <button type="button" class="btn btn-secondary btn-icon-only edit-timeline-report-btn" data-week="${w}" style="height: 28px; width: 28px;" title="Charger ce rapport pour modification">
                        <i data-lucide="edit-3" style="width: 14px; height: 14px;"></i>
                    </button>
                </div>
            </div>
            <div class="weekly-report-metrics">
                <span>Avancement : <strong>${report.progress}%</strong></span>
                <span>Utilisateurs : <strong>${(report.users || 0).toLocaleString('fr-FR')}</strong></span>
            </div>
            <div class="weekly-report-grid">
                <div class="weekly-report-field">
                    <span class="weekly-report-field-title">Travaux réalisés</span>
                    <div class="weekly-report-field-value">${report.done || '-'}</div>
                </div>
                <div class="weekly-report-field">
                    <span class="weekly-report-field-title">Étape actuelle / Prochaine étape</span>
                    <div class="weekly-report-field-value"><strong>Actuelle:</strong> ${report.currentStep || '-'}<br><strong>Prochaine:</strong> ${report.nextStep || '-'}</div>
                </div>
                <div class="weekly-report-field" style="grid-column: span 2;">
                    <span class="weekly-report-field-title">Points d'attention & Bloquants</span>
                    <div class="weekly-report-field-value" style="border-left-color: var(--weather-danger);">${report.blockers || 'Aucun point d\'attention signalé.'}</div>
                </div>
                <div class="weekly-report-field" style="grid-column: span 2;">
                    <span class="weekly-report-field-title">Risques</span>
                    <div class="weekly-report-field-value" style="border-left-color: var(--weather-warning);">${report.risks || 'Aucun risque identifié.'}</div>
                </div>
            </div>
        `;

        // Handle edit button in Timeline
        card.querySelector('.edit-timeline-report-btn').addEventListener('click', () => {
            els.editorWeekSelect.value = w;
            loadEditorWeeklyData(project, w);
            // Scroll to the form
            els.editorWeeklyForm.scrollIntoView({ behavior: 'smooth' });
            showToast(`Rapport de la semaine ${w.split('-W')[1]} chargé dans l'éditeur.`, "info");
        });

        els.editorHistoryTimeline.appendChild(card);
    });

    refreshIcons();
}

// --- PROJECT INFOS MODAL TRIGGERS ---

// Shows "Abonnement" for Cloud projects, "Licences" for On Prem projects
// ("Prestations" is common to both and always visible).
function updateProjectTypeFieldsVisibility() {
    if (els.projectType.value === 'Cloud') {
        els.cloudAbonnementContainer.classList.add('visible');
        els.onpremLicencesContainer.classList.remove('visible');
    } else {
        els.onpremLicencesContainer.classList.add('visible');
        els.cloudAbonnementContainer.classList.remove('visible');
    }
}

// Makes "Date de réception contractuelle" mandatory only when the
// "Marché avec échéance" checkbox is ticked.
function updateContractualDateVisibility() {
    if (els.projectHasDeadlineMarket.checked) {
        els.contractualDateContainer.classList.add('visible');
        els.projectContractualDate.required = true;
    } else {
        els.contractualDateContainer.classList.remove('visible');
        els.projectContractualDate.required = false;
    }
}

function openProjectModal(projectId = null) {
    els.projectForm.reset();
    
    if (projectId) {
        const p = state.projects.find(x => x.id === projectId);
        if (!p) return;
        
        els.projectModalTitle.textContent = "Modifier le Projet";
        els.editProjectId.value = p.id;
        els.projectName.value = p.name;
        els.projectClient.value = p.client;
        els.projectPm.value = p.pm;
        els.projectType.value = p.type;
        els.projectAbonnement.value = p.abonnement || '';
        els.projectLicences.value = p.licences || '';
        els.projectPrestations.value = p.prestations || '';
        updateProjectTypeFieldsVisibility();
        
        if (p.mode === 'Partenaire') {
            document.getElementById('mode-partner').checked = true;
            els.partnerNameContainer.classList.add('visible');
            els.partnerName.required = true;
            els.partnerName.value = p.partnerName || '';
        } else {
            document.getElementById('mode-direct').checked = true;
            els.partnerNameContainer.classList.remove('visible');
            els.partnerName.required = false;
        }
        
        els.projectStartDate.value = p.startDate || '';
        els.projectEndDate.value = p.endDate || '';

        els.projectHasDeadlineMarket.checked = !!p.hasDeadlineMarket;
        els.projectContractualDate.value = p.contractualDate || '';
        updateContractualDateVisibility();
    } else {
        els.projectModalTitle.textContent = "Nouveau Projet";
        els.editProjectId.value = '';
        document.getElementById('mode-direct').checked = true;
        els.partnerNameContainer.classList.remove('visible');
        els.partnerName.required = false;

        els.projectType.value = 'Cloud';
        updateProjectTypeFieldsVisibility();

        els.projectHasDeadlineMarket.checked = false;
        updateContractualDateVisibility();
    }
    
    els.projectModal.classList.add('active');
}

function closeProjectModal() {
    els.projectModal.classList.remove('active');
}

// --- DEMO DATA LOAD ---

function loadDemoData() {
    const demoProjects = [
        {
            id: 'proj-sap',
            name: 'Migration SAP S/4HANA',
            client: 'Renault Group',
            pm: 'Sophie Martin',
            type: 'On Prem',
            mode: 'Partenaire',
            partnerName: 'Accenture',
            startDate: '2026-01-15',
            endDate: '2026-12-20',
            weeklyUpdates: {
                '2026-W27': {
                    status: 'en cours',
                    weather: 'tout va bien',
                    progress: 55,
                    users: 2500,
                    done: 'Migration de la base de données de test validée sur bac à sable.',
                    currentStep: 'Tests d\'intégration fonctionnels',
                    nextStep: 'Lancement de la pré-production',
                    blockers: 'Rien à signaler',
                    risks: 'Disponibilité limitée des clés métier en période de congés.'
                },
                '2026-W28': {
                    status: 'en cours',
                    weather: 'c\'est compliqué',
                    progress: 60,
                    users: 2500,
                    done: 'Début de l\'intégration de pré-production. Ecarts de performance détectés sur les requêtes SQL.',
                    currentStep: 'Réglage des performances DB',
                    nextStep: 'Tests de charge globaux',
                    blockers: 'Le temps de réponse des rapports comptables dépasse de 30% le SLA défini.',
                    risks: 'Risque de décalage de la mise en production si l\'optimisation échoue.'
                }
            }
        },
        {
            id: 'proj-axa',
            name: 'Portail Client Assurances MyWeb',
            client: 'Axa France',
            pm: 'Thomas Dubois',
            type: 'Cloud',
            mode: 'Direct',
            partnerName: '',
            startDate: '2026-03-01',
            endDate: '2026-09-30',
            weeklyUpdates: {
                '2026-W27': {
                    status: 'en cours',
                    weather: 'tout va bien',
                    progress: 75,
                    users: 12000,
                    done: 'Maquettes de souscription finalisées et revues par les représentants légaux.',
                    currentStep: 'Développement Frontend et API Passerelles',
                    nextStep: 'Validation Sécurité de l\'infrastructure Cloud',
                    blockers: 'Aucun',
                    risks: 'Aucun risque majeur'
                },
                '2026-W28': {
                    status: 'en cours',
                    weather: 'tout va bien',
                    progress: 80,
                    users: 12000,
                    done: 'Audits de sécurité cloud terminés et rapports approuvés par le RSSI.',
                    currentStep: 'Tests d\'Intégration Finaux',
                    nextStep: 'Lancement UAT (Recette Métier)',
                    blockers: 'Aucun',
                    risks: 'Assurer une forte disponibilité des testeurs métiers de chaque agence régionale.'
                }
            }
        },
        {
            id: 'proj-loreal',
            name: 'Déploiement Mobile RH',
            client: 'L\'Oréal',
            pm: 'Lucas Bernard',
            type: 'Cloud',
            mode: 'Partenaire',
            partnerName: 'Capgemini',
            startDate: '2026-05-10',
            endDate: '2026-08-15',
            weeklyUpdates: {
                '2026-W27': {
                    status: 'en cours',
                    weather: 'c\'est compliqué',
                    progress: 40,
                    users: 4500,
                    done: 'Intégration du module d\'authentification unique (SSO) pour l\'Europe.',
                    currentStep: 'Mise en place de la fédération d\'identité SSO',
                    nextStep: 'Tests fonctionnels sur les profils complexes',
                    blockers: 'L\'API du service d\'authentification génère des erreurs régulières en environnement de test.',
                    risks: 'Décalage de la livraison de la version Bêta si l\'authentification n\'est pas stabilisée.'
                },
                '2026-W28': {
                    status: 'en retard',
                    weather: 'bloqué',
                    progress: 42,
                    users: 4500,
                    done: 'Aucun progrès cette semaine suite au blocage réseau complet constaté en qualification.',
                    currentStep: 'Résolution des anomalies de routage réseau',
                    nextStep: 'Redémarrage des développements de profils',
                    blockers: 'L\'accès réseau vers la base centrale RH a été fermé suite à une politique stricte. En attente de déblocage par le DSI.',
                    risks: 'Retard garanti de la mise en production. Un décalage de la date de fin globale est inévitable (estimé à 3 semaines).'
                }
            }
        },
        {
            id: 'proj-socgen',
            name: 'Archivage Légal SecurDoc',
            client: 'Société Générale',
            pm: 'Amélie Laurent',
            type: 'On Prem',
            mode: 'Direct',
            partnerName: '',
            startDate: '2026-09-01',
            endDate: '2026-11-30',
            weeklyUpdates: {
                '2026-W27': {
                    status: 'planifié',
                    weather: 'tout va bien',
                    progress: 0,
                    users: 0,
                    done: 'Rédaction de la Charte de projet et du plan de management initial.',
                    currentStep: 'Cadrage méthodologique',
                    nextStep: 'Réunion de lancement client (Kick-off)',
                    blockers: 'Aucun',
                    risks: 'Retard potentiel dans la livraison des serveurs physiques dédiés.'
                },
                '2026-W28': {
                    status: 'planifié',
                    weather: 'tout va bien',
                    progress: 5,
                    users: 0,
                    done: 'Kick-off validé avec le comité exécutif. Validation du document d\'architecture technique.',
                    currentStep: 'Préparation des environnements de qualification',
                    nextStep: 'Installation de la stack de bases de données',
                    blockers: 'Aucun',
                    risks: 'Livraison physique des disques de stockage par le fournisseur.'
                }
            }
        }
    ];
    
    state.projects = demoProjects;
    saveState();
    
    // Pick first project as default selected in editor
    selectedProjectId = demoProjects[0].id;
    
    populatePmFilter();
    renderDashboard();
    renderEditorProjectsList();
    renderEditorWorkspace();
    
    showToast("Données de démonstration chargées avec succès.");
}

// Removes all currently loaded projects (e.g. the demo dataset) so the dashboard can start fresh
function clearDemoData() {
    if (state.projects.length === 0) {
        showToast("Aucune donnée à supprimer : le tableau de projets est déjà vide.", "info");
        return;
    }

    const confirmed = confirm(`Êtes-vous sûr de vouloir supprimer les ${state.projects.length} projet(s) actuellement chargés (y compris les données de démonstration) ? Cette action est irréversible.`);
    if (!confirmed) return;

    state.projects = [];
    selectedProjectId = null;
    saveState();

    populatePmFilter();
    renderDashboard();
    renderEditorProjectsList();
    renderEditorWorkspace();

    showToast("Les données de démonstration ont été supprimées.", "info");
}

// --- IMPORT / EXPORT DATA LOGIC ---

function exportToJson() {
    const jsonStr = JSON.stringify(state, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `neopmo_export_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
    
    showToast("Toutes les données de l'application ont été exportées en JSON.");
}

function handleJsonImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(evt) {
        try {
            const imported = JSON.parse(evt.target.result);
            if (imported && Array.isArray(imported.projects)) {
                state.projects = imported.projects;
                state.projects.forEach(p => {
                    if (!Array.isArray(p.billing)) {
                        p.billing = [];
                    }
                });
                if (imported.currentWeek) {
                    state.currentWeek = imported.currentWeek;
                }
                
                // Select first imported project as selected in editor
                selectedProjectId = state.projects.length > 0 ? state.projects[0].id : null;
                
                saveState();
                
                // Re-initialize UI
                initWeekSelector();
                populatePmFilter();
                renderDashboard();
                renderEditorProjectsList();
                renderEditorWorkspace();
                showToast("Fichier JSON importé et appliqué avec succès !");
            } else {
                showToast("Format de fichier invalide. Clé 'projects' requise.", "error");
            }
        } catch (err) {
            showToast("Erreur lors de la lecture du fichier JSON.", "error");
        }
    };
    reader.readAsText(file);
    els.importFileInput.value = '';
}

// --- INIT WEEKS SELECTORS ---

function initWeekSelector() {
    const weeks = generateWeeksList();
    const currentISO = getISOWeek(new Date());
    
    if (!state.currentWeek || !weeks.includes(state.currentWeek)) {
        state.currentWeek = weeks.includes(currentISO) ? currentISO : weeks[weeks.length - 6];
    }

    els.globalWeekSelect.innerHTML = '';
    weeks.forEach(w => {
        const opt = document.createElement('option');
        opt.value = w;
        opt.textContent = `Semaine ${w.split('-W')[1]} (${w.split('-W')[0]})`;
        if (w === state.currentWeek) opt.selected = true;
        els.globalWeekSelect.appendChild(opt);
    });
}

// Jumps the global week selector to today's actual ISO week and refreshes the dashboard accordingly
function goToCurrentWeek() {
    const currentISO = getISOWeek(new Date());

    // generateWeeksList() is always centered on "today", so the current week is normally present.
    // Rebuild the selector defensively in case it wasn't (e.g. stale list from a previous session).
    const optionExists = Array.from(els.globalWeekSelect.options).some(opt => opt.value === currentISO);
    if (!optionExists) {
        state.currentWeek = currentISO;
        initWeekSelector();
    }

    els.globalWeekSelect.value = currentISO;
    state.currentWeek = currentISO;
    saveState();

    renderDashboard();
    if (document.getElementById('tab-editor').classList.contains('active')) {
        renderEditorProjectsList();
    }

    showToast(`Semaine en cours affichée : Semaine ${currentISO.split('-W')[1]} (${currentISO.split('-W')[0]}).`, "info");
}

// --- GLOBAL EVENT LISTENERS & INITIALIZATION ---

function setupEventListeners() {
    // Tab switching
    initTabSystem();

    // Week selector changes
    els.globalWeekSelect.addEventListener('change', (e) => {
        state.currentWeek = e.target.value;
        saveState();
        renderDashboard();
        // If workspace is active, sync editor projects list indicator metrics
        if (document.getElementById('tab-editor').classList.contains('active')) {
            renderEditorProjectsList();
        }
    });

    // Theme Toggle
    els.themeToggleBtn.addEventListener('click', () => {
        const body = document.body;
        if (body.classList.contains('light-theme')) {
            body.classList.remove('light-theme');
            localStorage.setItem('pmo_theme', 'dark');
            els.themeIconLight.style.display = 'block';
            els.themeIconDark.style.display = 'none';
        } else {
            body.classList.add('light-theme');
            localStorage.setItem('pmo_theme', 'light');
            els.themeIconLight.style.display = 'none';
            els.themeIconDark.style.display = 'block';
        }
        
        renderDashboard();
        if (selectedProjectId) {
            renderEditorWorkspace();
        }
        showToast("Thème modifié", "info");
    });

    // Form Partner radio toggle
    document.querySelectorAll('input[name="project-mode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'Partenaire') {
                els.partnerNameContainer.classList.add('visible');
                els.partnerName.required = true;
                els.partnerName.focus();
            } else {
                els.partnerNameContainer.classList.remove('visible');
                els.partnerName.required = false;
                els.partnerName.value = '';
            }
        });
    });

    // Form: Type de déploiement (Cloud <-> On Prem) toggle
    els.projectType.addEventListener('change', updateProjectTypeFieldsVisibility);

    // Form: "Marché avec échéance" checkbox toggle
    els.projectHasDeadlineMarket.addEventListener('change', updateContractualDateVisibility);

    // Project metadata Form submit (Modal 1)
    els.projectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const projId = els.editProjectId.value;
        const name = els.projectName.value.trim();
        const client = els.projectClient.value.trim();
        const pm = els.projectPm.value.trim();
        const type = els.projectType.value;
        const abonnement = els.projectAbonnement.value.trim();
        const licences = els.projectLicences.value.trim();
        const prestations = els.projectPrestations.value.trim();
        const mode = document.querySelector('input[name="project-mode"]:checked').value;
        const partner = els.partnerName.value.trim();
        const start = els.projectStartDate.value;
        const end = els.projectEndDate.value;
        const hasDeadlineMarket = els.projectHasDeadlineMarket.checked;
        const contractualDate = hasDeadlineMarket ? els.projectContractualDate.value : '';

        if (projId) {
            const pIndex = state.projects.findIndex(x => x.id === projId);
            if (pIndex !== -1) {
                state.projects[pIndex] = {
                    ...state.projects[pIndex],
                    name,
                    client,
                    pm,
                    type,
                    abonnement: type === 'Cloud' ? abonnement : '',
                    licences: type === 'On Prem' ? licences : '',
                    prestations,
                    mode,
                    partnerName: mode === 'Partenaire' ? partner : '',
                    startDate: start,
                    endDate: end,
                    hasDeadlineMarket,
                    contractualDate
                };
                showToast(`Projet "${name}" mis à jour.`);
            }
        } else {
            const newProj = {
                id: 'proj-' + Date.now(),
                name,
                client,
                pm,
                type,
                abonnement: type === 'Cloud' ? abonnement : '',
                licences: type === 'On Prem' ? licences : '',
                prestations,
                mode,
                partnerName: mode === 'Partenaire' ? partner : '',
                startDate: start,
                endDate: end,
                hasDeadlineMarket,
                contractualDate,
                weeklyUpdates: {},
                billing: []
            };
            state.projects.push(newProj);
            // Select this new project in Editor
            selectedProjectId = newProj.id;
            showToast(`Nouveau projet "${name}" créé.`);
        }

        saveState();
        closeProjectModal();
        populatePmFilter();
        renderDashboard();
        renderEditorProjectsList();
        renderEditorWorkspace();
    });

    // Editor Tab: Split-View search
    els.editorSearchInput.addEventListener('input', renderEditorProjectsList);

    // Editor Tab: Split-View week selector change
    els.editorWeekSelect.addEventListener('change', (e) => {
        const p = state.projects.find(x => x.id === selectedProjectId);
        if (p) {
            loadEditorWeeklyData(p, e.target.value);
        }
    });

    // Editor Tab: Submit Weekly update Form
    els.editorWeeklyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const p = state.projects.find(x => x.id === selectedProjectId);
        if (!p) return;

        const targetWeek = els.editorWeekSelect.value;
        
        const report = {
            status: els.editorStatus.value,
            weather: els.editorWeather.value,
            progress: parseInt(els.editorProgress.value) || 0,
            users: parseInt(els.editorUsers.value) || 0,
            done: els.editorDone.value.trim(),
            currentStep: els.editorCurrentStep.value.trim(),
            nextStep: els.editorNextStep.value.trim(),
            blockers: els.editorBlockers.value.trim(),
            risks: els.editorRisks.value.trim()
        };

        if (!p.weeklyUpdates) p.weeklyUpdates = {};
        p.weeklyUpdates[targetWeek] = report;

        saveState();
        renderEditorProjectsList();
        renderEditorTimeline(p);
        showToast(`Suivi S${targetWeek.split('-W')[1]} enregistré pour "${p.name}".`);
    });

    // Filters (Dashboard Tab)
    els.searchInput.addEventListener('input', renderDashboard);
    els.filterStatus.addEventListener('change', renderDashboard);
    els.filterWeather.addEventListener('change', renderDashboard);
    els.filterPm.addEventListener('change', renderDashboard);

    els.clearFiltersBtn.addEventListener('click', () => {
        els.searchInput.value = '';
        els.filterStatus.value = '';
        els.filterWeather.value = '';
        els.filterPm.value = '';
        renderDashboard();
        showToast("Filtres réinitialisés.", "info");
    });

    // Modal triggers
    els.addProjectBtn.addEventListener('click', () => openProjectModal());
    els.emptyAddBtn.addEventListener('click', () => openProjectModal());
    
    // Démo (chargement depuis l'état vide / suppression)
    els.emptyDemoBtn.addEventListener('click', loadDemoData);
    els.clearDemoDataBtn.addEventListener('click', clearDemoData);
    els.currentWeekBtn.addEventListener('click', goToCurrentWeek);

    // Import / Export des données de l'application (JSON)
    els.exportDataBtn.addEventListener('click', exportToJson);
    els.importDataBtn.addEventListener('click', () => els.importFileInput.click());
    els.importFileInput.addEventListener('change', handleJsonImport);

    // Close modaux
    els.projectModalCloseBtn.addEventListener('click', closeProjectModal);
    els.projectModalCancel.addEventListener('click', closeProjectModal);
    
    window.addEventListener('click', (e) => {
        if (e.target === els.projectModal) closeProjectModal();
    });

    // --- FORMATION TAB: Calendrier & Sessions ---

    els.trainingPrevMonthBtn.addEventListener('click', () => {
        trainingCalendarViewDate = new Date(trainingCalendarViewDate.getFullYear(), trainingCalendarViewDate.getMonth() - 1, 1);
        renderTrainingCalendar();
    });

    els.trainingNextMonthBtn.addEventListener('click', () => {
        trainingCalendarViewDate = new Date(trainingCalendarViewDate.getFullYear(), trainingCalendarViewDate.getMonth() + 1, 1);
        renderTrainingCalendar();
    });

    els.trainingTodayBtn.addEventListener('click', () => {
        const now = new Date();
        trainingCalendarViewDate = new Date(now.getFullYear(), now.getMonth(), 1);
        renderTrainingCalendar();
    });

    els.addTrainingBtn.addEventListener('click', () => openTrainingModal());

    els.trainingModalCloseBtn.addEventListener('click', closeTrainingModal);
    els.trainingModalCancel.addEventListener('click', closeTrainingModal);
    // --- MODALE DE DÉTAILS D'UN TICKET NEOPROJECT ---
    els.ticketDetailsCloseBtn.addEventListener('click', closeTicketDetailsModal);
    els.ticketDetailsCloseBtn2.addEventListener('click', closeTicketDetailsModal);

    window.addEventListener('click', (e) => {
        if (e.target === els.ticketDetailsModal) closeTicketDetailsModal();
    });
    window.addEventListener('click', (e) => {
        if (e.target === els.trainingModal) closeTrainingModal();
    });

    els.trainingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const id = els.editTrainingId.value;
        const client = els.trainingClient.value.trim();
        const name = els.trainingName.value.trim();
        const trainer = els.trainingTrainer.value.trim();
        const location = els.trainingLocation.value.trim();
        const startDate = els.trainingStartDate.value;
        const endDate = els.trainingEndDate.value;

        if (endDate < startDate) {
            showToast("La date de fin doit être postérieure ou égale à la date de début.", "error");
            return;
        }

        if (id) {
            const idx = state.trainings.findIndex(s => s.id === id);
            if (idx !== -1) {
                state.trainings[idx] = { ...state.trainings[idx], client, name, trainer, location, startDate, endDate };
                showToast(`Session "${name}" mise à jour.`);
            }
        } else {
            state.trainings.push({
                id: 'training-' + Date.now(),
                client, name, trainer, location, startDate, endDate
            });
            showToast(`Session "${name}" planifiée.`);
        }

        saveState();
        closeTrainingModal();
        renderTrainingCalendar();
    });

    els.trainingDeleteBtn.addEventListener('click', () => {
        const id = els.editTrainingId.value;
        if (!id) return;

        const session = state.trainings.find(s => s.id === id);
        state.trainings = state.trainings.filter(s => s.id !== id);
        saveState();
        closeTrainingModal();
        renderTrainingCalendar();
        showToast(session ? `Session "${session.name}" supprimée.` : "Session supprimée.", "info");
    });

    // --- TICKETS NEOPROJECT TAB: Import XLS, filtres & tableau interactif ---

    els.ticketsImportBtn.addEventListener('click', () => els.ticketsImportInput.click());
    els.ticketsEmptyImportBtn.addEventListener('click', () => els.ticketsImportInput.click());
    els.ticketsImportInput.addEventListener('change', handleTicketsXlsImport);

    els.ticketsClearBtn.addEventListener('click', clearAllTickets);

    els.ticketsSearchInput.addEventListener('input', renderTicketsTable);
    els.ticketsFilterTeam.addEventListener('change', renderTicketsTable);
    els.ticketsFilterStatus.addEventListener('change', renderTicketsTable);
    els.ticketsFilterPriority.addEventListener('change', renderTicketsTable);

    els.ticketsClearFiltersBtn.addEventListener('click', () => {
        els.ticketsSearchInput.value = '';
        els.ticketsFilterTeam.value = '';
        els.ticketsFilterStatus.value = '';
        els.ticketsFilterPriority.value = '';
        renderTicketsTable();
        showToast("Filtres réinitialisés.", "info");
    });

    // --- SUIVI DE FACTURATION (DASHBOARD) : filtres Mois / Client / Chef de Projet ---
    els.billingFilterMonth.addEventListener('change', renderBillingChart);
    els.billingFilterClient.addEventListener('change', renderBillingChart);
    els.billingFilterPm.addEventListener('change', renderBillingChart);
}

// --- AUTHENTIFICATION (SUPABASE AUTH) ---

function hideLoadingOverlay() {
    const loadingOverlay = document.getElementById('app-loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('is-hidden');
        setTimeout(() => loadingOverlay.remove(), 350);
    }
}

function showLoginScreen() {
    hideLoadingOverlay();
    const overlay = document.getElementById('auth-login-overlay');
    if (overlay) overlay.style.display = 'flex';
}

function hideLoginScreen() {
    const overlay = document.getElementById('auth-login-overlay');
    if (overlay) overlay.style.display = 'none';
}

// Wires the login form and logout button. Called once, before any auth check,
// so the login screen is interactive even before the rest of the app initializes.
function setupAuthListeners() {
    const loginForm = document.getElementById('auth-login-form');
    const logoutBtn = document.getElementById('auth-logout-btn');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('auth-email').value.trim();
            const password = document.getElementById('auth-password').value;
            const errorEl = document.getElementById('auth-login-error');
            const submitBtn = document.getElementById('auth-login-submit-btn');

            errorEl.style.display = 'none';
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i data-lucide="loader-2"></i> Connexion...';
            refreshIcons();

            const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

            if (error) {
                errorEl.textContent = "Email ou mot de passe incorrect.";
                errorEl.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i data-lucide="log-in"></i> Se connecter';
                refreshIcons();
                return;
            }

            hideLoginScreen();
            const loadingOverlayEl = document.getElementById('app-loading-overlay');
            if (loadingOverlayEl) loadingOverlayEl.classList.remove('is-hidden');
            await bootApp();
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (!confirm("Voulez-vous vraiment vous déconnecter ?")) return;
            await supabaseClient.auth.signOut();
            location.reload();
        });
    }
}

// Boots the actual application (data load + rendering). Split out from init()
// so it can be triggered either immediately (no auth required) or after a
// successful login.
async function bootApp() {
    await loadState();
    initTheme();
    initWeekSelector();
    setupEventListeners();
    populatePmFilter();

    // Set default selected project in editor (first project)
    if (state.projects.length > 0) {
        selectedProjectId = state.projects[0].id;
    }

    renderDashboard();

    refreshIcons();
    hideLoadingOverlay();
}

// Initial initialization
async function init() {
    setupAuthListeners();

    if (supabaseClient) {
        // Show the logout button only when Supabase Auth is actually in use
        const logoutBtnEl = document.getElementById('auth-logout-btn');
        if (logoutBtnEl) logoutBtnEl.style.display = 'inline-flex';

        const { data: { session } } = await supabaseClient.auth.getSession();

        if (!session) {
            showLoginScreen();

            // Keep the app in sync if the person logs in/out in another tab
            supabaseClient.auth.onAuthStateChange((event) => {
                if (event === 'SIGNED_OUT') location.reload();
            });
            return; // Wait for the login form submission (see setupAuthListeners)
        }
    }

    await bootApp();
}

document.addEventListener('DOMContentLoaded', init);
