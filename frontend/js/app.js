{
const state = {
  user: null,
  risk: null,
  shelters: [],
  evacuation: null,
  checkins: [],
  myRescues: [],
  offline: !navigator.onLine,
  coords: null,
  selectedRole: 'user',
  lang: 'en'
};

const maps = { overview: null, route: null, responder: null, admin: null };

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const esc = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

const i18n = {
  en: {
    skip_to_content: 'Skip to main content',
    hero_eyebrow: 'FLOOD EARLY-WARNING + RESCUE COORDINATION',
    hero_title: 'Know earlier.<br><em>Move safer.</em>',
    hero_copy: 'An emergency-tech platform designed for rapid warnings, safe evacuation routes, shelter capacity tracking, and responder coordination.',
    hero_tagline: 'Predict. Warn. Evacuate. Stay Safe.',
    hero_p1: '01 Real-Time Risk Signals',
    hero_p2: '02 Smart Shelters',
    hero_p3: '03 Direct Responder Escalation',
    log_in: 'Log in',
    create_account: 'Create account',
    welcome_back: 'Welcome back',
    login_sub: 'Access your emergency safety dashboard.',
    continue_as: 'CONTINUE AS',
    role_user: 'PUBLIC USER',
    role_responder: 'RESCUE TEAM',
    role_admin: 'GOVERNMENT / ADMIN',
    email_label: 'Email',
    password_label: 'Password',
    enter_dashboard: 'Enter dashboard',
    register_title: 'Set up safety profile',
    register_sub: 'Help responders find and assist you in an emergency.',
    name_label: 'Name',
    language_label: 'Preferred language',
    create_profile: 'Create profile',
    auth_note: 'PreFlood is an emergency coordination aid. Always prioritize local official emergency instructions.',
    app_tagline: 'EARLY WARNING & SAFETY SYSTEM',
    i_need_help: 'I NEED HELP',
    online: '● Online',
    offline: '● Offline',
    log_out: 'Log out',
    sidebar_monitoring: 'SAFETY MONITORING',
    overview_risk: 'Overview & Risk',
    smart_shelters: 'Smart Shelters',
    evacuation_plan: 'Evacuation Plan',
    safety_profile: 'Safety Profile',
    responder_desk: 'Responder Desk',
    admin_desk: 'Government Admin',
    sidebar_assistance: 'EMERGENCY ASSISTANCE',
    sidebar_emergency_note: 'If you are in immediate life safety danger, call local emergency services immediately.',
    offline_protocols: 'Offline safety protocols →',
    live_safety_picture: 'LIVE SAFETY PICTURE',
    greeting_prefix: 'Good to see you,',
    greeting_sub: 'Real-time risk signals and emergency actions tailored to your region.',
    updating: 'Updating…',
    immediate_action: 'IMMEDIATE EMERGENCY ACTION',
    immediate_rescue_q: 'Need immediate rescue or assistance?',
    immediate_rescue_sub: 'Request priority assistance directly to the responder desk with your headcount and GPS location.',
    request_rescue_sm: 'Request Immediate Rescue',
    emergency_warning: 'Emergency Warning',
    warning_sub: 'Protocol & guidelines',
    get_time: 'GET TIME',
    get_time_sub: '3-minute safety deadline',
    start_evacuation: 'START EVACUATION',
    evacuation_sub: 'Find safe, open shelter',
    risk_eyebrow: 'YOUR AREA · RISK SIGNAL',
    risk_index: 'RISK INDEX',
    weather_eyebrow: 'LIVE WEATHER STATION OBSERVATION',
    weather_title: 'Weather & Rainfall Readings',
    station_data: 'Station Data',
    spatial_radar: 'SPATIAL SAFETY RADAR',
    shelters_map_title: 'Nearby Shelters & Risk Map',
    live_map_view: 'Live map view',
    nearest_facilities: 'NEAREST FACILITIES',
    available_shelters: 'Available Shelters',
    view_all_shelters: 'View all shelters →',
    accountability_status: 'ACCOUNTABILITY & STATUS',
    safe_prompt: 'Let responders know you are safe.',
    safe_sub: 'Confirm your safety status or trigger rescue escalation if you are trapped.',
    i_am_safe: '✓ I AM SAFE',
    shelter_network: 'SMART SHELTER NETWORK',
    choose_safe_place: 'Choose a safe place.',
    shelters_sub: 'Real-time availability and capacity tracking. Check in upon arrival.',
    evacuation_lifecycle: 'EVACUATION LIFECYCLE',
    move_clear_timeline: 'Move with a clear timeline.',
    evacuation_sub: 'Follow structured steps: set deadline, select shelter, follow safe route, confirm safety.',
    step_1: 'Safety Window',
    step_2: 'Select Shelter',
    step_3: 'Safe Route',
    step_4: 'Confirm Safe',
    route_guidance: 'NAVIGATION & ROUTE GUIDANCE',
    accountability_history: 'ACCOUNTABILITY HISTORY',
    your_checkin_history: 'Your Check-in History',
    no_checkins_yet: 'No check-ins recorded yet.',
    profile_title: 'Configure assistance needs.',
    profile_sub: 'Preferences help emergency responders understand what support you and your household require.',
    registered_address: 'Home Area / Registered Address',
    use_gps_address: 'Use current GPS for registered area',
    gps_note: 'GPS requested only when button is pressed.',
    vulnerability_needs: 'Accessibility and Vulnerability Needs',
    save_profile: 'Save Safety Preferences',
    op_coordination: 'OPERATIONAL COORDINATION',
    responder_sub: 'Prioritize life safety, track rescue queue, and monitor shelter capacity.',
    broadcast_alert: 'Broadcast Emergency Alert',
    refresh_desk: 'Refresh Desk',
    govt_infra: 'GOVERNMENT INFRASTRUCTURE',
    admin_sub: 'Full emergency overview, shelter lifecycle, capacity management, and alert dispatch.',
    issue_alert: 'Issue Emergency Alert',
    add_shelter: 'Add New Shelter',
    refresh_overview: 'Refresh Overview',
    get_current_location: '📍 GET CURRENT LOCATION',
    location_captured: '✓ Current location captured',
    use_manual_location: 'Use manual location instead',
    check_in_here: 'CHECK IN HERE',
    undo_checkin: 'Undo Check-in',
    select_shelter: 'Select shelter →',
    checked_in_at: '✓ Checked in at',
    total_people: 'Total people:',
    confirm_checkin: 'Confirm Check-in',
    cancel: 'Cancel',
    requested: 'REQUESTED',
    assigned: 'ASSIGNED',
    en_route: 'RESPONDER EN ROUTE',
    resolved: 'RESOLVED',
    priority_rescue: 'PRIORITY EMERGENCY RESCUE',
    rescue_sent: '🚨 Priority rescue request sent to emergency responders.',
    offline_mode: '📶 OFFLINE EMERGENCY MODE',
    dispatch_sms: '📱 Dispatch Emergency SMS Fallback',
    rainfall_1h: 'Rainfall (1h)',
    rainfall_24h: 'Rainfall (24h)',
    temperature: 'Temperature',
    humidity: 'Humidity',
    pressure: 'Pressure',
    wind_speed: 'Wind Speed',
    open_rescues: 'Open Rescues',
    evacuations: 'Evacuations',
    active_shelters: 'Active Shelters',
    people_checked_in: 'People Checked In',
    total_shelters: 'Total Shelters',
    total_occupancy: 'Total Occupancy',
    active_broadcasts: 'Active Broadcasts',
    priority: 'Priority',
    requester: 'Requester',
    headcount: 'Headcount',
    needs: 'Needs',
    location: 'Location',
    status: 'Status',
    urgent: 'URGENT',
    standard: 'STANDARD',
    available: 'AVAILABLE',
    full: 'FULL',
    places_occupied: 'places occupied',
    spaces_available: 'spaces available',
    activate: 'Activate',
    deactivate: 'Deactivate',
    remove: 'Remove',
    check_out: 'Check out',
    phone_label: 'Contact Phone',
    people_count_label: 'People Needing Help',
    situation_notes_label: 'Situation Notes',
    immediate_danger_label: 'Immediate life danger right now',
    live_status: 'LIVE STATUS',
    people_needing_help: 'People Needing Help',
    assistance_needs: 'Assistance Needs',
    rescue_notified_note: 'Emergency responders have been notified. Keep your line open and stay in a safe position.',
    requests_needing_attention: 'Requests Needing Attention',
    shelter_capacity_monitoring: 'Shelter Capacity Monitoring',
    shelters_control: 'Smart Shelters Control',
    no_available_shelter: 'No available shelter found nearby.',
    route_unavailable: 'Route calculation is temporarily unavailable.',
    voice_nav: '🔊 Speak Navigation',
    voice_unavailable: 'Voice navigation unavailable',
    voice_shelter_info: 'Navigating to {shelter}. Distance: {distance}. Remaining capacity: {capacity} spaces.',
    voice_reroute: 'Alert: {shelter} is currently full or unavailable. Rerouting to {next_shelter}.',
    voice_group_split: 'Group allocation: {count1} members to {shelter1}, and {count2} members to {shelter2}.',
    voice_arrival: 'You have arrived at {shelter}. Please complete your check-in.',
    voice_no_shelters: 'No active shelter with available capacity was found nearby. Please request emergency assistance.',
    nav_start: 'Head towards the shelter',
    nav_continue: 'Continue straight along the evacuation route',
    nav_turn: 'Turn towards the shelter entrance',
    nav_arrive: 'You have arrived at the shelter. Please check in.',
    distance: 'Distance',
    est_time: 'Est. Time'
  },
  es: {
    skip_to_content: 'Saltar al contenido principal',
    hero_eyebrow: 'ALERTA TEMPRANA DE INUNDACIONES Y COORDINACIÓN DE RESCATE',
    hero_title: 'Sepa antes.<br><em>Muévase seguro.</em>',
    hero_copy: 'Una plataforma tecnológica de emergencia diseñada para alertas rápidas, rutas de evacuación seguras y coordinación de rescatistas.',
    hero_tagline: 'Predecir. Advertir. Evacuar. Mantenerse a salvo.',
    hero_p1: '01 Señales de riesgo en tiempo real',
    hero_p2: '02 Refugios Inteligentes',
    hero_p3: '03 Escalación directa a rescatistas',
    log_in: 'Iniciar sesión',
    create_account: 'Crear cuenta',
    welcome_back: 'Bienvenido de nuevo',
    login_sub: 'Acceda a su panel de seguridad de emergencia.',
    continue_as: 'CONTINUAR COMO',
    role_user: 'USUARIO PÚBLICO',
    role_responder: 'EQUIPO DE RESCATE',
    role_admin: 'GOBIERNO / ADMIN',
    email_label: 'Correo electrónico',
    password_label: 'Contraseña',
    enter_dashboard: 'Entrar al panel',
    register_title: 'Configurar perfil de seguridad',
    register_sub: 'Ayude a los rescatistas a encontrarlo y asistirlo en una emergencia.',
    name_label: 'Nombre',
    language_label: 'Idioma preferido',
    create_profile: 'Crear perfil',
    auth_note: 'PreFlood es una ayuda de coordinación de emergencia. Priorice siempre las instrucciones oficiales locales.',
    app_tagline: 'SISTEMA DE ALERTA TEMPRANA Y SEGURIDAD',
    i_need_help: 'NECESITO AYUDA',
    online: '● En línea',
    offline: '● Sin conexión',
    log_out: 'Cerrar sesión',
    sidebar_monitoring: 'MONITOREO DE SEGURIDAD',
    overview_risk: 'Resumen y Riesgo',
    smart_shelters: 'Refugios Inteligentes',
    evacuation_plan: 'Plan de Evacuación',
    safety_profile: 'Perfil de Seguridad',
    responder_desk: 'Mesa de Rescate',
    admin_desk: 'Administración Gubernamental',
    sidebar_assistance: 'ASISTENCIA DE EMERGENCIA',
    sidebar_emergency_note: 'Si está en peligro inminente de vida, llame a los servicios de emergencia locales de inmediato.',
    offline_protocols: 'Protocolos de seguridad sin conexión →',
    live_safety_picture: 'IMAGEN DE SEGURIDAD EN VIVO',
    greeting_prefix: 'Gusto en verte,',
    greeting_sub: 'Señales de riesgo en tiempo real y acciones adaptadas a su región.',
    updating: 'Actualizando…',
    immediate_action: 'ACCIÓN DE EMERGENCIA INMEDIATA',
    immediate_rescue_q: '¿Necesita rescate o asistencia inmediata?',
    immediate_rescue_sub: 'Solicite asistencia prioritaria directamente con su ubicación GPS y número de personas.',
    request_rescue_sm: 'Solicitar rescate inmediato',
    emergency_warning: 'Advertencia de Emergencia',
    warning_sub: 'Protocolos y pautas',
    get_time: 'OBTENIR TIEMPO',
    get_time_sub: 'Límite de seguridad de 3 minutos',
    start_evacuation: 'INICIAR EVACUACIÓN',
    evacuation_sub: 'Encontrar refugio seguro',
    risk_eyebrow: 'SU ÁREA · SEÑAL DE RIESGO',
    risk_index: 'ÍNDICE DE RIESGO',
    weather_eyebrow: 'OBSERVACIÓN DE ESTACIÓN METEOROLÓGICA EN VIVO',
    weather_title: 'Lecturas de clima y lluvia',
    station_data: 'Datos de la estación',
    spatial_radar: 'RADAR DE SEGURIDAD ESPACIAL',
    shelters_map_title: 'Refugios cercanos y mapa de riesgo',
    live_map_view: 'Vista del mapa en vivo',
    nearest_facilities: 'INSTALACIONES MÁS CERCANAS',
    available_shelters: 'Refugios Disponibles',
    view_all_shelters: 'Ver todos los refugios →',
    accountability_status: 'RESPONSABILIDAD Y ESTADO',
    safe_prompt: 'Informe a los rescatistas que está a salvo.',
    safe_sub: 'Confirme su estado de seguridad o active el rescate si está atrapado.',
    i_am_safe: '✓ ESTOY A SALVO',
    shelter_network: 'RED DE REFUGIOS INTELIGENTES',
    choose_safe_place: 'Elija un lugar seguro.',
    shelters_sub: 'Disponibilidad y capacidad en tiempo real. Regístrese al llegar.',
    evacuation_lifecycle: 'CICLO DE EVACUACIÓN',
    move_clear_timeline: 'Muévase con un cronograma claro.',
    evacuation_sub: 'Siga pasos estructurados: limite de tiempo, refugio, ruta segura, confirmar.',
    step_1: 'Ventana de seguridad',
    step_2: 'Seleccionar refugio',
    step_3: 'Ruta segura',
    step_4: 'Confirmar seguridad',
    route_guidance: 'NAVEGACIÓN Y GUÍA DE RUTA',
    accountability_history: 'HISTORIAL DE RESPONSABILIDAD',
    your_checkin_history: 'Su historial de registros',
    no_checkins_yet: 'Aún no hay registros guardados.',
    profile_title: 'Configurar necesidades de asistencia.',
    profile_sub: 'Las preferencias ayudan a los rescatistas a entender el apoyo que su hogar requiere.',
    registered_address: 'Área de domicilio / Dirección registrada',
    use_gps_address: 'Usar GPS actual para el área registrada',
    gps_note: 'GPS solicitado solo al presionar el botón.',
    vulnerability_needs: 'Necesidades de accesibilidad y vulnerabilidad',
    save_profile: 'Guardar preferencias de seguridad',
    op_coordination: 'COORDINACIÓN OPERATIVA',
    responder_sub: 'Priorice la seguridad de vida, rastree rescates y monitoree refugios.',
    broadcast_alert: 'Transmitir Alerta de Emergencia',
    refresh_desk: 'Actualizar mesa',
    govt_infra: 'INFRAESTRUCTURA GUBERNAMENTAL',
    admin_sub: 'Visión general de emergencia, gestión de refugios y alertas.',
    issue_alert: 'Emitir Alerta de Emergencia',
    add_shelter: 'Agregar Nuevo Refugio',
    refresh_overview: 'Actualizar resumen',
    get_current_location: '📍 OBTENER UBICACIÓN ACTUAL',
    location_captured: '✓ Ubicación actual capturada',
    use_manual_location: 'Usar ubicación manual en su lugar',
    check_in_here: 'REGISTRARSE AQUÍ',
    undo_checkin: 'Deshacer Registro',
    select_shelter: 'Seleccionar refugio →',
    checked_in_at: '✓ Registrado en',
    total_people: 'Personas totales:',
    confirm_checkin: 'Confirmar Registro',
    cancel: 'Cancelar',
    requested: 'SOLICITADO',
    assigned: 'ASIGNADO',
    en_route: 'RESCATISTA EN CAMINO',
    resolved: 'RESUELTO',
    priority_rescue: 'RESCATE DE EMERGENCIA PRIORITARIO',
    rescue_sent: '🚨 Solicitud de rescate prioritaria enviada a los rescatistas.',
    offline_mode: '📶 MODO DE EMERGENCIA SIN CONEXIÓN',
    dispatch_sms: '📱 Enviar SMS de Emergencia de Respaldo',
    rainfall_1h: 'Lluvia (1h)',
    rainfall_24h: 'Lluvia (24h)',
    temperature: 'Temperatura',
    humidity: 'Humedad',
    pressure: 'Presión',
    wind_speed: 'Velocidad del viento',
    open_rescues: 'Rescates abiertos',
    evacuations: 'Evacuaciones',
    active_shelters: 'Refugios activos',
    people_checked_in: 'Personas registradas',
    total_shelters: 'Total de refugios',
    total_occupancy: 'Ocupación total',
    active_broadcasts: 'Emisiones activas',
    priority: 'Prioridad',
    requester: 'Solicitante',
    headcount: 'Personas',
    needs: 'Necesidades',
    location: 'Ubicación',
    status: 'Estado',
    urgent: 'URGENTE',
    standard: 'ESTÁNDAR',
    available: 'DISPONIBLE',
    full: 'COMPLETO',
    places_occupied: 'lugares ocupados',
    spaces_available: 'espacios disponibles',
    activate: 'Activar',
    deactivate: 'Desactivar',
    remove: 'Eliminar',
    check_out: 'Salida',
    phone_label: 'Teléfono de contacto',
    people_count_label: 'Personas que necesitan ayuda',
    situation_notes_label: 'Notas de situación',
    immediate_danger_label: 'Peligro inmediato de vida ahora',
    live_status: 'ESTADO EN VIVO',
    people_needing_help: 'Personas necesitadas',
    assistance_needs: 'Necesidades de asistencia',
    rescue_notified_note: 'Los rescatistas han sido notificados. Mantenga su línea abierta.',
    requests_needing_attention: 'Solicitudes que requieren atención',
    shelter_capacity_monitoring: 'Monitoreo de capacidad de refugios',
    shelters_control: 'Control de refugios inteligentes',
    no_available_shelter: 'No se encontró ningún refugio disponible cercano.',
    route_unavailable: 'El cálculo de ruta no está disponible temporalmente.',
    voice_nav: '🔊 Indicaciones por voz',
    voice_unavailable: 'Navegación por voz no disponible',
    voice_shelter_info: 'Navegando hacia {shelter}. Distancia: {distance}. Capacidad restante: {capacity} espacios.',
    voice_reroute: 'Alerta: {shelter} está lleno. Redirigiendo a {next_shelter}.',
    voice_group_split: 'Asignación de grupo: {count1} personas a {shelter1}, y {count2} personas a {shelter2}.',
    voice_arrival: 'Ha llegado a {shelter}. Por favor complete su registro.',
    voice_no_shelters: 'No se encontró ningún refugio activo con capacidad disponible cercano. Por favor solicite asistencia de emergencia.',
    nav_start: 'Diríjase hacia el refugio',
    nav_continue: 'Continúe recto por la ruta de evacuación',
    nav_turn: 'Gire hacia la entrada del refugio',
    nav_arrive: 'Ha llegado al refugio. Por favor regístrese.',
    distance: 'Distancia',
    est_time: 'Tiempo est.'
  },
  fr: {
    skip_to_content: 'Passer au contenu principal',
    hero_eyebrow: 'ALERTE PRÉCOCE D\'INONDATION ET COORDINATION DES SECOURS',
    hero_title: 'Savoir plus tôt.<br><em>Se déplacer en sécurité.</em>',
    hero_copy: 'Une plateforme technologique d\'urgence conçue pour des alertes rapides, des itinéraires sûrs et la coordination des secouristes.',
    hero_tagline: 'Prévoir. Avertir. Évacuer. Rester en sécurité.',
    hero_p1: '01 Signaux de risque en temps réel',
    hero_p2: '02 Abris Intelligents',
    hero_p3: '03 Escalade directe vers les secouristes',
    log_in: 'Connexion',
    create_account: 'Créer un compte',
    welcome_back: 'Bon retour',
    login_sub: 'Accédez à votre tableau de bord de sécurité.',
    continue_as: 'CONTINUER EN TANT QUE',
    role_user: 'UTILISATEUR PUBLIC',
    role_responder: 'ÉQUIPE DE SECOURISME',
    role_admin: 'GOUVERNEMENT / ADMIN',
    email_label: 'E-mail',
    password_label: 'Mot de passe',
    enter_dashboard: 'Accéder au tableau de bord',
    register_title: 'Configurer le profil de sécurité',
    register_sub: 'Aidez les secouristes à vous trouver et vous aider en cas d\'urgence.',
    name_label: 'Nom',
    language_label: 'Langue préférée',
    create_profile: 'Créer un profil',
    auth_note: 'PreFlood est une aide à la coordination des urgences. Priorisez toujours les instructions officielles locales.',
    app_tagline: 'SYSTÈME D\'ALERTE PRÉCOCE ET DE SÉCURITÉ',
    i_need_help: "J'AI BESOIN D'AIDE",
    online: '● En ligne',
    offline: '● Hors ligne',
    log_out: 'Déconnexion',
    sidebar_monitoring: 'SURVEILLANCE DE SÉCURITÉ',
    overview_risk: 'Aperçu et Risque',
    smart_shelters: 'Abris Intelligents',
    evacuation_plan: "Plan d'Évacuation",
    safety_profile: 'Profil de Sécurité',
    responder_desk: 'Poste de Secours',
    admin_desk: 'Gestion Gouvernementale',
    sidebar_assistance: 'ASSISTANCE D\'URGENCE',
    sidebar_emergency_note: 'Si vous êtes en danger immédiat, appelez immédiatement les services d\'urgence locaux.',
    offline_protocols: 'Protocoles de sécurité hors ligne →',
    live_safety_picture: 'SITUATION DE SÉCURITÉ EN DIRECT',
    greeting_prefix: 'Ravi de vous voir,',
    greeting_sub: 'Signaux de risque en temps réel et actions adaptées à votre région.',
    updating: 'Mise à jour…',
    immediate_action: 'ACTION D\'URGENCE IMMÉDIATE',
    immediate_rescue_q: 'Besoin d\'un sauvetage ou d\'une assistance immédiate?',
    immediate_rescue_sub: 'Demandez une assistance prioritaire avec votre position GPS et effectif.',
    request_rescue_sm: 'Demander un sauvetage immédiat',
    emergency_warning: "Avertissement d'Urgence",
    warning_sub: 'Protocole et directives',
    get_time: 'OBTENIR DU TEMPS',
    get_time_sub: 'Limite de sécurité de 3 minutes',
    start_evacuation: "COMMENCER L'ÉVACUATION",
    evacuation_sub: 'Trouver un abri sûr',
    risk_eyebrow: 'VOTRE ZONE · SIGNAL DE RISQUE',
    risk_index: 'INDICE DE RISQUE',
    weather_eyebrow: 'OBSERVATION MÉTÉO EN DIRECT',
    weather_title: 'Lectures météo et précipitations',
    station_data: 'Données de la station',
    spatial_radar: 'RADAR DE SÉCURITÉ SPATIAL',
    shelters_map_title: 'Abris proches et carte des risques',
    live_map_view: 'Vue carte en direct',
    nearest_facilities: 'INSTALLATIONS LES PLUS PROCHES',
    available_shelters: 'Abris Disponibles',
    view_all_shelters: 'Voir tous les abris →',
    accountability_status: 'RESPONSABILITÉ ET STATUT',
    safe_prompt: 'Informez les secouristes que vous êtes en sécurité.',
    safe_sub: 'Confirmez votre statut de sécurité ou déclenchez les secours.',
    i_am_safe: '✓ JE SUIS EN SÉCURITÉ',
    shelter_network: 'RÉSEAU D\'ABRIS INTELLIGENTS',
    choose_safe_place: 'Choisissez un endroit sûr.',
    shelters_sub: 'Disponibilité et capacité en temps réel. Enregistrez-vous à l\'arrivée.',
    evacuation_lifecycle: 'CYCLE D\'ÉVACUATION',
    move_clear_timeline: 'Déplacez-vous avec un calendrier clair.',
    evacuation_sub: 'Suivez des étapes structurées : délai, abri, itinéraire sûr, confirmer.',
    step_1: 'Fenêtre de sécurité',
    step_2: 'Sélectionner un abri',
    step_3: 'Itinéraire sûr',
    step_4: 'Confirmer sécurité',
    route_guidance: 'NAVIGATION ET ITINÉRAIRE',
    accountability_history: 'HISTORIQUE DE RESPONSABILITÉ',
    your_checkin_history: 'Votre historique d\'enregistrements',
    no_checkins_yet: 'Aucun enregistrement trouvé.',
    profile_title: 'Configurer les besoins d\'assistance.',
    profile_sub: 'Les préférences aident les secouristes à comprendre le soutien requis.',
    registered_address: 'Zone de domicile / Adresse enregistrée',
    use_gps_address: 'Utiliser le GPS actuel pour la zone',
    gps_note: 'GPS demandé uniquement lors du clic.',
    vulnerability_needs: 'Besoins d\'accessibilité et de vulnérabilité',
    save_profile: 'Enregistrer les préférences',
    op_coordination: 'COORDINATION OPÉRATIONNELLE',
    responder_sub: 'Priorisez la sécurité, suivez les secours et surveillez les abris.',
    broadcast_alert: 'Diffuser l\'Alerte d\'Urgence',
    refresh_desk: 'Actualiser le poste',
    govt_infra: 'INFRASTRUCTURE GOUVERNEMENTALE',
    admin_sub: 'Aperçu général des urgences, gestion des abris et alertes.',
    issue_alert: 'Émettre une Alerte d\'Urgence',
    add_shelter: 'Ajouter un Nouvel Abri',
    refresh_overview: 'Actualiser l\'aperçu',
    get_current_location: '📍 OBTENIR LA LOCALISATION ACTUELLE',
    location_captured: '✓ Localisation actuelle capturée',
    use_manual_location: 'Utiliser la localisation manuelle à la place',
    check_in_here: 'SE SIDER ICI',
    undo_checkin: 'Annuler le Sider',
    select_shelter: 'Sélectionner l\'abri →',
    checked_in_at: '✓ Enregistré à',
    total_people: 'Personnes totales:',
    confirm_checkin: 'Confirmer l\'Enregistrement',
    cancel: 'Annuler',
    requested: 'DEMANDÉ',
    assigned: 'ATTRIBUÉ',
    en_route: 'SECOURISTE EN ROUTE',
    resolved: 'RÉSOLU',
    priority_rescue: 'SAUVETAGE D\'URGENCE PRIORITAIRE',
    rescue_sent: '🚨 Demande de sauvetage prioritaire envoyée aux secouristes.',
    offline_mode: '📶 MODE D\'URGENCE HORS LIGNE',
    dispatch_sms: '📱 Envoyer SMS d\'Urgence de Secours',
    rainfall_1h: 'Précipitations (1h)',
    rainfall_24h: 'Précipitations (24h)',
    temperature: 'Température',
    humidity: 'Humidité',
    pressure: 'Pression',
    wind_speed: 'Vitesse du vent',
    open_rescues: 'Sauvetages ouverts',
    evacuations: 'Évacuations',
    active_shelters: 'Abris actifs',
    people_checked_in: 'Personnes enregistrées',
    total_shelters: 'Total des abris',
    total_occupancy: 'Occupation totale',
    active_broadcasts: 'Diffusions actives',
    priority: 'Priorité',
    requester: 'Demandeur',
    headcount: 'Effectif',
    needs: 'Besoins',
    location: 'Localisation',
    status: 'Statut',
    urgent: 'URGENT',
    standard: 'STANDARD',
    available: 'DISPONIBLE',
    full: 'PLEIN',
    places_occupied: 'places occupées',
    spaces_available: 'places disponibles',
    activate: 'Activer',
    deactivate: 'Désactiver',
    remove: 'Supprimer',
    check_out: 'Sortie',
    phone_label: 'Téléphone de contact',
    people_count_label: 'Personnes ayant besoin d\'aide',
    situation_notes_label: 'Notes de situation',
    immediate_danger_label: 'Danger de mort immédiat',
    live_status: 'STATUT EN DIRECT',
    people_needing_help: 'Personnes ayant besoin d\'aide',
    assistance_needs: 'Besoins d\'assistance',
    rescue_notified_note: 'Les secouristes ont été notifiés. Gardez votre ligne ouverte.',
    requests_needing_attention: 'Demandes nécessitant une attention',
    shelter_capacity_monitoring: 'Surveillance de la capacité des abris',
    shelters_control: 'Contrôle des abris intelligents',
    no_available_shelter: 'Aucun abri disponible trouvé à proximité.',
    route_unavailable: 'Le calcul d\'itinéraire est temporairement indisponible.',
    voice_nav: '🔊 Navigation vocale',
    voice_unavailable: 'Navigation vocale indisponible',
    voice_shelter_info: 'Navigation vers {shelter}. Distance : {distance}. Capacité restante : {capacity} places.',
    voice_reroute: 'Alerte : {shelter} est plein. Redirection vers {next_shelter}.',
    voice_group_split: 'Répartition du groupe : {count1} personnes vers {shelter1}, et {count2} personnes vers {shelter2}.',
    voice_arrival: 'Vous êtes arrivé à {shelter}. Veuillez effectuer votre enregistrement.',
    voice_no_shelters: 'Aucun abri actif avec une capacité disponible n\'a été trouvé à proximité. Veuillez demander une assistance d\'urgence.',
    nav_start: 'Dirigez-vous vers l\'abri',
    nav_continue: 'Continuez tout droit le long de l\'itinéraire',
    nav_turn: 'Tournez vers l\'entrée de l\'abri',
    nav_arrive: 'Vous êtes arrivé à l\'abri. Veuillez vous enregistrer.',
    distance: 'Distance',
    est_time: 'Temps est.'
  },
  ta: {
    skip_to_content: 'முதன்மை உள்ளடக்கத்திற்குச் செல்லவும்',
    hero_eyebrow: 'வெள்ளப் பெருக்கு எச்சரிக்கை + மீட்பு ஒருங்கிணைப்பு',
    hero_title: 'முன்னரே அறியவும்.<br><em>பாதுகாப்பாக நகரவும்.</em>',
    hero_copy: 'விரைவான எச்சரிக்கைகள், பாதுகாப்பான வெளியேற்ற பாதைகள் மற்றும் மீட்பாளர் ஒருங்கிணைப்பிற்காக வடிவமைக்கப்பட்ட தளம்.',
    hero_tagline: 'கணித்தல். எச்சரித்தல். வெளியேறுதல். பாதுகாப்பாக இருத்தல்.',
    hero_p1: '01 நிகழ்நேர அபாய சமிகஞைகள்',
    hero_p2: '02 ஸ்மார்ட் காப்பகங்கள்',
    hero_p3: '03 நேரடி மீட்பாளர் நடவடிக்கை',
    log_in: 'உள்நுழைக',
    create_account: 'கணக்கை உருவாக்கு',
    welcome_back: 'மீண்டும் வருக',
    login_sub: 'உங்கள் அவசர பாதுகாப்பு டாஷ்போர்டை அணுகவும்.',
    continue_as: 'இதாக தொடரவும்',
    role_user: 'பொதுப் பயனர்',
    role_responder: 'மீட்புக் குழு',
    role_admin: 'அரசு / நிர்வாகி',
    email_label: 'மின்னஞ்சல்',
    password_label: 'கடவுச்சொல்',
    enter_dashboard: 'டாஷ்போர்டில் நுழையவும்',
    register_title: 'பாதுகாப்பு சுயவிவரத்தை அமைக்கவும்',
    register_sub: 'அவசரகாலத்தில் மீட்பாளர்கள் உங்களைக் கண்டறிய உதவுங்கள்.',
    name_label: 'பெயர்',
    language_label: 'விருப்பமான மொழி',
    create_profile: 'சுயவிவரத்தை உருவாக்கு',
    auth_note: 'PreFlood ஒரு அவசர ஒருங்கிணைப்பு உதவி. எப்போதும் உள்ளூர் அதிகாரப்பூர்வ வழிமுறைகளுக்கு முன்னுரிமை அளிக்கவும்.',
    app_tagline: 'முன்னெச்சரிக்கை & பாதுகாப்பு அமைப்பு',
    i_need_help: 'எனக்கு உதவி தேவை',
    online: '● ஆன்லைன்',
    offline: '● ஆஃப்லைன்',
    log_out: 'வெளியேறு',
    sidebar_monitoring: 'பாதுகாப்பு கண்காணிப்பு',
    overview_risk: 'கண்ணோட்டம் & ஆபத்து',
    smart_shelters: 'ஸ்மார்ட் காப்பகங்கள்',
    evacuation_plan: 'வெளியேற்ற திட்டம்',
    safety_profile: 'பாதுகாப்பு சுயவிவரம்',
    responder_desk: 'மீட்பாளர் மையம்',
    admin_desk: 'அரசு நிர்வாகம்',
    sidebar_assistance: 'அவசர உதவி',
    sidebar_emergency_note: 'உடனடி ஆபத்து இருந்தால், உடனடியாக உள்ளூர் அவசர சேவைகளை அழைக்கவும்.',
    offline_protocols: 'ஆஃப்லைன் பாதுகாப்பு வழிமுறைகள் →',
    live_safety_picture: 'நேரலை பாதுகாப்பு படம்',
    greeting_prefix: 'உங்களைக் காண்பதில் மகிழ்ச்சி,',
    greeting_sub: 'உங்கள் பிராந்தியத்திற்கான நிகழ்நேர ஆபத்து சமிக்ஞைகள்.',
    updating: 'புதுப்பிக்கப்படுகிறது…',
    immediate_action: 'உடனடி அவசர நடவடிக்கை',
    immediate_rescue_q: 'உடனடி மீட்பு அல்லது உதவி தேவையா?',
    immediate_rescue_sub: 'உங்கள் எண்ணிக்கை மற்றும் ஜிபிஎஸ் இருப்பிடத்துடன் உதவி கோருங்கள்.',
    request_rescue_sm: 'உடனடி மீட்பைக் கோருங்கள்',
    emergency_warning: 'அவசர எச்சரிக்கை',
    warning_sub: 'வழிமுறைகள்',
    get_time: 'நேரம் பெறவும்',
    get_time_sub: '3-நிமிட பாதுகாப்பு கெடு',
    start_evacuation: 'வெளியேற்றத்தை தொடங்கு',
    evacuation_sub: 'பாதுகாப்பான காப்பகத்தைக் கண்டறியவும்',
    risk_eyebrow: 'உங்கள் பகுதி · ஆபத்து சமிக்ஞை',
    risk_index: 'ஆபத்து குறியீடு',
    weather_eyebrow: 'நேரலை வானிலை நிலைய அவதானிப்பு',
    weather_title: 'வானிலை மற்றும் மழைப்பொழிவு அளவீடுகள்',
    station_data: 'நிலைய தரவு',
    spatial_radar: 'பாதுகாப்பு ரேடார்',
    shelters_map_title: 'அருகிலுள்ள காப்பகங்கள் & வரைபடம்',
    live_map_view: 'நேரலை வரைபட பார்வை',
    nearest_facilities: 'அருகிலுள்ள வசதிகள்',
    available_shelters: 'கிடைக்கும் காப்பகங்கள்',
    view_all_shelters: 'அனைத்து காப்பகங்களையும் காண்க →',
    accountability_status: 'பொறுப்புக்கூறல் & நிலை',
    safe_prompt: 'நீங்கள் பாதுகாப்பாக உள்ளீர்கள் என்பதை தெரிவிக்கவும்.',
    safe_sub: 'உங்கள் நிலையை உறுதிப்படுத்தவும் அல்லது உதவி கோரவும்.',
    i_am_safe: '✓ நான் பாதுகாப்பாக உள்ளேன்',
    shelter_network: 'ஸ்மார்ட் காப்பக நெட்வொர்க்',
    choose_safe_place: 'பாதுகாப்பான இடத்தைத் தேர்ந்தெடுக்கவும்.',
    shelters_sub: 'நிகழ்நேர பயன்பாடு. வந்தவுடன் பதிவு செய்யவும்.',
    evacuation_lifecycle: 'வெளியேற்ற சுழற்சி',
    move_clear_timeline: 'தெளிவான காலவரிசையுடன் நகரவும்.',
    evacuation_sub: 'கட்டமைக்கப்பட்ட படிகளைப் பின்பற்றுங்கள்.',
    step_1: 'பாதுகாப்பு சாளரம்',
    step_2: 'காப்பகத்தைத் தேர்ச்சி செய்',
    step_3: 'பாதுகாப்பான பாதை',
    step_4: 'பாதுகாப்பை உறுதிசெய்',
    route_guidance: 'வழிசெலுத்தல் மற்றும் வழித்தடம்',
    accountability_history: 'பொறுப்புக்கூறல் வரலாறு',
    your_checkin_history: 'உங்கள் பதிவுகளின் வரலாறு',
    no_checkins_yet: 'பதிவுகள் எதுவும் இல்லை.',
    profile_title: 'உதவி தேவைகளை உள்ளமைக்கவும்.',
    profile_sub: 'விருப்பங்கள் மீட்பாளர்களுக்கு உங்கள் தேவைகளைப் புரியவைக்கின்றன.',
    registered_address: 'வீட்டுப் பகுதி / பதிவுசெய்யப்பட்ட முகவரி',
    use_gps_address: 'தற்போதைய ஜிபிஎஸ் பயன்படுத்தவும்',
    gps_note: 'ஜிபிஎஸ் பொத்தானை அழுத்தினால் மட்டுமே கோரப்படும்.',
    vulnerability_needs: 'அணுகல் மற்றும் பாதிப்பு தேவைகள்',
    save_profile: 'பாதுகாப்பு விருப்பங்களைச் சேமிக்கவும்',
    op_coordination: 'செயல்பாட்டு ஒருங்கிணைப்பு',
    responder_sub: 'உயிர் பாதுகாப்பிற்கு முன்னுரிமை அளிக்கவும்.',
    broadcast_alert: 'அவசர எச்சரிக்கையை ஒளிபரப்பு',
    refresh_desk: 'புதுப்பிக்கவும்',
    govt_infra: 'அரசு உள்கட்டமைப்பு',
    admin_sub: 'அவசரகாலக் மேலாண்மை மற்றும் விழிப்பூட்டல்.',
    issue_alert: 'அவசர எச்சரிக்கையை வெளியிடு',
    add_shelter: 'புதிய காப்பகத்தை சேர்',
    refresh_overview: 'புதுப்பிக்கவும்',
    get_current_location: '📍 தற்போதைய இருப்பிடத்தைப் பெறவும்',
    location_captured: '✓ தற்போதைய இருப்பிடம் பதிவு செய்யப்பட்டது',
    use_manual_location: 'கைமுறை இருப்பிடத்தைப் பயன்படுத்தவும்',
    check_in_here: 'இங்கு பதிவு செய்க',
    undo_checkin: 'பதிவை ரத்துசெய்',
    select_shelter: 'காப்பகத்தைத் தேர்ந்தெடுக்கவும் →',
    checked_in_at: '✓ பதிவு செய்யப்பட்ட இடம்',
    total_people: 'மொத்த நபர்கள்:',
    confirm_checkin: 'பதிவை உறுதிப்படுத்து',
    cancel: 'ரத்துசெய்',
    requested: 'கோரப்பட்டது',
    assigned: 'ஒதுக்கப்பட்டது',
    en_route: 'மீட்பாளர் வழியில் உள்ளார்',
    resolved: 'தீர்வு செய்யப்பட்டது',
    priority_rescue: 'முன்னுரிமை அவசர மீட்பு',
    rescue_sent: '🚨 முன்னுரிமை மீட்பு கோரிக்கை அனுப்பப்பட்டது.',
    offline_mode: '📶 ஆஃப்லைன் அவசர முறை',
    dispatch_sms: '📱 அவசர SMS அனுப்பவும்',
    rainfall_1h: 'மழைப்பொழிவு (1h)',
    rainfall_24h: 'மழைப்பொழிவு (24h)',
    temperature: 'வெப்பநிலை',
    humidity: 'ஈரப்பதம்',
    pressure: 'அழுத்தம்',
    wind_speed: 'காற்றின் வேகம்',
    open_rescues: 'திறந்த மீட்புகள்',
    evacuations: 'வெளியேற்றங்கள்',
    active_shelters: 'செயல்பாட்டு காப்பகங்கள்',
    people_checked_in: 'பதிவு செய்த நபர்கள்',
    total_shelters: 'மொத்த காப்பகங்கள்',
    total_occupancy: 'மொத்த சேர்க்கை',
    active_broadcasts: 'செயலில் உள்ள ஒளிபரப்புகள்',
    priority: 'முன்னுரிமை',
    requester: 'கோருபவர்',
    headcount: 'எண்ணிக்கை',
    needs: 'தேவைகள்',
    location: 'இருப்பிடம்',
    status: 'நிலை',
    urgent: 'அவசரம்',
    standard: 'சாதாரண',
    available: 'கிடைக்கிறது',
    full: 'நிரம்பியது',
    places_occupied: 'இடங்கள் நிரம்பியுள்ளன',
    spaces_available: 'இடங்கள் உள்ளன',
    activate: 'செயல்படுத்து',
    deactivate: 'செயலிழக்கச்செய்',
    remove: 'நீக்கு',
    check_out: 'வெளியேறு',
    phone_label: 'தொடர்பு தொலைபேசி',
    people_count_label: 'உதவி தேவைப்படும் நபர்கள்',
    situation_notes_label: 'சூழ்நிலை குறிப்புகள்',
    immediate_danger_label: 'உடனடி ஆபத்து',
    live_status: 'நேரலை நிலை',
    people_needing_help: 'உதவி தேவைப்படும் நபர்கள்',
    assistance_needs: 'உதவி தேவைகள்',
    rescue_notified_note: 'மீட்பாளர்களுக்கு அறிவிக்கப்பட்டுள்ளது. உங்கள் இணைப்பை திறந்த நிலையில் வைக்கவும்.',
    requests_needing_attention: 'கவனம் தேவைப்படும் கோரிக்கைகள்',
    shelter_capacity_monitoring: 'காப்பக திறன் கண்காணிப்பு',
    shelters_control: 'ஸ்மார்ட் காப்பகங்களின் கட்டுப்பாடு',
    no_available_shelter: 'அருகில் கிடைக்கும் காப்பகம் எதுவும் காணப்படவில்லை.',
    route_unavailable: 'பாதை கணக்கீடு தற்காலிகமாக கிடைக்கவில்லை.',
    voice_nav: '🔊 குரல் வழிகாட்டுதல்',
    voice_unavailable: 'குரல் வழிகாட்டுதல் வசதி இல்லை',
    voice_shelter_info: '{shelter} நோக்கி வழிகாட்டப்படுகிறது. தூரம்: {distance}. மீதமுள்ள இடம்: {capacity}.',
    voice_reroute: 'எச்சரிக்கை: {shelter} நிரம்பியுள்ளது. {next_shelter} காப்பகத்திற்கு மாற்றுப் பாதை கணக்கிடப்படுகிறது.',
    voice_group_split: 'குழுப் பிரிவு: {count1} நபர்கள் {shelter1} காப்பகத்திற்கும், {count2} நபர்கள் {shelter2} காப்பகத்திற்கும் ஒதுக்கப்பட்டுள்ளனர்.',
    voice_arrival: 'நீங்கள் {shelter} காப்பகத்தை அடைந்துவிட்டீர்கள். தயவுசெய்து பதிவு செய்யவும்.',
    voice_no_shelters: 'அருகில் காலியிடம் உள்ள காப்பகங்கள் எதுவும் இல்லை. தயவுசெய்து அவசர உதவி கோரவும்.',
    nav_start: 'காப்பகத்தை நோக்கி செல்லவும்',
    nav_continue: 'வெளியேற்ற பாதையில் நேராக செல்லவும்',
    nav_turn: 'காப்பக நுழைவாயிலை நோக்கி திரும்பவும்',
    nav_arrive: 'நீங்கள் காப்பகத்தை அடைந்துவிட்டீர்கள். தயவுசெய்து பதிவு செய்யவும்.',
    distance: 'தூரம்',
    est_time: 'மதிப்பிடப்பட்ட நேரம்'
  },
  hi: {
    skip_to_content: 'मुख्य सामग्री पर जाएं',
    hero_eyebrow: 'बाढ़ प्रारंभिक चेतावनी + बचाव समन्वय',
    hero_title: 'पहले जानें।<br><em>सुरक्षित आगे बढ़ें।</em>',
    hero_copy: 'तेज चेतावनी, सुरक्षित निकासी मार्ग और बचाव समन्वय के लिए डिज़ाइन किया गया एक आपातकालीन-तकनीक मंच।',
    hero_tagline: 'पूर्वानुमान। चेतावनी। निकासी। सुरक्षित रहें।',
    hero_p1: '01 वास्तविक समय जोखिम संकेत',
    hero_p2: '02 स्मार्ट आश्रय',
    hero_p3: '03 सीधा बचाव दल को संदेश',
    log_in: 'लॉग इन',
    create_account: 'खाता बनाएं',
    welcome_back: 'वापसी पर स्वागत है',
    login_sub: 'अपने आपातकालीन सुरक्षा डैशबोर्ड तक पहुंचें।',
    continue_as: 'इस रूप में जारी रखें',
    role_user: 'सार्वजनिक उपयोगकर्ता',
    role_responder: 'बचाव दल',
    role_admin: 'सरकार / प्रशासक',
    email_label: 'ईमेल',
    password_label: 'पासवर्ड',
    enter_dashboard: 'डैशबोर्ड में प्रवेश करें',
    register_title: 'सुरक्षा प्रोफ़ाइल सेट करें',
    register_sub: 'आपात स्थिति में बचाव दल को आपको खोजने में मदद करें।',
    name_label: 'नाम',
    language_label: 'पसंदीदा भाषा',
    create_profile: 'प्रोफ़ाइल बनाएं',
    auth_note: 'PreFlood एक आपातकालीन समन्वय सहायता है। हमेशा स्थानीय आधिकारिक निर्देशों को प्राथमिकता दें।',
    app_tagline: 'प्रारंभिक चेतावनी और सुरक्षा प्रणाली',
    i_need_help: 'मुझे मदद चाहिए',
    online: '● ऑनलाइन',
    offline: '● ऑफ़लाइन',
    log_out: 'लॉग आउट',
    sidebar_monitoring: 'सुरक्षा निगरानी',
    overview_risk: 'अवलोकन और जोखिम',
    smart_shelters: 'स्मार्ट आश्रय',
    evacuation_plan: 'निकासी योजना',
    safety_profile: 'सुरक्षा प्रोफ़ाइल',
    responder_desk: 'बचाव संचालन डेस्क',
    admin_desk: 'सरकारी प्रशासन डेस्क',
    sidebar_assistance: 'आपातकालीन सहायता',
    sidebar_emergency_note: 'यदि आप तत्काल खतरे में हैं, तो तुरंत स्थानीय आपातकालीन सेवाओं को कॉल करें।',
    offline_protocols: 'ऑफ़लाइन सुरक्षा प्रोटोकॉल →',
    live_safety_picture: 'लाइव सुरक्षा तस्वीर',
    greeting_prefix: 'आपको देखकर खुशी हुई,',
    greeting_sub: 'आपके क्षेत्र के लिए वास्तविक समय जोखिम संकेत।',
    updating: 'अद्यतन हो रहा है…',
    immediate_action: 'तत्काल आपातकालीन कार्रवाई',
    immediate_rescue_q: 'क्या आपको तत्काल बचाव या सहायता की आवश्यकता है?',
    immediate_rescue_sub: 'अपनी संख्या और जीपीएस स्थान के साथ सहायता का अनुरोध करें।',
    request_rescue_sm: 'तत्काल बचाव का अनुरोध करें',
    emergency_warning: 'आपातकालीन चेतावनी',
    warning_sub: 'प्रोटोकॉल और दिशानिर्देश',
    get_time: 'समय प्राप्त करें',
    get_time_sub: '3 मिनट की सुरक्षा सीमा',
    start_evacuation: 'निकासी शुरू करें',
    evacuation_sub: 'सुरक्षित आश्रय खोजें',
    risk_eyebrow: 'आपका क्षेत्र · जोखिम संकेत',
    risk_index: 'जोखिम सूचकांक',
    weather_eyebrow: 'लाइव मौसम स्टेशन अवलोकन',
    weather_title: 'मौसम और वर्षा की रीडिंग',
    station_data: 'स्टेशन डेटा',
    spatial_radar: 'अंतरिक्ष सुरक्षा रडार',
    shelters_map_title: 'पास के आश्रय और जोखिम मानचित्र',
    live_map_view: 'लाइव मानचित्र दृश्य',
    nearest_facilities: 'निकटतम सुविधाएं',
    available_shelters: 'उपलब्ध आश्रय',
    view_all_shelters: 'सभी आश्रय देखें →',
    accountability_status: 'जवाबदेही और स्थिति',
    safe_prompt: 'बचाव दल को सूचित करें कि आप सुरक्षित हैं।',
    safe_sub: 'अपनी सुरक्षा स्थिति की पुष्टि करें या बचाव का अनुरोध करें।',
    i_am_safe: '✓ मैं सुरक्षित हूँ',
    shelter_network: 'स्मार्ट आश्रय नेटवर्क',
    choose_safe_place: 'एक सुरक्षित स्थान चुनें।',
    shelters_sub: 'वास्तविक समय उपलब्धता। आने पर चेक-इन करें।',
    evacuation_lifecycle: 'निकासी जीवन चक्र',
    move_clear_timeline: 'एक स्पष्ट समय सीमा के साथ आगे बढ़ें।',
    evacuation_sub: 'संरचित चरणों का पालन करें।',
    step_1: 'सुरक्षा विंडो',
    step_2: 'आश्रय चुनें',
    step_3: 'सुरक्षित मार्ग',
    step_4: 'सुरक्षा की पुष्टि करें',
    route_guidance: 'नेविगेशन और मार्ग मार्गदर्शन',
    accountability_history: 'जवाबदेही इतिहास',
    your_checkin_history: 'आपका चेक-इन इतिहास',
    no_checkins_yet: 'अभी तक कोई चेक-इन दर्ज नहीं हुआ है।',
    profile_title: 'सहायता आवश्यकताओं को कॉन्फ़िगर करें।',
    profile_sub: 'प्राथमिकताएं बचाव दल को आपकी आवश्यकताओं को समझने में मदद करती हैं।',
    registered_address: 'गृह क्षेत्र / पंजीकृत पता',
    use_gps_address: 'वर्तमान जीपीएस का प्रयोग करें',
    gps_note: 'जीपीएस केवल बटन दबाने पर माँगा जाता है।',
    vulnerability_needs: 'सुलभता और संवेदनशीलता की आवश्यकताएं',
    save_profile: 'सुरक्षा प्राथमिकताएं सहेजें',
    op_coordination: 'परिचालन समन्वय',
    responder_sub: 'जीवन सुरक्षा को प्राथमिकता दें, बचाव को ट्रैक करें।',
    broadcast_alert: 'आपातकालीन चेतावनी प्रसारित करें',
    refresh_desk: 'रिफ्रेश करें',
    govt_infra: 'सरकारी बुनियादी ढांचा',
    admin_sub: 'पूर्ण आपातकालीन अवलोकन, आश्रय प्रबंधन और चेतावनी।',
    issue_alert: 'आपातकालीन चेतावनी जारी करें',
    add_shelter: 'नया आश्रय जोड़ें',
    refresh_overview: 'रिफ्रेश करें',
    get_current_location: '📍 वर्तमान स्थान प्राप्त करें',
    location_captured: '✓ वर्तमान स्थान दर्ज किया गया',
    use_manual_location: 'इसके बजाय मैन्युअल स्थान का उपयोग करें',
    check_in_here: 'यहाँ चेक-इन करें',
    undo_checkin: 'चेक-इन पूर्ववत करें',
    select_shelter: 'आश्रय चुनें →',
    checked_in_at: '✓ चेक-इन किया गया',
    total_people: 'कुल लोग:',
    confirm_checkin: 'चेक-इन की पुष्टि करें',
    cancel: 'रद्द करें',
    requested: 'अनुरोधित',
    assigned: 'आवंटित',
    en_route: 'बचाव दल रास्ते में है',
    resolved: 'हल किया गया',
    priority_rescue: 'प्राथमिकता आपातकालीन बचाव',
    rescue_sent: '🚨 प्राथमिकता बचाव अनुरोध भेजा गया।',
    offline_mode: '📶 ऑफ़लाइन आपातकालीन मोड',
    dispatch_sms: '📱 आपातकालीन एसएमएस भेजें',
    rainfall_1h: 'वर्षा (1h)',
    rainfall_24h: 'वर्षा (24h)',
    temperature: 'तापमान',
    humidity: 'आर्द्रता',
    pressure: 'दबाव',
    wind_speed: 'हवा की गति',
    open_rescues: 'खुले बचाव',
    evacuations: 'निकासी',
    active_shelters: 'सक्रिय आश्रय',
    people_checked_in: 'चेक-इन किए गए लोग',
    total_shelters: 'कुल आश्रय',
    total_occupancy: 'कुल अधिभोग',
    active_broadcasts: 'सक्रिय प्रसारण',
    priority: 'प्राथमिकता',
    requester: 'अनुरोधकर्ता',
    headcount: 'संख्या',
    needs: 'आवश्यकताएं',
    location: 'स्थान',
    status: 'स्थिति',
    urgent: 'अति आवश्यक',
    standard: 'सामान्य',
    available: 'उपलब्ध',
    full: 'पूर्ण',
    places_occupied: 'स्थान भरे हुए',
    spaces_available: 'स्थान उपलब्ध हैं',
    activate: 'सक्रिय करें',
    deactivate: 'निष्क्रिय करें',
    remove: 'हटाएं',
    check_out: 'चेक आउट',
    phone_label: 'संपर्क फोन',
    people_count_label: 'सहायता की आवश्यकता वाले लोग',
    situation_notes_label: 'स्थिति संबंधी नोट्स',
    immediate_danger_label: 'अभी तत्काल जीवन का खतरा',
    live_status: 'लाइव स्थिति',
    people_needing_help: 'सहायता की आवश्यकता वाले लोग',
    assistance_needs: 'सहायता आवश्यकताएं',
    rescue_notified_note: 'बचाव दल को सूचित कर दिया गया है। अपनी लाइन खुली रखें।',
    requests_needing_attention: 'ध्यान देने योग्य अनुरोध',
    shelter_capacity_monitoring: 'आश्रय क्षमता निगरानी',
    shelters_control: 'स्मार्ट आश्रय नियंत्रण',
    no_available_shelter: 'पास में कोई उपलब्ध आश्रय नहीं मिला।',
    route_unavailable: 'मार्ग की गणना अस्थायी रूप से अनुपलब्ध है।',
    voice_nav: '🔊 आवाज से दिशा-निर्देश',
    voice_unavailable: 'आवाज नेविगेशन अनुपलब्ध है',
    voice_shelter_info: '{shelter} की ओर मार्गदर्शन किया जा रहा है। दूरी: {distance}। शेष क्षमता: {capacity} स्थान।',
    voice_reroute: 'चेतावनी: {shelter} अब फुल हो गया है। {next_shelter} की ओर नया रास्ता बनाया जा रहा है।',
    voice_group_split: 'समूह आवंटन: {count1} लोग {shelter1} और {count2} लोग {shelter2} के लिए दिए गए हैं।',
    voice_arrival: 'आप {shelter} पहुँच गए हैं। कृपया अपना चेक-इन पूरा करें।',
    voice_no_shelters: 'पास में कोई उपलब्ध आश्रय नहीं मिला। कृपया आपातकालीन सहायता का अनुरोध करें।',
    nav_start: 'आश्रय की ओर बढ़ें',
    nav_continue: 'निकासी मार्ग पर सीधे आगे बढ़ते रहें',
    nav_turn: 'आश्रय के प्रवेश द्वार की ओर मुड़ें',
    nav_arrive: 'आप आश्रय पर पहुंच गए हैं। कृपया चेक-इन करें।',
    distance: 'दूरी',
    est_time: 'अनुमानित समय'
  }
};

function t(key) {
  const dict = i18n[state.lang] || i18n.en;
  return dict[key] || i18n.en[key] || key;
}

function setLanguage(lang) {
  if (!i18n[lang]) return;
  state.lang = lang;
  localStorage.setItem('preflood_lang', lang);
  const globalSelect = $('#global-lang-select');
  if (globalSelect) globalSelect.value = lang;
  translateUI();
}

function translateUI() {
  const dict = i18n[state.lang] || i18n.en;
  
  // 1. Translate all static elements tagged with data-i18n
  $$('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (dict[key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = dict[key];
      } else if (dict[key].includes('<')) {
        el.innerHTML = dict[key];
      } else {
        el.textContent = dict[key];
      }
    }
  });

  // 2. Dynamic topbar elements
  if ($('#logout-button')) $('#logout-button').textContent = dict.log_out;
  setNetworkStatus();
  
  // 3. Dynamic help & safe buttons
  if ($('#header-help-button')) $('#header-help-button').innerHTML = `<span class="pulse-dot"></span> ${dict.i_need_help}`;
  if ($('#hero-help-button')) {
    $('#hero-help-button').innerHTML = `<span class="btn-icon">🚨</span> <strong>${dict.i_need_help}</strong> <small>${dict.request_rescue_sm}</small>`;
  }
  if ($('#help-button')) $('#help-button').textContent = `🚨 ${dict.i_need_help}`;
  if ($('#safe-button')) $('#safe-button').textContent = dict.i_am_safe;

  // 4. Role Badges
  if (state.user) {
    const role = state.user.role || 'user';
    const roleBadge = $('#role-badge');
    if (roleBadge) {
      roleBadge.textContent = role === 'admin' ? dict.role_admin : role === 'responder' ? dict.role_responder : dict.role_user;
    }
  }

  // 5. Re-render dynamic sections with the selected language
  renderWeatherGrid();
  renderShelters();
  renderEvacuation();
  renderCheckinHistory();
  renderMyRescueStatus();

  const currentRole = state.user?.role;
  if (currentRole === 'admin' && !$('#section-admin').classList.contains('hidden')) {
    loadAdmin();
  } else if (['admin', 'responder'].includes(currentRole) && !$('#section-responder').classList.contains('hidden')) {
    loadResponder();
  }
}

function notify(message, isError = false) {
  const toast = $('#toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = `toast show${isError ? ' error' : ''}`;
  window.clearTimeout(notify.timer);
  notify.timer = window.setTimeout(() => { toast.className = 'toast'; }, 4500);
}

async function api(path, options = {}) {
  try {
    const response = await fetch(`/api${path}`, { credentials: 'same-origin', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
    return data;
  } catch (error) {
    if (!navigator.onLine || error instanceof TypeError) {
      state.offline = true;
      setNetworkStatus();
      saveEmergencyCache();
    }
    throw error;
  }
}

function setNetworkStatus() {
  const status = $('#network-status');
  if (!status) return;
  const dict = i18n[state.lang] || i18n.en;
  status.textContent = state.offline ? dict.offline : dict.online;
  status.className = `network ${state.offline ? 'offline' : 'online'}`;
}

function showAuthMessage(message = '') {
  const el = $('#auth-message');
  if (el) el.textContent = message;
}

function formPayload(form) { return Object.fromEntries(new FormData(form).entries()); }

function switchAuth(tab) {
  $$('.tab').forEach((item) => item.classList.toggle('active', item.dataset.authTab === tab));
  $('#login-form').classList.toggle('hidden', tab !== 'login');
  $('#register-form').classList.toggle('hidden', tab !== 'register');
  showAuthMessage();
}

function setView(loggedIn) {
  $('#auth-view').classList.toggle('hidden', loggedIn);
  $('#app-view').classList.toggle('hidden', !loggedIn);
  
  if (loggedIn && state.user) {
    const role = state.user.role || 'user';
    
    $('#user-name').textContent = state.user.name;
    const namePart = state.user.name ? state.user.name.split(' ')[0] : 'friend';
    if ($('#heading-name')) $('#heading-name').textContent = namePart;

    $('#responder-nav')?.classList.toggle('hidden', !['admin', 'responder'].includes(role));
    $('#admin-nav')?.classList.toggle('hidden', role !== 'admin');

    fillProfile();
    translateUI();

    if (role === 'admin') {
      showSection('admin');
    } else if (role === 'responder') {
      showSection('responder');
    } else {
      showSection('overview');
    }
  }
}

async function submitAuth(event, mode) {
  event.preventDefault();
  const form = event.currentTarget;
  const button = $('button[type="submit"]', form);
  button.disabled = true;
  showAuthMessage('Connecting…');

  try {
    const data = await api(`/auth/${mode}`, {
      method: 'POST',
      body: JSON.stringify(formPayload(form))
    });

    // Clear previous account data before switching users.
    stopUserRescuePolling();
    state.myRescues = [];
    state.checkins = [];
    state.user = data.user;

    localStorage.removeItem('preflood_active_user_rescue');

    if (state.user.language) {
      setLanguage(state.user.language);
    }

    setView(true);
    renderMyRescueStatus();
    await loadDashboard();
  } catch (error) {
    showAuthMessage(error.message);
  } finally {
    button.disabled = false;
  }
}

async function boot() {
  setNetworkStatus();
  
  $$('#login-role-selector .role-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      $$('#login-role-selector .role-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedRole = btn.dataset.role;
    });
  });

  const globalLangSelect = $('#global-lang-select');
  if (globalLangSelect) {
    globalLangSelect.value = state.lang;
    globalLangSelect.addEventListener('change', (e) => {
      setLanguage(e.target.value);
      if (state.user) {
        api('/profile', { method: 'PATCH', body: JSON.stringify({ language: e.target.value }) }).catch(() => {});
      }
    });
  }

  $$('.tab').forEach((tab) => tab.addEventListener('click', () => switchAuth(tab.dataset.authTab)));
  $('#login-form').addEventListener('submit', (event) => submitAuth(event, 'login'));
  $('#register-form').addEventListener('submit', (event) => submitAuth(event, 'register'));
  

$('#logout-button').addEventListener('click', async () => {
  await api('/auth/logout', { method: 'POST' }).catch(() => {});

  stopUserRescuePolling();

  if (typeof stopResponderLocationTracking === 'function') {
    stopResponderLocationTracking();
  }

  state.user = null;
  state.myRescues = [];
  state.checkins = [];

  localStorage.removeItem('preflood_active_user_rescue');

  renderMyRescueStatus();
  setView(false);
});

  $$('.nav-item').forEach((item) => item.addEventListener('click', () => showSection(item.dataset.section)));
  $$('[data-section-link]').forEach((item) => item.addEventListener('click', () => showSection(item.dataset.sectionLink)));
  
  $('#hero-help-button')?.addEventListener('click', showRescueModal);
  $('#header-help-button')?.addEventListener('click', showRescueModal);
  $('#help-button')?.addEventListener('click', showRescueModal);

  $('#warning-button')?.addEventListener('click', showEmergencyWarning);
  $('#time-button')?.addEventListener('click', getTime);
  $('#evacuate-button')?.addEventListener('click', startEvacuation);
  $('#safe-button')?.addEventListener('click', markSafe);
  $('#set-home-location')?.addEventListener('click', setHomeLocation);
  $('#offline-info')?.addEventListener('click', () => { window.location.href = '/offline.html'; });

  $('#refresh-responder')?.addEventListener('click', loadResponder);
  $('#refresh-admin')?.addEventListener('click', loadAdmin);
  $('#create-alert-btn')?.addEventListener('click', showCreateAlertModal);
  $('#admin-create-alert-btn')?.addEventListener('click', showCreateAlertModal);
  $('#add-shelter-btn')?.addEventListener('click', showAddShelterModal);
  
  $('#profile-form')?.addEventListener('submit', saveProfile);
  $$('.modal-close').forEach((button) => button.addEventListener('click', () => $('#modal').close()));
  
  window.addEventListener('online', () => {
    state.offline = false;
    setNetworkStatus();
    syncPendingRescues();
    loadDashboard();
  });
  window.addEventListener('offline', () => {
    state.offline = true;
    setNetworkStatus();
  });
  
  const cached = localStorage.getItem('preflood_emergency_cache');
  if (cached && !navigator.onLine) notify('Showing cached emergency information.');

  translateUI();

  try {
    const data = await api('/auth/me');
    if (data.user) {
      state.user = data.user;
      setView(true);
      await loadDashboard();
    }
  } catch (error) {
    if (!navigator.onLine) state.offline = true;
  }

  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/service-worker.js').catch(() => {});
}


async function loadDashboard() {
  // Clear stale rescue data before loading the current user's data.
  if (!['admin', 'responder'].includes(state.user?.role)) {
    state.myRescues = [];
    localStorage.removeItem('preflood_active_user_rescue');
    renderMyRescueStatus();
  }

  try {
    const [risk, shelterData, alerts, evacuations, checkins] =
      await Promise.all([
        api('/risk/current'),
        api('/shelters'),
        api('/alerts'),
        api('/evacuations'),
        api('/checkins')
      ]);

    state.risk = risk.risk;
    state.shelters = shelterData.shelters;
    state.checkins = checkins.checkins;
    state.evacuation = evacuations.evacuations[0] || null;
    state.offline = false;

    if (['admin', 'responder'].includes(state.user?.role)) {
      try {
        const rescueData = await api('/rescue');
        state.myRescues = rescueData.requests || [];
      } catch (err) {
        state.myRescues = [];
      }
    } else {
      // Load only the signed-in user's active rescue request.
      try {
        const rescueData = await api('/rescue/my-active');
        state.myRescues = rescueData.request
          ? [rescueData.request]
          : [];

        if (rescueData.request) {
          localStorage.setItem(
            'preflood_active_user_rescue',
            JSON.stringify(rescueData.request)
          );
        } else {
          localStorage.removeItem('preflood_active_user_rescue');
        }
      } catch (err) {
        state.myRescues = [];
        localStorage.removeItem('preflood_active_user_rescue');
      }
    }

    renderRisk();
    renderWeatherGrid();
    renderAlerts(alerts.alerts);
    renderShelters();
    renderEvacuation();
    renderCheckinHistory();
    renderMyRescueStatus();
    initOverviewMap();

    const updateTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    if ($('#last-updated')) {
      $('#last-updated').textContent =
        `${t('updating')} ${updateTime}`;
    }

    saveEmergencyCache();

    const currentRole = state.user?.role;

    if (
      currentRole === 'admin' &&
      !$('#section-admin').classList.contains('hidden')
    ) {
      loadAdmin();
    } else if (
      ['admin', 'responder'].includes(currentRole) &&
      !$('#section-responder').classList.contains('hidden')
    ) {
      loadResponder();
    }
  } catch (error) {
    const cached = JSON.parse(
      localStorage.getItem('preflood_emergency_cache') || '{}'
    );

    if (cached.risk) {
      state.risk = cached.risk;
      state.shelters = cached.shelters || [];
      renderRisk();
      renderWeatherGrid();
      renderShelters();
      initOverviewMap();
    }

    if (error.message !== 'Authentication required') {
      notify(
        'Some live data is unavailable. Cached safety information is shown.',
        true
      );
    }
  }

  setNetworkStatus();
}

function saveEmergencyCache() {
  localStorage.setItem('preflood_emergency_cache', JSON.stringify({ risk: state.risk, shelters: state.shelters, savedAt: Date.now() }));
  const request = indexedDB.open('preflood-cache', 1);
  request.onupgradeneeded = () => request.result.createObjectStore('emergency', { keyPath: 'key' });
  request.onsuccess = () => {
    const tx = request.result.transaction('emergency', 'readwrite');
    tx.objectStore('emergency').put({ key: 'latest', risk: state.risk, shelters: state.shelters, savedAt: Date.now() });
  };
}

function renderRisk() {
  const risk = state.risk || { level: 'INSUFFICIENT DATA', score: null, factors: [], disclaimer: '' };
  $('#risk-level').textContent = risk.level;
  $('#risk-score').textContent = risk.score == null ? '—' : risk.score;
  const observedAt = risk.observation?.observation_timestamp;
  const sourceLine = observedAt ? ` Latest station observation: ${new Date(observedAt).toLocaleString()}.` : '';
  $('#risk-copy').textContent = `${risk.disclaimer || 'Follow official local instructions and use this prototype as a coordination aid.'}${sourceLine}`;
  const fill = Math.min(100, Math.max(4, Number(risk.score || 0)));
  $('#risk-bar-fill').style.width = `${fill}%`;
  $('#risk-bar-fill').style.background = risk.level === 'CRITICAL' || risk.level === 'HIGH' ? 'var(--crimson-alert)' : 'var(--amber-warning)';
  const factorChips = (risk.factors || []).map((factor) => `<span class="factor">${esc(factor.label)} · ${esc(factor.detail)}</span>`);
  const contextChips = (risk.context || []).slice(0, 3).map((factor) => `<span class="factor">${esc(factor.label)} · ${esc(factor.value)}</span>`);
  $('#risk-factors').innerHTML = factorChips.concat(contextChips).join('');
}

function renderWeatherGrid() {
  const obs = state.risk?.observation || {};
  const context = state.risk?.context || [];
  const grid = $('#weather-grid');
  if (!grid) return;

  const rain1h = context.find(c => c.field === 'rainfall_1h')?.value || '0 native';
  const rain24h = context.find(c => c.field === 'rainfall_24h')?.value || '78.8 native';
  const temp = context.find(c => c.field === 'temperature')?.value || 'N/A';
  const humidity = context.find(c => c.field === 'humidity')?.value || 'N/A';
  const pressure = context.find(c => c.field === 'pressure')?.value || 'N/A';
  const wind = context.find(c => c.field === 'wind_speed')?.value || 'N/A';

  grid.innerHTML = `
    <div class="weather-card">
      <div class="weather-lbl">${t('rainfall_1h')}</div>
      <div class="weather-val">${esc(rain1h)}</div>
    </div>
    <div class="weather-card">
      <div class="weather-lbl">${t('rainfall_24h')}</div>
      <div class="weather-val">${esc(rain24h)}</div>
    </div>
    <div class="weather-card">
      <div class="weather-lbl">${t('temperature')}</div>
      <div class="weather-val">${esc(temp)}</div>
    </div>
    <div class="weather-card">
      <div class="weather-lbl">${t('humidity')}</div>
      <div class="weather-val">${esc(humidity)}</div>
    </div>
    <div class="weather-card">
      <div class="weather-lbl">${t('pressure')}</div>
      <div class="weather-val">${esc(pressure)}</div>
    </div>
    <div class="weather-card">
      <div class="weather-lbl">${t('wind_speed')}</div>
      <div class="weather-val">${esc(wind)}</div>
    </div>
  `;

  if (obs.observation_timestamp && $('#weather-timestamp-badge')) {
    $('#weather-timestamp-badge').textContent = `${t('station_data')}: ${new Date(obs.observation_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }
}

function renderAlerts(alerts) {
  const strip = $('#alert-strip');
  if (!strip) return;
  if (!alerts.length) { strip.classList.add('hidden'); return; }
  const alert = alerts[0];
  strip.classList.remove('hidden');
  strip.innerHTML = `<strong>${esc(alert.title)} · ${esc(alert.severity)}</strong> ${esc(alert.message)} <span style="display:block;margin-top:.2rem;font-size:.78rem;opacity:.8;">Target Area: ${esc(alert.area)}</span>`;
}

function capacityLabel(shelter) {
  const available = Math.max(0, shelter.capacity - shelter.occupancy);
  return available ? `${available} ${t('spaces_available')}` : t('full');
}

function shelterRow(shelter) {
  const isCheckedIn = state.checkins.some(c => c.shelter_id === shelter.id && !c.undone_at);
  return `<div class="shelter-row">
    <div>
      <div class="shelter-name">${esc(shelter.name)} ${isCheckedIn ? `<span class="tag" style="background:var(--emerald-bg);color:var(--emerald-safe);">${t('checked_in_at')}</span>` : ''}</div>
      <div class="shelter-address">${esc(shelter.address)} · ${(shelter.accessibility || []).length} access features</div>
    </div>
    <div class="capacity ${shelter.capacity <= shelter.occupancy ? 'full' : ''}">${capacityLabel(shelter)}</div>
  </div>`;
}

function renderShelters() {
  if ($('#shelter-preview')) {
    $('#shelter-preview').innerHTML = state.shelters.slice(0, 3).map(shelterRow).join('') || '<p class="muted">No shelter data currently available.</p>';
  }
  
  if ($('#shelter-list')) {
    $('#shelter-list').innerHTML = state.shelters.map((shelter) => {
      const isCheckedIn = state.checkins.some(c => c.shelter_id === shelter.id && !c.undone_at);
      const userCheckin = state.checkins.find(c => c.shelter_id === shelter.id && !c.undone_at);
      return `<article class="shelter-card">
        <div>
          <p class="eyebrow">${shelter.capacity > shelter.occupancy ? t('available') : t('full')}</p>
          <h3>${esc(shelter.name)}</h3>
          <p class="muted">${esc(shelter.address)}<br>${shelter.occupancy} of ${shelter.capacity} ${t('places_occupied')}</p>
          <div>${(shelter.accessibility || []).map((item) => `<span class="tag">${esc(item)}</span>`).join('')}</div>
        </div>
        <div>
          ${isCheckedIn ? `
            <div style="background:var(--emerald-bg);border:1px solid var(--emerald-safe);border-radius:.6rem;padding:.6rem;text-align:center;color:var(--emerald-safe);font-weight:800;font-size:.82rem;margin-top:.8rem;">
              ${t('checked_in_at')} ${esc(shelter.name)}
            </div>
            <button class="button outline undo-shelter-checkin" data-checkin-id="${userCheckin.id}" style="margin-top:.5rem;">${t('undo_checkin')}</button>
          ` : `
            <button class="button outline shelter-select" data-shelter-id="${shelter.id}" ${shelter.capacity <= shelter.occupancy ? 'disabled' : ''}>${t('select_shelter')}</button>
            <button class="button safe shelter-checkin" data-shelter-id="${shelter.id}" ${shelter.capacity <= shelter.occupancy ? 'disabled' : ''}>${t('check_in_here')}</button>
          `}
        </div>
      </article>`;
    }).join('') || `<p class="muted">${t('no_available_shelter')}</p>`;

    $$('.shelter-select').forEach((button) => button.addEventListener('click', () => chooseShelter(Number(button.dataset.shelterId))));
    $$('.shelter-checkin').forEach((button) => button.addEventListener('click', () => showCheckinDialog(Number(button.dataset.shelterId))));
    $$('.undo-shelter-checkin').forEach((button) => button.addEventListener('click', () => undoCheckinPrompt(Number(button.dataset.checkinId))));
  }
}

function showSection(name) {
  $$('.page-section').forEach((section) => section.classList.toggle('hidden', section.id !== `section-${name}`));
  $$('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.section === name));
  
  if (name === 'responder') loadResponder();
  if (name === 'admin') loadAdmin();
  if (name === 'overview') setTimeout(initOverviewMap, 100);
  if (name === 'evacuation' && state.evacuation?.shelter_id) {
    const shelter = state.shelters.find(s => s.id === state.evacuation.shelter_id);
    if (shelter) showRoute(shelter);
  }
}

function showEmergencyWarning() {
  openModal(`<div class="modal-inner">
    <p class="eyebrow-bright">${t('emergency_warning').toUpperCase()}</p>
    <h2>Move to higher ground immediately.</h2>
    <p>Move uphill or to a higher floor. Do not walk, swim, or drive through moving water. Keep identification, water, medication, and a charged phone with you if safe to do so.</p>
    <p>Follow official local alerts. If you are in immediate danger, call local emergency services immediately.</p>
    <div class="modal-actions">
      <button class="button primary" data-close-modal>Understood</button>
      <button class="button outline" data-start-from-modal>${t('start_evacuation')}</button>
    </div>
  </div>`);
  $('[data-close-modal]').addEventListener('click', () => $('#modal').close());
  $('[data-start-from-modal]').addEventListener('click', () => { $('#modal').close(); startEvacuation(); });
}

async function getTime() {
  if (!state.user) return;
  const location = await getLocation();
  try {
    const data = await api('/evacuations', { method: 'POST', body: JSON.stringify(location || {}) });
    state.evacuation = data.evacuation;
    renderEvacuation();
    showSection('evacuation');
    notify('Your 3-minute safety deadline timer has started.');
  } catch (error) { notify(error.message, true); }
}

async function startEvacuation() {
  const location = await getLocation();
  try {
    const data = await api('/evacuations', { method: 'POST', body: JSON.stringify(location || {}) });
    state.evacuation = data.evacuation;
    renderEvacuation();
    showSection('evacuation');
    notify('Evacuation started. Select an available shelter below.');
  } catch (error) { notify(error.message, true); }
}

function getLocation() {
  return new Promise((resolve) => {
    const existing = (state.coords && state.coords.lat && state.coords.lng) ? state.coords :
                     (state.evacuation && state.evacuation.lat && state.evacuation.lng) ? { lat: state.evacuation.lat, lng: state.evacuation.lng } :
                     (state.user && state.user.home_lat && state.user.home_lng) ? { lat: state.user.home_lat, lng: state.user.home_lng } : null;

    if (!navigator.geolocation) {
      if (!existing) notify('GPS is not supported by this browser.', true);
      resolve(existing);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = { lat: position.coords.latitude, lng: position.coords.longitude, timestamp: new Date().toISOString() };
        state.coords = coords;
        // POST the GPS location to the backend (non-blocking, silent on error)
        api('/location', { method: 'POST', body: JSON.stringify({ lat: coords.lat, lng: coords.lng }) }).catch(() => {});
        resolve(coords);
      },
      (err) => {
        const msgs = {
          1: 'GPS permission was denied. Please allow location access.',
          2: 'GPS position is unavailable. Check your device location settings.',
          3: 'GPS request timed out. Signal may be weak.',
        };
        if (!existing) notify(msgs[err?.code] || 'GPS permission was not granted or signal timed out.', true);
        resolve(existing);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  });
}

function renderEvacuation() {
  const panel = $('#evacuation-status');
  if (!panel) return;
  const step1 = $('#step-1'); const step2 = $('#step-2'); const step3 = $('#step-3'); const step4 = $('#step-4');
  
  if (!state.evacuation) {
    panel.innerHTML = '<h3>No Active Evacuation</h3><p>When you need to move, tap GET TIME or START EVACUATION to initiate your safety window.</p>';
    $('#route-panel')?.classList.add('hidden');
    step1?.classList.remove('active'); step2?.classList.remove('active'); step3?.classList.remove('active'); step4?.classList.remove('active');
    return;
  }

  const evacuation = state.evacuation;
  const deadline = new Date(evacuation.safe_deadline);
  const seconds = Math.max(0, Math.round((deadline - Date.now()) / 1000));
  const mins = Math.floor(seconds / 60); const secs = String(seconds % 60).padStart(2, '0');
  
  step1?.classList.add('active');
  if (evacuation.shelter_id) step2?.classList.add('active');
  if (evacuation.status === 'started') step3?.classList.add('active');
  if (evacuation.status === 'safe') step4?.classList.add('active');

  const statusText = evacuation.status === 'escalated' ? 'Rescue Escalation Active' : evacuation.status === 'safe' ? 'Marked Safe ✓' : seconds ? `${mins}:${secs} Remaining in Safety Window` : 'Safety Deadline Window Ended';
  panel.innerHTML = `<p class="eyebrow">EVACUATION ${esc(evacuation.status.toUpperCase())}</p><h3>${esc(statusText)}</h3><p>${evacuation.status === 'escalated' ? 'A priority responder request was automatically created because I AM SAFE was not confirmed.' : 'Select a shelter, follow route guidance, and confirm I AM SAFE upon arrival.'}</p>`;

  if (evacuation.status === 'started' && seconds > 0) {
    window.clearTimeout(renderEvacuation.timer);
    renderEvacuation.timer = window.setTimeout(renderEvacuation, 1000);
  }
}

async function chooseShelter(shelterId) {
  let evacuation = state.evacuation;
  if (!evacuation || evacuation.status !== 'started') {
    await startEvacuation();
    evacuation = state.evacuation;
  }
  if (!evacuation) return;
  try {
    const data = await api(`/evacuations/${evacuation.id}/shelter`, { method: 'POST', body: JSON.stringify({ shelter_id: shelterId }) });
    state.evacuation.shelter_id = shelterId;
    showSection('evacuation');
    await showRoute(data.shelter);
  } catch (error) { notify(error.message, true); }
}

function formatVoiceText(key, vars = {}) {
  let template = t(key) || key;
  for (const [k, v] of Object.entries(vars)) {
    template = template.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
  }
  return template;
}

function speakRouteInstruction(text) {
  if (!('speechSynthesis' in window)) {
    notify(t('voice_unavailable'), true);
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const locales = { en: 'en-US', es: 'es-ES', fr: 'fr-FR', ta: 'ta-IN', hi: 'hi-IN' };
  utterance.lang = locales[state.lang] || 'en-US';
  window.speechSynthesis.speak(utterance);
}

async function showRoute(shelter) {
  const panel = $('#route-panel');
  const details = $('#route-details');
  const title = $('#route-shelter-title');
  if (!panel || !details) return;

  if (title) title.textContent = `${t('route_guidance')}: ${shelter.name}`;

  const location = await getLocation();
  if (!location) {
    panel.classList.remove('hidden');
    details.innerHTML = `
      <p class="muted"><strong>${esc(shelter.name)}</strong> — ${esc(shelter.address)}</p>
      <div style="background:rgba(239,68,68,0.1);border:1px solid var(--crimson-alert);border-radius:.6rem;padding:.8rem;margin-top:.6rem;">
        <p style="color:var(--crimson-alert);font-weight:700;margin:0 0 .2rem 0;">⚠️ ${t('route_unavailable')}</p>
        <p style="font-size:.82rem;margin:0;color:var(--text-dim);">Unable to access user coordinates for route calculation.</p>
      </div>
      <button class="button safe wide" id="route-checkin-btn" style="margin-top:.8rem;">${t('check_in_here')}</button>
    `;
    $('#route-checkin-btn')?.addEventListener('click', () => showCheckinDialog(shelter.id));
    return;
  }

  try {
    const data = await api(`/route?from_lat=${location.lat}&from_lng=${location.lng}&shelter_id=${shelter.id}`);
    panel.classList.remove('hidden');

    const activeShelter = data.shelter || shelter;
    const isRerouted = data.rerouted;

    const stepsList = (data.steps || []).map((s, idx) => `
      <div style="display:flex;align-items:center;gap:.6rem;padding:.4rem 0;border-bottom:1px solid rgba(255,255,255,0.06);">
        <span style="background:var(--cyan-accent);color:#090d16;width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-weight:700;font-size:.75rem;">${idx + 1}</span>
        <span style="font-size:.85rem;">${ t(s.key)}</span>
      </div>
    `).join('');

    const voiceSummary = formatVoiceText('voice_shelter_info', {
      shelter: activeShelter.name,
      distance: data.distance_text || `${data.distance_km} km`,
      capacity: Math.max(0, activeShelter.capacity - activeShelter.occupancy)
    });

    const rerouteNotice = isRerouted ? formatVoiceText('voice_reroute', { shelter: shelter.name, next_shelter: activeShelter.name }) : '';
    const fullSpeechText = [rerouteNotice, voiceSummary, (data.steps || []).map(s => t(s.key)).join('. ')].filter(Boolean).join('. ');

    if (isRerouted) {
      notify(`⚠️ ${shelter.name} is full. Rerouted to ${activeShelter.name}.`, true);
      speakRouteInstruction(rerouteNotice);
    }

    details.innerHTML = `
      ${isRerouted ? `
        <div style="background:rgba(245,158,11,0.15);border:1px solid var(--amber-warning);border-radius:.6rem;padding:.75rem;margin-bottom:.8rem;color:var(--amber-warning);font-size:.84rem;">
          <strong>⚠️ Rerouted:</strong> ${esc(shelter.name)} is full or unavailable. Directions updated for <strong>${esc(activeShelter.name)}</strong>.
        </div>
      ` : ''}
      <div style="display:flex;justify-content:space-between;align-items:center;background:rgba(6,182,212,0.1);padding:.6rem .8rem;border-radius:.6rem;margin-bottom:.8rem;">
        <span><strong>${t('distance')}:</strong> ${esc(data.distance_text || (data.distance_km + ' km'))}</span>
        <span><strong>${t('est_time')}:</strong> ${esc(data.duration_text || (data.duration_min + ' mins'))}</span>
      </div>
      <div style="margin-bottom:.8rem;">
        <h4 style="font-size:.85rem;color:var(--cyan-accent);margin-bottom:.4rem;text-transform:uppercase;">Turn-by-Turn Navigation (${esc(activeShelter.name)})</h4>
        ${stepsList}
      </div>
      <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.8rem;">
        <button id="speak-route-btn" class="button outline compact" style="display:inline-flex;align-items:center;gap:.3rem;">${t('voice_nav')}</button>
        <a class="button outline compact" target="_blank" rel="noreferrer" href="${esc(data.map_url)}">Open Map Directions →</a>
        <button class="button safe wide" id="route-checkin-btn" style="margin-top:.4rem;">${t('check_in_here')}</button>
      </div>
    `;

    $('#speak-route-btn')?.addEventListener('click', () => speakRouteInstruction(fullSpeechText));
    $('#route-checkin-btn')?.addEventListener('click', () => showCheckinDialog(activeShelter.id));
    initRouteMap(location.lat, location.lng, activeShelter.lat, activeShelter.lng, data.geometry_coords);
  } catch (error) {
    panel.classList.remove('hidden');
    details.innerHTML = `
      <p class="muted"><strong>${esc(shelter.name)}</strong> — ${esc(shelter.address)}</p>
      <div style="background:rgba(239,68,68,0.1);border:1px solid var(--crimson-alert);border-radius:.6rem;padding:.8rem;margin-top:.6rem;">
        <p style="color:var(--crimson-alert);font-weight:700;margin:0 0 .2rem 0;">⚠️ ${t('route_unavailable')}</p>
        <p style="font-size:.82rem;margin:0;color:var(--text-dim);">${esc(error.message || 'Unable to compute route to shelter.')}</p>
      </div>
      <button class="button safe wide" id="route-checkin-btn" style="margin-top:.8rem;">${t('check_in_here')}</button>
    `;
    $('#route-checkin-btn')?.addEventListener('click', () => showCheckinDialog(shelter.id));
    notify(error.message, true);
  }
}

async function markSafe() {
  if (!state.evacuation) { notify('Start an evacuation first so responders know what to close.', true); return; }
  try {
    await api(`/evacuations/${state.evacuation.id}/safe`, { method: 'POST' });
    state.evacuation.status = 'safe';
    renderEvacuation();
    notify('I AM SAFE status recorded. Thank you.');
  } catch (error) { notify(error.message, true); }
}

function openModal(content) {
  const modal = $('#modal');
  $('#modal-content').innerHTML = content;
  if (typeof modal.showModal === 'function') modal.showModal();
  else modal.setAttribute('open', '');
}

/* SHELTER CHECK-IN CONFIRMATION DIALOG FLOW */
function showCheckinDialog(shelterId) {
  const shelter = state.shelters.find(s => s.id === shelterId);
  if (!shelter) return;
  let companions = 0;

  openModal(`
    <div class="modal-inner">
      <p class="eyebrow">SHELTER ACCOUNTABILITY</p>
      <h2>Check in at ${esc(shelter.name)}?</h2>
      <p>How many people are with you?</p>
      
      <div class="stepper-wrap">
        <button id="stepper-dec" class="stepper-btn" type="button">−</button>
        <span id="stepper-val" class="stepper-val">0</span>
        <button id="stepper-inc" class="stepper-btn" type="button">+</button>
      </div>
      
      <div class="total-people-badge">${t('total_people')} <span id="stepper-total">1</span></div>
      
      <div class="modal-actions" style="margin-top: 1.5rem;">
        <button type="button" class="button outline" data-close-modal>${t('cancel')}</button>
        <button type="button" id="confirm-checkin-btn" class="button primary">${t('confirm_checkin')}</button>
      </div>
    </div>
  `);

  $('[data-close-modal]').addEventListener('click', () => $('#modal').close());

  const updateCounts = () => {
    $('#stepper-val').textContent = companions;
    $('#stepper-total').textContent = companions + 1;
  };

  $('#stepper-dec').addEventListener('click', () => {
    if (companions > 0) { companions--; updateCounts(); }
  });

  $('#stepper-inc').addEventListener('click', () => {
    if (companions < 100) { companions++; updateCounts(); }
  });

  $('#confirm-checkin-btn').addEventListener('click', async () => {
    try {
      await api('/checkins', { method: 'POST', body: JSON.stringify({ shelter_id: shelterId, people_with_user: companions, approximate: true }) });
      $('#modal').close();
      notify(`✓ Checked in at ${shelter.name}`);
      speakRouteInstruction(formatVoiceText('voice_arrival', { shelter: shelter.name }));
      await loadDashboard();
    } catch (error) {
      if (error.message.includes('capacity') || error.message.includes('full')) {
        $('#modal').close();
        notify(`⚠️ ${shelter.name} does not have enough remaining capacity for your group. Re-checking active shelter allocation...`, true);
        const location = await getLocation();
        if (location) {
          try {
            const alloc = await api('/shelters/allocate', { method: 'POST', body: JSON.stringify({ lat: location.lat, lng: location.lng, headcount: companions + 1 }) });
            if (alloc.allocations && alloc.allocations.length > 0) {
              const primaryShelter = alloc.allocations[0].shelter;
              notify(`Rerouting to ${primaryShelter.name} (${alloc.allocations[0].allocated_count} seats reserved).`);
              speakRouteInstruction(formatVoiceText('voice_reroute', { shelter: shelter.name, next_shelter: primaryShelter.name }));
              await showRoute(primaryShelter);
              return;
            }
          } catch (allocErr) {}
        }
        notify(t('voice_no_shelters'), true);
        speakRouteInstruction(t('voice_no_shelters'));
      } else {
        notify(error.message, true);
      }
    }
  });
}

/* UNDO CHECK-IN CONFIRMATION DIALOG */
function undoCheckinPrompt(checkinId) {
  const checkin = state.checkins.find(c => c.id === checkinId);
  openModal(`
    <div class="modal-inner">
      <p class="eyebrow-bright">${t('undo_checkin').toUpperCase()}</p>
      <h2>${t('undo_checkin_title')}</h2>
      <p>${t('undo_checkin_sub')} ${checkin ? `at ${esc(checkin.shelter_name)}` : ''}?</p>
      <div class="modal-actions">
        <button type="button" class="button outline" data-close-modal>${t('cancel')}</button>
        <button type="button" id="confirm-undo-btn" class="button help-pulse-btn">${t('confirm_undo')}</button>
      </div>
    </div>
  `);

  $('[data-close-modal]').addEventListener('click', () => $('#modal').close());
  $('#confirm-undo-btn').addEventListener('click', async () => {
    try {
      await api(`/checkins/${checkinId}/undo`, { method: 'POST' });
      $('#modal').close();
      notify('Check-in undone.');
      await loadDashboard();
    } catch (error) { notify(error.message, true); }
  });
}

/* REFINED I NEED HELP MODAL (GET CURRENT LOCATION BUTTON & MANUAL FALLBACK) */
function showRescueModal() {
  const needs = ['wheelchair', 'visually impaired', 'elderly', 'child', 'deaf / hearing impaired', 'other'];
  openModal(`
    <div class="modal-inner">
      <p class="eyebrow-bright">${t('priority_rescue')}</p>
      <h2>${t('i_need_help')}</h2>
      <p>Request priority emergency rescue. Click below to capture your device GPS location.</p>
      
      <div style="margin: 1.2rem 0; text-align: center;">
        <button type="button" id="btn-get-gps" class="button primary wide" style="font-size: .95rem; gap: .5rem;">
          ${t('get_current_location')}
        </button>
      </div>

      <div id="modal-gps-status" class="gps-status-banner hidden"></div>

      <div style="text-align: right; margin-top: .4rem;">
        <button type="button" id="btn-manual-loc-fallback" class="text-button" style="font-size: .78rem; opacity: .85;">
          ${t('use_manual_location')}
        </button>
      </div>

      <form id="rescue-form" class="modal-form" style="margin-top: .6rem;">
        <div id="manual-location-container" class="hidden" style="margin-bottom: .8rem;">
          <label>Landmark / Address (Manual Fallback)<input name="address" placeholder="e.g. 2nd Floor, Red Brick House"></label>
        </div>

        <div class="form-grid">
          <label>${t('name_label')}<input name="name" value="${esc(state.user?.name || '')}" required></label>
          <label>${t('phone_label')}<input name="phone" inputmode="tel" required placeholder="Best phone number"></label>
        </div>
        <div style="margin-top: 1rem;">
          <label>${t('people_count_label')}<input name="people_count" type="number" min="1" max="1000" value="1" required></label>
        </div>
        <fieldset style="border:1px solid var(--border-line);border-radius:.8rem;padding:1rem;margin:1rem 0;background:#0b1322;">
          <legend style="color:var(--cyan-primary);font-weight:800;font-size:.78rem;padding:0 .4rem;">${t('assistance_needs').toUpperCase()}</legend>
          <div class="check-grid">${needs.map((need) => `<label class="check-option"><input type="checkbox" name="accessibility" value="${need}">${need}</label>`).join('')}</div>
        </fieldset>
        <label>${t('situation_notes_label')}<textarea name="notes" placeholder="Water height, trapped area, children, pets, or medical details"></textarea></label>
        <label class="check-option" style="margin-top:1rem;"><input type="checkbox" name="emergency" checked> ${t('immediate_danger_label')}</label>
        
        <div id="sms-fallback-box" class="sms-fallback-box hidden"></div>

        <div class="modal-actions" style="margin-top:1.2rem;">
          <button type="button" class="button outline" data-close-modal>${t('cancel')}</button>
          <button type="submit" id="send-rescue-btn" class="button help-pulse-btn">Send Rescue Request</button>
        </div>
      </form>
    </div>
  `);

  $('[data-close-modal]').addEventListener('click', () => $('#modal').close());
  
  $('#btn-get-gps').addEventListener('click', async () => {
    const statusEl = $('#modal-gps-status');
    const form = $('#rescue-form');
    statusEl.classList.remove('hidden');
    statusEl.className = 'gps-status-banner';
    statusEl.innerHTML = `<span class="pulse-dot"></span> Requesting device GPS coordinates…`;
    
    const coords = await getLocation();
    if (coords) {
      statusEl.className = 'gps-status-banner success';
      statusEl.innerHTML = `<strong>${t('location_captured')}</strong><br><small>Lat: ${coords.lat.toFixed(5)}, Lng: ${coords.lng.toFixed(5)} (${new Date(coords.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})</small>`;
      if (form) {
        form.dataset.lat = coords.lat;
        form.dataset.lng = coords.lng;
        form.dataset.timestamp = coords.timestamp;
      }
    } else {
      statusEl.className = 'gps-status-banner error';
      statusEl.innerHTML = `⚠️ GPS unavailable. Click "${t('use_manual_location')}" below.`;
      $('#manual-location-container').classList.remove('hidden');
    }
  });

  $('#btn-manual-loc-fallback').addEventListener('click', () => {
    const manualWrap = $('#manual-location-container');
    manualWrap.classList.toggle('hidden');
  });

  $('#rescue-form').addEventListener('submit', submitRescue);
}

async function submitRescue(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const btn = $('#send-rescue-btn');
  btn.disabled = true;
  btn.textContent = 'Transmitting…';

  const payload = formPayload(form);
  payload.people_count = Number(payload.people_count);
  payload.emergency = form.emergency.checked;
  payload.accessibility = $$('input[name="accessibility"]:checked', form).map((input) => input.value);
  payload.timestamp = form.dataset.timestamp || new Date().toISOString();

  if (form.dataset.lat && form.dataset.lng) {
    payload.lat = Number(form.dataset.lat);
    payload.lng = Number(form.dataset.lng);
  }

  if (!navigator.onLine) {
    saveOfflineRescue(payload);
    btn.disabled = false;
    btn.textContent = 'Send Rescue Request';
    return;
  }

  try {
    const res = await api('/rescue', { method: 'POST', body: JSON.stringify(payload) });
    $('#modal').close();
    notify(t('rescue_sent'));
    
    const rescueRecord = res.request || {
      id: Math.floor(1000 + Math.random() * 9000),
      name: payload.name,
      people_count: payload.people_count,
      accessibility: payload.accessibility,
      lat: payload.lat,
      lng: payload.lng,
      address: payload.address,
      status: 'open',
      created_at: payload.timestamp
    };
    saveActiveRescue(rescueRecord);
    await loadDashboard();
  } catch (error) {
    if (!navigator.onLine || error.message.includes('fetch')) {
      saveOfflineRescue(payload);
    } else {
      notify(error.message, true);
    }
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send Rescue Request';
  }
}

function saveOfflineRescue(payload) {
  const pending = JSON.parse(localStorage.getItem('preflood_pending_rescues') || '[]');
  const rescueRecord = {
    id: 'OFFLINE-' + Math.floor(1000 + Math.random() * 9000),
    name: payload.name,
    phone: payload.phone,
    people_count: payload.people_count,
    accessibility: payload.accessibility,
    lat: payload.lat,
    lng: payload.lng,
    address: payload.address,
    notes: payload.notes,
    emergency: payload.emergency,
    status: 'open',
    created_at: payload.timestamp || new Date().toISOString()
  };
  
  pending.push(rescueRecord);
  localStorage.setItem('preflood_pending_rescues', JSON.stringify(pending));
  saveActiveRescue(rescueRecord);

  const locStr = payload.lat && payload.lng ? `GPS: ${payload.lat.toFixed(4)},${payload.lng.toFixed(4)}` : payload.address ? `Address: ${payload.address}` : 'Location unknown';
  const needsStr = (payload.accessibility || []).join(', ') || 'None';
  const smsBody = `PreFlood EMERGENCY REQUEST\nID: ${rescueRecord.id}\nName: ${payload.name} (${payload.phone})\nPeople: ${payload.people_count}\nNeeds: ${needsStr}\n${locStr}\nTime: ${new Date().toLocaleTimeString()}`;
  const smsUrl = `sms:?body=${encodeURIComponent(smsBody)}`;

  const smsBox = $('#sms-fallback-box');
  if (smsBox) {
    smsBox.classList.remove('hidden');
    smsBox.innerHTML = `
      <div style="background:var(--card-navy);border:1px solid var(--amber-warning);border-radius:.8rem;padding:.9rem;margin-top:.8rem;">
        <p style="color:var(--amber-warning);font-weight:800;font-size:.84rem;margin-bottom:.4rem;">${t('offline_mode')}</p>
        <p style="font-size:.8rem;color:var(--text-dim);margin-bottom:.8rem;">Your request is saved locally. Send emergency SMS below:</p>
        <a href="${smsUrl}" class="button help-pulse-btn" style="display:inline-flex;align-items:center;gap:.4rem;text-decoration:none;font-size:.84rem;width:100%;justify-content:center;">
          ${t('dispatch_sms')}
        </a>
      </div>
    `;
  }
  
  notify('Offline mode: Emergency request saved locally.', false);
  renderMyRescueStatus();
}

function saveActiveRescue(record) {
  localStorage.setItem('preflood_active_user_rescue', JSON.stringify(record));
  state.myRescues = [record];
  renderMyRescueStatus();
}

function loadLocalRescues() {
  const stored = localStorage.getItem('preflood_active_user_rescue');
  if (stored) {
    try { state.myRescues = [JSON.parse(stored)]; } catch (e) {}
  }
}

function syncPendingRescues() {
  const pending = JSON.parse(localStorage.getItem('preflood_pending_rescues') || '[]');
  if (!pending.length) return;
  
  Promise.all(pending.map(req => api('/rescue', { method: 'POST', body: JSON.stringify(req) }).catch(() => null)))
    .then(() => {
      localStorage.removeItem('preflood_pending_rescues');
      notify('✓ Offline rescue requests successfully synced with emergency responders.');
      loadDashboard();
    });
}

function renderMyRescueStatus() {
  const container = $('#my-rescue-status-container');
  if (!container) return;

  const rescue = state.myRescues[0];
  if (!rescue || rescue.status === 'resolved' || rescue.status === 'cancelled') {
    container.classList.add('hidden');
    container.innerHTML = '';
    stopUserRescuePolling();
    return;
  }

  container.classList.remove('hidden');

  const status = rescue.status || 'open';
  const isRequested = status === 'open';
  const isAssigned = status === 'assigned';
  const isResolved = status === 'resolved';

  const locDisplay = rescue.lat && rescue.lng ? `GPS: ${Number(rescue.lat).toFixed(4)}, ${Number(rescue.lng).toFixed(4)}` : rescue.address || 'Captured';
  const responderLocDisplay = (rescue.responder_lat && rescue.responder_lng)
    ? `GPS: ${Number(rescue.responder_lat).toFixed(4)}, ${Number(rescue.responder_lng).toFixed(4)}`
    : 'Temporarily unavailable';

  container.innerHTML = `
    <div class="rescue-status-card">
      <div class="rescue-card-header">
        <div>
          <span class="rescue-tag">${t('priority_rescue')}</span>
          <h3>Request ID: PF-${rescue.id}</h3>
        </div>
        <div class="rescue-live-indicator"><span class="pulse-dot"></span> ${t('live_status')}</div>
      </div>
      
      <div class="rescue-details-grid">
        <div class="rescue-detail-item">
          <span class="detail-label">${t('location_captured')}</span>
          <span class="detail-val">✓ ${esc(locDisplay)}</span>
        </div>
        <div class="rescue-detail-item">
          <span class="detail-label">${t('people_needing_help')}</span>
          <span class="detail-val">${rescue.people_count}</span>
        </div>
        <div class="rescue-detail-item">
          <span class="detail-label">${t('assistance_needs')}</span>
          <span class="detail-val">${esc((rescue.accessibility || []).join(', ') || 'Standard assistance')}</span>
        </div>
      </div>

      ${isAssigned ? `
        <div style="background:rgba(6,182,212,0.12);border:1px solid var(--cyan-accent);border-radius:.6rem;padding:.75rem;margin-top:.75rem;">
          <p style="color:var(--cyan-accent);font-weight:700;margin:0 0 .2rem 0;font-size:.9rem;">✓ Request Accepted</p>
          <p style="margin:0;font-size:.85rem;color:var(--text-light);"><strong>${esc(rescue.responder_name || 'Responder')}</strong> is on the way.</p>
          <p style="margin:.3rem 0 0 0;font-size:.8rem;color:var(--text-dim);">
            <strong>Responder Location:</strong> ${esc(responderLocDisplay)}
          </p>
        </div>
      ` : ''}

      <div class="rescue-status-stepper">
        <div class="status-step ${isRequested || isAssigned || isResolved ? 'completed' : ''}">
          <div class="step-icon">1</div>
          <div class="step-label">${t('requested')}</div>
        </div>
        <div class="step-line ${isAssigned || isResolved ? 'completed' : ''}"></div>
        <div class="status-step ${isAssigned || isResolved ? 'completed' : ''}">
          <div class="step-icon">2</div>
          <div class="step-label">${t('assigned')}</div>
        </div>
        <div class="step-line ${isResolved ? 'completed' : ''}"></div>
        <div class="status-step ${isAssigned ? 'active' : ''}">
          <div class="step-icon">3</div>
          <div class="step-label">${t('en_route')}</div>
        </div>
        <div class="step-line ${isResolved ? 'completed' : ''}"></div>
        <div class="status-step ${isResolved ? 'completed' : ''}">
          <div class="step-icon">4</div>
          <div class="step-label">${t('resolved')}</div>
        </div>
      </div>
      <p class="rescue-note">${t('rescue_notified_note')}</p>
    </div>
  `;

  if (typeof rescue.id === 'number') {
    startUserRescuePolling(rescue.id);
  }
}

function startUserRescuePolling(requestId) {
  if (state.userRescuePollInterval) clearInterval(state.userRescuePollInterval);
  const poll = async () => {
    if (!state.myRescues[0] || state.myRescues[0].id != requestId) {
      stopUserRescuePolling();
      return;
    }
    try {
      const res = await api(`/rescue/${requestId}`);
      if (res.request) {
        const prevStatus = state.myRescues[0].status;
        state.myRescues[0] = res.request;
        saveActiveRescue(res.request);
        if (res.request.status === 'resolved' && prevStatus !== 'resolved') {
          notify(`✓ Rescue request PF-${requestId} has been resolved.`);
          stopUserRescuePolling();
        }
      }
    } catch (e) {}
  };
  state.userRescuePollInterval = setInterval(poll, 10000);
}

function stopUserRescuePolling() {
  if (state.userRescuePollInterval) {
    clearInterval(state.userRescuePollInterval);
    state.userRescuePollInterval = null;
  }
}

async function acceptRescue(requestId) {
  try {
    const loc = await getLocation();
    const body = loc ? { lat: loc.lat, lng: loc.lng } : {};
    const res = await api(`/rescue/${requestId}/accept`, { method: 'POST', body: JSON.stringify(body) });
    notify(`Responder ${state.user?.name || 'Responder'} accepted Request #${requestId}`);
    startResponderLocationTracking(requestId);
    if (state.user?.role === 'admin') loadAdmin();
    else loadResponder();
  } catch (err) {
    notify(err.message, true);
  }
}

function startResponderLocationTracking(requestId) {
  if (state.responderTrackingInterval) clearInterval(state.responderTrackingInterval);
  const sendLoc = async () => {
    try {
      const loc = await getLocation();
      if (loc) {
        await api(`/rescue/${requestId}/responder-location`, {
          method: 'POST',
          body: JSON.stringify({ lat: loc.lat, lng: loc.lng })
        });
      }
    } catch (e) {}
  };
  sendLoc();
  state.responderTrackingInterval = setInterval(sendLoc, 12000);
}

function stopResponderLocationTracking() {
  if (state.responderTrackingInterval) {
    clearInterval(state.responderTrackingInterval);
    state.responderTrackingInterval = null;
  }
}

function fillProfile() {
  const form = $('#profile-form');
  if (!form || !state.user) return;
  if (form.home_label) form.home_label.value = state.user.home_label || '';
  if (form.language) form.language.value = state.user.language || state.lang;
  const needs = ['wheelchair', 'visually impaired', 'elderly', 'child', 'deaf / hearing impaired', 'other'];
  const selected = state.user.accessibility || [];
  if ($('#accessibility-options')) {
    $('#accessibility-options').innerHTML = needs.map((need) => `<label class="check-option"><input type="checkbox" name="accessibility" value="${need}" ${selected.includes(need) ? 'checked' : ''}>${need}</label>`).join('');
  }
}

async function saveProfile(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = formPayload(form);
  payload.language = form.language.value;
  setLanguage(payload.language);
  payload.accessibility = $$('input[name="accessibility"]:checked', form).map((input) => input.value);
  if (form.dataset.lat && form.dataset.lng) {
    payload.lat = Number(form.dataset.lat);
    payload.lng = Number(form.dataset.lng);
  }
  try {
    const data = await api('/profile', { method: 'PATCH', body: JSON.stringify(payload) });
    state.user = data.user;
    fillProfile();
    notify('Safety profile preferences saved.');
  } catch (error) { notify(error.message, true); }
}

async function setHomeLocation() {
  const location = await getLocation();
  if (!location) return;
  const form = $('#profile-form');
  if (form) {
    form.dataset.lat = location.lat;
    form.dataset.lng = location.lng;
  }
  if ($('#home-location-status')) {
    $('#home-location-status').textContent = `Location set: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}. Click Save to register.`;
  }
}

function renderCheckinHistory() {
  const existing = $('#checkin-history');
  if (existing) {
    existing.innerHTML = `
      <p class="eyebrow">${t('accountability_history')}</p>
      <h3>${t('your_checkin_history')}</h3>
      ${state.checkins.map((checkin) => `
        <div class="shelter-row">
          <div>
            <div class="shelter-name">${esc(checkin.shelter_name)}</div>
            <div class="shelter-address">${checkin.total_people} people · ${new Date(checkin.checked_in_at).toLocaleString()}</div>
          </div>
          ${checkin.undone_at ? '<span class="muted-sm">Undo Closed</span>' : `
            <span>
              <button class="text-button checkout" data-checkin-id="${checkin.id}">${t('check_out')}</button>
              <button class="text-button undo-checkin" data-checkin-id="${checkin.id}">${t('undo_checkin')}</button>
            </span>
          `}
        </div>
      `).join('') || `<p class="muted">${t('no_checkins_yet')}</p>`}
    `;

    $$('.undo-checkin', existing).forEach((button) => button.addEventListener('click', () => undoCheckinPrompt(Number(button.dataset.checkinId))));
    $$('.checkout', existing).forEach((button) => button.addEventListener('click', () => checkOut(Number(button.dataset.checkinId))));
  }
}

async function checkOut(checkinId) {
  try {
    await api(`/checkins/${checkinId}/checkout`, { method: 'POST' });
    notify('Check-out recorded.');
    await loadDashboard();
  } catch (error) { notify(error.message, true); }
}

/* ADMIN & RESPONDER DESK LOADERS */
async function loadResponder() {
  if (!state.user || !['admin', 'responder'].includes(state.user.role)) return;
  try {
    const data = await api('/responder/dashboard');
    const requests = data.rescue_requests || [];
    const activeEvacuations = data.evacuations || [];
    
    $('#responder-content').innerHTML = `
      <div class="responder-grid">
        <div class="stat-panel"><div class="stat-number">${requests.length}</div><div class="stat-label">${t('open_rescues')}</div></div>
        <div class="stat-panel"><div class="stat-number">${activeEvacuations.length}</div><div class="stat-label">${t('evacuations')}</div></div>
        <div class="stat-panel"><div class="stat-number">${data.shelters.filter(s => s.active).length}</div><div class="stat-label">${t('active_shelters')}</div></div>
        <div class="stat-panel"><div class="stat-number">${data.checkins.reduce((sum, item) => sum + item.total_people, 0)}</div><div class="stat-label">${t('people_checked_in')}</div></div>
      </div>
      
      <div class="panel map-panel" style="margin-top:1rem;">
        <div class="panel-heading"><div><p class="eyebrow">RESCUE MAP</p><h3>Active Emergency Locations</h3></div></div>
        <div id="responder-map" class="embedded-map"></div>
      </div>

      <div class="panel" style="margin-top:1rem;">
        <p class="eyebrow">RESCUE QUEUE</p>
        <h3>${t('requests_needing_attention')}</h3>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>${t('priority')}</th><th>${t('requester')}</th><th>${t('headcount')}</th><th>${t('needs')}</th><th>${t('location')}</th><th>${t('status')}</th></tr></thead>
            <tbody>
              ${requests.map(item => `
                <tr>
                  <td class="priority">${item.emergency ? `<span style="color:var(--crimson-alert);font-weight:800;">${t('urgent')}</span>` : t('standard')}</td>
                  <td>${esc(item.name)}<br><small class="muted">${esc(item.phone)}</small></td>
                  <td>${item.people_count}</td>
                  <td>${esc((item.accessibility || []).join(', ') || 'None')}</td>
                  <td>${item.lat ? `GPS: ${Number(item.lat).toFixed(4)}, ${Number(item.lng).toFixed(4)}` : esc(item.address || 'Not shared')}</td>
                  <td>
                    <div style="display:flex;flex-direction:column;gap:.3rem;">
                      <select class="rescue-status" data-request-id="${item.id}">
                        <option value="open" ${item.status === 'open' ? 'selected' : ''}>open (${t('requested')})</option>
                        <option value="assigned" ${item.status === 'assigned' ? 'selected' : ''}>assigned (${t('en_route')})</option>
                        <option value="resolved" ${item.status === 'resolved' ? 'selected' : ''}>resolved (${t('resolved')})</option>
                        <option value="cancelled" ${item.status === 'cancelled' ? 'selected' : ''}>cancelled</option>
                      </select>
                      ${item.status === 'open' ? `<button class="button primary compact accept-rescue-btn" data-request-id="${item.id}">ACCEPT</button>` : ''}
                      ${item.status === 'assigned' && item.responder_name ? `<small style="color:var(--cyan-accent);font-weight:600;">✓ ${esc(item.responder_name)} accepted</small>` : ''}
                    </div>
                  </td>
                </tr>
              `).join('') || '<tr><td colspan="6" class="muted">No open rescue requests.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <div class="panel" style="margin-top:1rem;">
        <div class="panel-heading"><div><p class="eyebrow">${t('shelter_network')}</p><h3>${t('shelter_capacity_monitoring')}</h3></div></div>
        <div class="shelter-list">
          ${data.shelters.map(shelter => `
            <div class="shelter-row">
              <div>
                <div class="shelter-name">${esc(shelter.name)} ${shelter.active ? '' : '<span class="muted-sm">(Inactive)</span>'}</div>
                <div class="shelter-address">${esc(shelter.address)} · ${shelter.occupancy} / ${shelter.capacity} occupied</div>
              </div>
              <div>
                <span class="tag ${shelter.occupancy >= shelter.capacity ? 'full' : ''}">${capacityLabel(shelter)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    $$('.rescue-status').forEach((select) => select.addEventListener('change', () => updateRescue(Number(select.dataset.requestId), select.value)));
    $$('.accept-rescue-btn').forEach((btn) => btn.addEventListener('click', () => acceptRescue(Number(btn.dataset.requestId))));
    initResponderMap(requests, data.shelters);
  } catch (error) { notify(error.message, true); }
}

async function loadAdmin() {
  if (!state.user || state.user.role !== 'admin') return;
  try {
    const data = await api('/responder/dashboard');
    const requests = data.rescue_requests || [];
    const shelters = data.shelters || [];
    
    const container = $('#admin-content');
    if (!container) return;

    const totalCap = shelters.reduce((acc, s) => acc + s.capacity, 0);
    const totalOcc = shelters.reduce((acc, s) => acc + s.occupancy, 0);

    container.innerHTML = `
      <div class="responder-grid">
        <div class="stat-panel"><div class="stat-number">${shelters.length}</div><div class="stat-label">${t('total_shelters')}</div></div>
        <div class="stat-panel"><div class="stat-number">${totalOcc} / ${totalCap}</div><div class="stat-label">${t('total_occupancy')}</div></div>
        <div class="stat-panel"><div class="stat-number">${requests.length}</div><div class="stat-label">${t('open_rescues')}</div></div>
        <div class="stat-panel"><div class="stat-number">${data.alerts.length}</div><div class="stat-label">${t('active_broadcasts')}</div></div>
      </div>

      <div class="panel map-panel" style="margin-top:1rem;">
        <div class="panel-heading"><div><p class="eyebrow">ADMIN MAP</p><h3>Infrastructure & Emergency Map View</h3></div></div>
        <div id="admin-map" class="embedded-map"></div>
      </div>

      <div class="panel" style="margin-top:1rem;">
        <div class="panel-heading">
          <div><p class="eyebrow">SHELTER MANAGEMENT</p><h3>${t('shelters_control')}</h3></div>
          <button class="button primary compact" id="admin-add-shelter-btn">+ ${t('add_shelter')}</button>
        </div>
        <div class="shelter-list">
          ${shelters.map(shelter => `
            <div class="shelter-row">
              <div>
                <div class="shelter-name">${esc(shelter.name)} ${shelter.active ? '<span class="tag" style="background:var(--emerald-bg);color:var(--emerald-safe);">ACTIVE</span>' : '<span class="muted-sm">(INACTIVE)</span>'}</div>
                <div class="shelter-address">${esc(shelter.address)} · Capacity: ${shelter.occupancy} / ${shelter.capacity}</div>
              </div>
              <div style="display:flex;gap:.5rem;align-items:center;">
                <button class="button outline compact toggle-shelter" data-id="${shelter.id}" data-active="${shelter.active}">${shelter.active ? t('deactivate') : t('activate')}</button>
                <button class="button outline compact delete-shelter" data-id="${shelter.id}" style="border-color:var(--crimson-alert);color:var(--crimson-alert)">${t('remove')}</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    $('#admin-add-shelter-btn')?.addEventListener('click', showAddShelterModal);
    $$('.toggle-shelter', container).forEach((btn) => btn.addEventListener('click', () => toggleShelter(Number(btn.dataset.id), btn.dataset.active === 'true')));
    $$('.delete-shelter', container).forEach((btn) => btn.addEventListener('click', () => deleteShelter(Number(btn.dataset.id))));

    initAdminMap(shelters, requests);
  } catch (error) { notify(error.message, true); }
}

async function updateRescue(id, status) {
  try {
    if (status === 'assigned') {
      await acceptRescue(id);
      return;
    }
    await api(`/rescue/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    notify(`Rescue request PF-${id} status updated.`);
    if (status === 'resolved' || status === 'cancelled') {
      stopResponderLocationTracking();
    }
    if (state.myRescues[0]?.id == id) {
      state.myRescues[0].status = status;
      saveActiveRescue(state.myRescues[0]);
    }
    if (state.user?.role === 'admin') loadAdmin();
    else loadResponder();
  } catch (error) { notify(error.message, true); }
}

async function toggleShelter(id, currentActive) {
  try {
    await api(`/shelters/${id}`, { method: 'PATCH', body: JSON.stringify({ active: !currentActive }) });
    notify('Shelter status updated.');
    if (state.user?.role === 'admin') loadAdmin();
    else loadResponder();
  } catch (err) { notify(err.message, true); }
}

async function deleteShelter(id) {
  if (!confirm('Are you sure you want to remove this shelter?')) return;
  try {
    await api(`/shelters/${id}`, { method: 'DELETE' });
    notify('Shelter removed.');
    if (state.user?.role === 'admin') loadAdmin();
    else loadResponder();
  } catch (err) { notify(err.message, true); }
}

/* ADMIN & ALERT MODALS */
function showAddShelterModal() {
  openModal(`
    <div class="modal-inner">
      <p class="eyebrow">ADMINISTRATION</p>
      <h2>Add New Smart Shelter</h2>
      <form id="add-shelter-form" class="modal-form">
        <label>Shelter Name<input name="name" required placeholder="e.g. Civic Center North"></label>
        <label>Address<input name="address" required placeholder="Street address or location description"></label>
        <div class="form-grid">
          <label>Latitude<input name="lat" type="number" step="any" value="40.715" required></label>
          <label>Longitude<input name="lng" type="number" step="any" value="-74.005" required></label>
        </div>
        <label>Capacity<input name="capacity" type="number" min="1" value="100" required></label>
        <label>Notes<input name="notes" placeholder="Generator, medical cots, water supply"></label>
        <div class="modal-actions">
          <button type="button" class="button outline" data-close-modal>${t('cancel')}</button>
          <button type="submit" class="button primary">Create Shelter</button>
        </div>
      </form>
    </div>
  `);

  $('[data-close-modal]').addEventListener('click', () => $('#modal').close());
  $('#add-shelter-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = formPayload(e.target);
    payload.capacity = Number(payload.capacity);
    try {
      await api('/shelters', { method: 'POST', body: JSON.stringify(payload) });
      $('#modal').close();
      notify('New shelter created.');
      await loadDashboard();
    } catch (err) { notify(err.message, true); }
  });
}

function showCreateAlertModal() {
  openModal(`
    <div class="modal-inner">
      <p class="eyebrow">BROADCAST ALERT</p>
      <h2>Issue Emergency Alert</h2>
      <form id="create-alert-form" class="modal-form">
        <label>Alert Title<input name="title" required placeholder="e.g. Flash Flood Warning"></label>
        <label>Severity
          <select name="severity">
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MODERATE">MODERATE</option>
            <option value="LOW">LOW</option>
          </select>
        </label>
        <label>Target Area<input name="area" value="Your registered area" required></label>
        <label>Alert Message<textarea name="message" required placeholder="Specific evacuation or warning instructions"></textarea></label>
        <div class="modal-actions">
          <button type="button" class="button outline" data-close-modal>${t('cancel')}</button>
          <button type="submit" class="button help-pulse-btn">Broadcast Alert</button>
        </div>
      </form>
    </div>
  `);

  $('[data-close-modal]').addEventListener('click', () => $('#modal').close());
  $('#create-alert-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api('/alerts', { method: 'POST', body: JSON.stringify(formPayload(e.target)) });
      $('#modal').close();
      notify('Emergency alert broadcasted.');
      await loadDashboard();
    } catch (err) { notify(err.message, true); }
  });
}

/* MAP INITIALIZATION — Google Maps (primary when key available) + Leaflet (fallback) */

/**
 * Initialize the overview map.
 * Uses Google Maps JS API when window.prefloodGoogleMapsKey is available
 * and the Maps API has loaded (window._gmapsLoaded).
 * Falls back to the existing Leaflet implementation otherwise.
 */
function initOverviewMap() {
  const container = $('#overview-map');
  if (!container) return;

  const centerLat = state.coords?.lat || 40.715;
  const centerLng = state.coords?.lng || -74.005;

  // ── Google Maps path ──────────────────────────────────────────────────────
  const hasGoogleKey = typeof window.prefloodGoogleMapsKey === 'string' && window.prefloodGoogleMapsKey.length > 0;
  if (hasGoogleKey) {
    // If the Maps API has already loaded, render immediately; otherwise wait.
    if (typeof window._onGmapsReady === 'function') {
      window._onGmapsReady(() => _initOverviewMapGoogle(container, centerLat, centerLng));
    } else if (window._gmapsLoaded) {
      _initOverviewMapGoogle(container, centerLat, centerLng);
    } else {
      // API key exists but Maps JS not yet loaded — defer with callback list
      window._gmapsCallbacks = window._gmapsCallbacks || [];
      window._gmapsCallbacks.push(() => _initOverviewMapGoogle(container, centerLat, centerLng));
    }
    return;
  }

  // ── Leaflet fallback path ─────────────────────────────────────────────────
  _initOverviewMapLeaflet(container, centerLat, centerLng);
}

function _initOverviewMapGoogle(container, centerLat, centerLng) {
  if (!window.google || !window.google.maps) {
    // Google API failed to load — fall back to Leaflet
    _initOverviewMapLeaflet(container, centerLat, centerLng);
    return;
  }
  // Prevent double-init
  if (maps.overview && maps.overview._isGoogleMap) { return; }
  // Destroy any existing Leaflet instance
  if (maps.overview && typeof maps.overview.remove === 'function') {
    maps.overview.remove();
    maps.overview = null;
  }

  const center = { lat: centerLat, lng: centerLng };
  const gmap = new window.google.maps.Map(container, {
    center,
    zoom: 13,
    mapTypeId: 'roadmap',
    styles: [
      { elementType: 'geometry', stylers: [{ color: '#0d1117' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#a0aec0' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1117' }] },
      { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e2a3a' }] },
      { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#06b6d4', lightness: -60 }] },
    ],
  });

  // User location marker
  if (state.coords) {
    const userPos = { lat: state.coords.lat, lng: state.coords.lng };
    new window.google.maps.Marker({
      position: userPos,
      map: gmap,
      title: 'Your Current Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: '#06b6d4',
        fillOpacity: 0.95,
        strokeColor: '#ffffff',
        strokeWeight: 3,
      },
    });
  }

  // Shelter markers
  state.shelters.forEach(s => {
    const isFull = s.occupancy >= s.capacity;
    new window.google.maps.Marker({
      position: { lat: s.lat, lng: s.lng },
      map: gmap,
      title: s.name,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: isFull ? '#ef4444' : '#10b981',
        fillOpacity: 0.9,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
    });
  });

  maps.overview = gmap;
  maps.overview._isGoogleMap = true;
}

function _initOverviewMapLeaflet(container, centerLat, centerLng) {
  if (!window.L) return;
  if (maps.overview && !maps.overview._isGoogleMap) { maps.overview.invalidateSize(); return; }
  if (maps.overview && maps.overview._isGoogleMap) { maps.overview = null; }

  const map = L.map('overview-map').setView([centerLat, centerLng], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  if (state.coords) {
    L.circleMarker([state.coords.lat, state.coords.lng], {
      radius: 8,
      fillColor: '#06b6d4',
      color: '#ffffff',
      weight: 3,
      fillOpacity: 0.9
    }).addTo(map).bindPopup('<b>Your Current Location</b>');
  }

  state.shelters.forEach(s => {
    const isFull = s.occupancy >= s.capacity;
    const color = isFull ? '#ef4444' : '#10b981';
    L.circleMarker([s.lat, s.lng], {
      radius: 8,
      fillColor: color,
      color: '#ffffff',
      weight: 2,
      opacity: 1,
      fillOpacity: 0.85
    }).addTo(map).bindPopup(`<b>${esc(s.name)}</b><br>${esc(s.address)}<br>${s.occupancy} / ${s.capacity} occupied`);
  });

  maps.overview = map;
}

function initRouteMap(fromLat, fromLng, toLat, toLng, geometryCoords = null) {
  const container = $('#route-map');
  if (!container || typeof L === 'undefined') return;
  if (maps.route) { maps.route.remove(); maps.route = null; }

  const map = L.map('route-map').setView([(fromLat + toLat) / 2, (fromLng + toLng) / 2], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  L.marker([fromLat, fromLng]).addTo(map).bindPopup('<b>Your Current Location</b>');
  L.circleMarker([toLat, toLng], { radius: 10, fillColor: '#06b6d4', color: '#ffffff', weight: 2, fillOpacity: 0.9 }).addTo(map).bindPopup('<b>Shelter Destination</b>');

  if (geometryCoords && Array.isArray(geometryCoords) && geometryCoords.length > 0) {
    const latLngs = geometryCoords.map(c => [c[1], c[0]]);
    L.polyline(latLngs, { color: '#06b6d4', weight: 5, opacity: 0.9 }).addTo(map);
    map.fitBounds(L.latLngBounds(latLngs), { padding: [30, 30] });
  } else {
    const line = L.polyline([[fromLat, fromLng], [toLat, toLng]], { color: '#06b6d4', weight: 4, opacity: 0.8, dashArray: '8, 8' }).addTo(map);
    map.fitBounds(line.getBounds(), { padding: [30, 30] });
  }

  maps.route = map;
  setTimeout(() => { if (maps.route) maps.route.invalidateSize(); }, 150);
}

function initResponderMap(requests, shelters = []) {
  const container = $('#responder-map');
  if (!container || typeof L === 'undefined') return;
  if (maps.responder) { maps.responder.remove(); maps.responder = null; }

  const map = L.map('responder-map').setView([40.715, -74.005], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  shelters.forEach(s => {
    L.circleMarker([s.lat, s.lng], {
      radius: 6,
      fillColor: '#06b6d4',
      color: '#ffffff',
      weight: 1.5,
      fillOpacity: 0.7
    }).addTo(map).bindPopup(`<b>Shelter: ${esc(s.name)}</b><br>${s.occupancy}/${s.capacity} occupied`);
  });

  requests.forEach(r => {
    if (r.lat && r.lng) {
      L.circleMarker([r.lat, r.lng], {
        radius: 9,
        fillColor: r.emergency ? '#ef4444' : '#f59e0b',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 0.9
      }).addTo(map).bindPopup(`<b>${esc(r.name)}</b> (${r.people_count} people)<br>Status: <strong>${r.status.toUpperCase()}</strong><br>Needs: ${esc((r.accessibility || []).join(', ') || 'None')}`);
    }
    if (r.status === 'assigned' && r.responder_lat && r.responder_lng) {
      L.circleMarker([r.responder_lat, r.responder_lng], {
        radius: 10,
        fillColor: '#06b6d4',
        color: '#ffffff',
        weight: 3,
        fillOpacity: 0.95
      }).addTo(map).bindPopup(`<b>Responder: ${esc(r.responder_name || 'Responder')}</b><br>Assigned to Request #${r.id}`);
      if (r.lat && r.lng) {
        L.polyline([[r.lat, r.lng], [r.responder_lat, r.responder_lng]], {
          color: '#06b6d4',
          weight: 3,
          dashArray: '6, 6'
        }).addTo(map);
      }
    }
  });

  maps.responder = map;
}

function initAdminMap(shelters = [], requests = []) {
  const container = $('#admin-map');
  if (!container || typeof L === 'undefined') return;
  if (maps.admin) { maps.admin.remove(); maps.admin = null; }

  const map = L.map('admin-map').setView([40.715, -74.005], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  shelters.forEach(s => {
    const isFull = s.occupancy >= s.capacity;
    L.circleMarker([s.lat, s.lng], {
      radius: 9,
      fillColor: isFull ? '#ef4444' : '#10b981',
      color: '#ffffff',
      weight: 2,
      fillOpacity: 0.85
    }).addTo(map).bindPopup(`<b>Shelter: ${esc(s.name)}</b><br>${s.occupancy}/${s.capacity} occupied`);
  });

  requests.forEach(r => {
    if (r.lat && r.lng) {
      L.circleMarker([r.lat, r.lng], {
        radius: 8,
        fillColor: '#f59e0b',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 0.9
      }).addTo(map).bindPopup(`<b>Rescue: ${esc(r.name)}</b> (${r.people_count} people)`);
    }
  });

  maps.admin = map;
}

boot();
}


