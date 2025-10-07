export interface Translations {
  // System and navigation
  raffleSystem: string
  manageRaffles: string
  backToRaffles: string
  loadingRaffles: string
  loadingRaffle: string

  // Raffle management
  myRaffles: string
  newRaffle: string
  createNewRaffle: string
  createFirstRaffle: string
  raffleTitle: string
  raffleTitlePlaceholder: string
  description: string
  descriptionPlaceholder: string
  imageUrl: string
  imageUrlPlaceholder: string
  createRaffle: string
  creating: string
  openRaffle: string
  deleteConfirm: string
  cancel: string
  save: string
  saveChanges: string
  close: string

  // Raffle status
  active: string
  completed: string
  paused: string
  created: string
  pending: string

  // Participants
  participants: string
  addNewParticipant: string
  enterName: string
  numberOfTickets: string
  nftTickets: string
  tickets: string
  upAddressOptional: string
  addParticipant: string
  duplicateUpAddress: string
  upAddress: string
  copyAddress: string
  copied: string
  withUpAddress: string

  // Prizes
  prizes: string
  addNewPrize: string
  prizeName: string
  quantity: string
  addPrize: string
  totalPrizes: string
  categories: string

  // Winners
  winners: string
  winnersWillAppear: string
  wins: string
  winnersSelected: string

  // Selection process
  readyToDraw: string
  clickToSelect: string
  selectWinner: string
  selecting: string

  // System status
  systemOk: string
  checkIssues: string
  systemStatusAllGood: string
  systemStatusIssuesFound: string
  total: string
  unique: string
  duplicateUpAddressesFound: string
  usedBy: string
  overallStatus: string
  everythingLooksGood: string
  resolveIssues: string

  // Customization
  customizeRaffle: string
  personalizeRaffle: string
  enterRaffleTitle: string
  raffleImage: string
  preview: string

  // General
  defaultDescription: string
  noRafflesYet: string
  viewDetails: string

  // Results screen
  resultsTitle: string
  resultsCopyAddress: string
  resultsViewWinners: string
  resultsRestart: string
  resultsNotReady: string
  resultsContinueEditing: string
  resultsWinner: string
  resultsPrize: string
  resultsUpAddress: string
  resultsNoWinners: string
  resultsRaffleComplete: string
  resultsBackToEdit: string

  // Language
  language: string

  // Saved Users
  savedUsers: string
  recent: string
  mostUsed: string
  all: string
  searchUsers: string
  noUsersFound: string
  noSavedUsers: string
  used: string
  times: string
  lastUsed: string
  select: string
  users: string
  saveUser: string
  saveUserAs: string
  saveUserDescription: string
  quickAdd: string
  fromSaved: string
}

const translations: Record<string, Translations> = {
  en: {
    raffleSystem: "Punkable Ethereal Raffle System",
    manageRaffles: "Manage your raffles and select winners fairly",
    backToRaffles: "Back to Raffles",
    loadingRaffles: "Loading raffles...",
    loadingRaffle: "Loading raffle...",
    myRaffles: "My Raffles",
    newRaffle: "New Raffle",
    createNewRaffle: "Create New Raffle",
    createFirstRaffle: "Create Your First Raffle",
    raffleTitle: "Raffle Title",
    raffleTitlePlaceholder: "Enter raffle title",
    description: "Description",
    descriptionPlaceholder: "Enter raffle description (optional)",
    imageUrl: "Image URL",
    imageUrlPlaceholder: "https://example.com/image.jpg",
    createRaffle: "Create Raffle",
    creating: "Creating...",
    openRaffle: "Open Raffle",
    deleteConfirm: "Are you sure you want to delete this raffle?",
    cancel: "Cancel",
    save: "Save",
    saveChanges: "Save Changes",
    close: "Close",
    active: "Active",
    completed: "Completed",
    paused: "Paused",
    created: "Created",
    pending: "Pending",
    participants: "Participants",
    addNewParticipant: "Add New Participant",
    enterName: "Enter name",
    numberOfTickets: "Number of NFT tickets",
    nftTickets: "NFT tickets",
    tickets: "tickets",
    upAddressOptional: "UP Address (optional)",
    addParticipant: "Add Participant",
    duplicateUpAddress: "This UP address is already in use",
    upAddress: "UP Address",
    copyAddress: "Copy Address",
    copied: "Copied!",
    withUpAddress: "With UP Address",
    prizes: "Prizes",
    addNewPrize: "Add New Prize",
    prizeName: "Prize name",
    quantity: "Quantity",
    addPrize: "Add Prize",
    totalPrizes: "Total Prizes",
    categories: "Categories",
    winners: "Winners",
    winnersWillAppear: "Winners will appear here",
    wins: "wins",
    winnersSelected: "winners selected from",
    readyToDraw: "Ready to Draw!",
    clickToSelect: "Click the button below to select a winner",
    selectWinner: "Select Winner",
    selecting: "Selecting...",
    systemOk: "System OK",
    checkIssues: "Check Issues",
    systemStatusAllGood: "System Status: All Good!",
    systemStatusIssuesFound: "System Status: Issues Found",
    total: "Total",
    unique: "Unique",
    duplicateUpAddressesFound: "Duplicate UP addresses found:",
    usedBy: "Used by",
    overallStatus: "Overall Status",
    everythingLooksGood: "Everything looks good! You can proceed with the raffle.",
    resolveIssues: "Please resolve the issues above before proceeding.",
    customizeRaffle: "Customize Raffle",
    personalizeRaffle: "Personalize your raffle appearance",
    enterRaffleTitle: "Enter raffle title",
    raffleImage: "Raffle Image",
    preview: "Preview",
    defaultDescription: "A fair and transparent raffle system",
    noRafflesYet: "No raffles yet",
    viewDetails: "View Details",
    resultsTitle: "Raffle Results",
    resultsCopyAddress: "Copy Address",
    resultsViewWinners: "View Winners",
    resultsRestart: "Restart Raffle",
    resultsNotReady: "Not ready yet?",
    resultsContinueEditing: "Continue Editing Raffle",
    resultsWinner: "Winner",
    resultsPrize: "Prize",
    resultsUpAddress: "UP Address",
    resultsNoWinners: "No winners selected yet",
    resultsRaffleComplete: "Raffle Complete!",
    resultsBackToEdit: "Back to Edit",
    language: "English",
    savedUsers: "Saved Users",
    recent: "Recent",
    mostUsed: "Most Used",
    all: "All",
    searchUsers: "Search users...",
    noUsersFound: "No users found",
    noSavedUsers: "No saved users yet",
    used: "Used",
    times: "times",
    lastUsed: "Last used",
    select: "Select",
    users: "users",
    saveUser: "Save User",
    saveUserAs: "Save as",
    saveUserDescription: "Save this user for quick access in future raffles",
    quickAdd: "Quick Add",
    fromSaved: "From Saved",
  },
  es: {
    raffleSystem: "Sistema de Sorteos Etéreos Punkable",
    manageRaffles: "Gestiona tus sorteos y selecciona ganadores de forma justa",
    backToRaffles: "Volver a Sorteos",
    loadingRaffles: "Cargando sorteos...",
    loadingRaffle: "Cargando sorteo...",
    myRaffles: "Mis Sorteos",
    newRaffle: "Nuevo Sorteo",
    createNewRaffle: "Crear Nuevo Sorteo",
    createFirstRaffle: "Crear Tu Primer Sorteo",
    raffleTitle: "Título del Sorteo",
    raffleTitlePlaceholder: "Ingresa el título del sorteo",
    description: "Descripción",
    descriptionPlaceholder: "Ingresa la descripción del sorteo (opcional)",
    imageUrl: "URL de Imagen",
    imageUrlPlaceholder: "https://ejemplo.com/imagen.jpg",
    createRaffle: "Crear Sorteo",
    creating: "Creando...",
    openRaffle: "Abrir Sorteo",
    deleteConfirm: "¿Estás seguro de que quieres eliminar este sorteo?",
    cancel: "Cancelar",
    save: "Guardar",
    saveChanges: "Guardar Cambios",
    close: "Cerrar",
    active: "Activo",
    completed: "Completado",
    paused: "Pausado",
    created: "Creado",
    pending: "Pendiente",
    participants: "Participantes",
    addNewParticipant: "Agregar Nuevo Participante",
    enterName: "Ingresa el nombre",
    numberOfTickets: "Número de tickets NFT",
    nftTickets: "tickets NFT",
    tickets: "tickets",
    upAddressOptional: "Dirección UP (opcional)",
    addParticipant: "Agregar Participante",
    duplicateUpAddress: "Esta dirección UP ya está en uso",
    upAddress: "Dirección UP",
    copyAddress: "Copiar Dirección",
    copied: "¡Copiado!",
    withUpAddress: "Con Dirección UP",
    prizes: "Premios",
    addNewPrize: "Agregar Nuevo Premio",
    prizeName: "Nombre del premio",
    quantity: "Cantidad",
    addPrize: "Agregar Premio",
    totalPrizes: "Total de Premios",
    categories: "Categorías",
    winners: "Ganadores",
    winnersWillAppear: "Los ganadores aparecerán aquí",
    wins: "gana",
    winnersSelected: "ganadores seleccionados de",
    readyToDraw: "¡Listo para Sortear!",
    clickToSelect: "Haz clic en el botón de abajo para seleccionar un ganador",
    selectWinner: "Seleccionar Ganador",
    selecting: "Seleccionando...",
    systemOk: "Sistema OK",
    checkIssues: "Verificar Problemas",
    systemStatusAllGood: "Estado del Sistema: ¡Todo Bien!",
    systemStatusIssuesFound: "Estado del Sistema: Problemas Encontrados",
    total: "Total",
    unique: "Únicos",
    duplicateUpAddressesFound: "Direcciones UP duplicadas encontradas:",
    usedBy: "Usado por",
    overallStatus: "Estado General",
    everythingLooksGood: "¡Todo se ve bien! Puedes proceder con el sorteo.",
    resolveIssues: "Por favor resuelve los problemas anteriores antes de proceder.",
    customizeRaffle: "Personalizar Sorteo",
    personalizeRaffle: "Personaliza la apariencia de tu sorteo",
    enterRaffleTitle: "Ingresa el título del sorteo",
    raffleImage: "Imagen del Sorteo",
    preview: "Vista Previa",
    defaultDescription: "Un sistema de sorteos justo y transparente",
    noRafflesYet: "Aún no hay sorteos",
    viewDetails: "Ver Detalles",
    resultsTitle: "Resultados del Sorteo",
    resultsCopyAddress: "Copiar Dirección",
    resultsViewWinners: "Ver Ganadores",
    resultsRestart: "Reiniciar Sorteo",
    resultsNotReady: "¿Aún no está listo?",
    resultsContinueEditing: "Continuar Editando Sorteo",
    resultsWinner: "Ganador",
    resultsPrize: "Premio",
    resultsUpAddress: "Dirección UP",
    resultsNoWinners: "Aún no se han seleccionado ganadores",
    resultsRaffleComplete: "¡Sorteo Completado!",
    resultsBackToEdit: "Volver a Editar",
    language: "Español",
    savedUsers: "Usuarios Guardados",
    recent: "Recientes",
    mostUsed: "Más Usados",
    all: "Todos",
    searchUsers: "Buscar usuarios...",
    noUsersFound: "No se encontraron usuarios",
    noSavedUsers: "Aún no hay usuarios guardados",
    used: "Usado",
    times: "veces",
    lastUsed: "Último uso",
    select: "Seleccionar",
    users: "usuarios",
    saveUser: "Guardar Usuario",
    saveUserAs: "Guardar como",
    saveUserDescription: "Guarda este usuario para acceso rápido en futuros sorteos",
    quickAdd: "Agregar Rápido",
    fromSaved: "Desde Guardados",
  }
}

export function getTranslations(language: string): Translations {
  return translations[language] || translations.en
}

export function getAvailableLanguages(): Array<{ code: string; name: string; flag: string }> {
  return [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
  ]
}
