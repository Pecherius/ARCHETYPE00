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

  // Completed raffles
  completedRaffles: string
  noCompletedRaffles: string
  completedRafflesWillAppear: string
  viewResults: string
  raffleHistory: string
  raffleHistoryTitle: string
  raffleHistoryDescription: string

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
}

const translations: Record<string, Translations> = {
  en: {
    // System and navigation
    raffleSystem: "Punkable Ethereal Raffle System",
    manageRaffles: "Manage your raffles and select winners fairly",
    backToRaffles: "Back to Raffles",
    loadingRaffles: "Loading raffles...",
    loadingRaffle: "Loading raffle...",

    // Raffle management
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

    // Raffle status
    active: "Active",
    completed: "Completed",
    paused: "Paused",
    created: "Created",
    pending: "Pending",

    // Participants
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

    // Prizes
    prizes: "Prizes",
    addNewPrize: "Add New Prize",
    prizeName: "Prize name",
    quantity: "Quantity",
    addPrize: "Add Prize",
    totalPrizes: "Total Prizes",
    categories: "Categories",

    // Winners
    winners: "Winners",
    winnersWillAppear: "Winners will appear here",
    wins: "wins",
    winnersSelected: "winners selected from",

    // Selection process
    readyToDraw: "Ready to Draw!",
    clickToSelect: "Click the button below to select a winner",
    selectWinner: "Select Winner",
    selecting: "Selecting...",

    // System status
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

    // Customization
    customizeRaffle: "Customize Raffle",
    personalizeRaffle: "Personalize your raffle appearance",
    enterRaffleTitle: "Enter raffle title",
    raffleImage: "Raffle Image",
    preview: "Preview",

    // General
    defaultDescription: "A fair and transparent raffle system",
    noRafflesYet: "No raffles yet",
    viewDetails: "View Details",

    // Completed raffles
    completedRaffles: "Completed Raffles",
    noCompletedRaffles: "No completed raffles yet",
    completedRafflesWillAppear: "Completed raffles will appear here",
    viewResults: "View Results",
    raffleHistory: "Raffle History",
    raffleHistoryTitle: "Raffle History",
    raffleHistoryDescription: "View details of all completed raffles",

    // Results screen
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

    // Language
    language: "English",
  },
  es: {
    // System and navigation
    raffleSystem: "Sistema de Sorteos Etéreos Punkable",
    manageRaffles: "Gestiona tus sorteos y selecciona ganadores de forma justa",
    backToRaffles: "Volver a Sorteos",
    loadingRaffles: "Cargando sorteos...",
    loadingRaffle: "Cargando sorteo...",

    // Raffle management
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

    // Raffle status
    active: "Activo",
    completed: "Completado",
    paused: "Pausado",
    created: "Creado",
    pending: "Pendiente",

    // Participants
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

    // Prizes
    prizes: "Premios",
    addNewPrize: "Agregar Nuevo Premio",
    prizeName: "Nombre del premio",
    quantity: "Cantidad",
    addPrize: "Agregar Premio",
    totalPrizes: "Total de Premios",
    categories: "Categorías",

    // Winners
    winners: "Ganadores",
    winnersWillAppear: "Los ganadores aparecerán aquí",
    wins: "gana",
    winnersSelected: "ganadores seleccionados de",

    // Selection process
    readyToDraw: "¡Listo para Sortear!",
    clickToSelect: "Haz clic en el botón de abajo para seleccionar un ganador",
    selectWinner: "Seleccionar Ganador",
    selecting: "Seleccionando...",

    // System status
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

    // Customization
    customizeRaffle: "Personalizar Sorteo",
    personalizeRaffle: "Personaliza la apariencia de tu sorteo",
    enterRaffleTitle: "Ingresa el título del sorteo",
    raffleImage: "Imagen del Sorteo",
    preview: "Vista Previa",

    // General
    defaultDescription: "Un sistema de sorteos justo y transparente",
    noRafflesYet: "Aún no hay sorteos",
    viewDetails: "Ver Detalles",

    // Completed raffles
    completedRaffles: "Sorteos Completados",
    noCompletedRaffles: "Aún no hay sorteos completados",
    completedRafflesWillAppear: "Los sorteos completados aparecerán aquí",
    viewResults: "Ver Resultados",
    raffleHistory: "Historial de Sorteos",
    raffleHistoryTitle: "Historial de Sorteos",
    raffleHistoryDescription: "Ver detalles de todos los sorteos completados",

    // Results screen
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

    // Language
    language: "Español",
  },
  de: {
    // System and navigation
    raffleSystem: "Punkable Ethereal Verlosungssystem",
    manageRaffles: "Verwalten Sie Ihre Verlosungen und wählen Sie fair Gewinner aus",
    backToRaffles: "Zurück zu Verlosungen",
    loadingRaffles: "Verlosungen werden geladen...",
    loadingRaffle: "Verlosung wird geladen...",

    // Raffle management
    myRaffles: "Meine Verlosungen",
    newRaffle: "Neue Verlosung",
    createNewRaffle: "Neue Verlosung Erstellen",
    createFirstRaffle: "Ihre Erste Verlosung Erstellen",
    raffleTitle: "Verlosungstitel",
    raffleTitlePlaceholder: "Verlosungstitel eingeben",
    description: "Beschreibung",
    descriptionPlaceholder: "Verlosungsbeschreibung eingeben (optional)",
    imageUrl: "Bild-URL",
    imageUrlPlaceholder: "https://beispiel.com/bild.jpg",
    createRaffle: "Verlosung Erstellen",
    creating: "Erstellen...",
    openRaffle: "Verlosung Öffnen",
    deleteConfirm: "Sind Sie sicher, dass Sie diese Verlosung löschen möchten?",
    cancel: "Abbrechen",
    save: "Speichern",
    saveChanges: "Änderungen Speichern",
    close: "Schließen",

    // Raffle status
    active: "Aktiv",
    completed: "Abgeschlossen",
    paused: "Pausiert",
    created: "Erstellt",
    pending: "Ausstehend",

    // Participants
    participants: "Teilnehmer",
    addNewParticipant: "Neuen Teilnehmer Hinzufügen",
    enterName: "Name eingeben",
    numberOfTickets: "Anzahl NFT-Tickets",
    nftTickets: "NFT-Tickets",
    tickets: "Tickets",
    upAddressOptional: "UP-Adresse (optional)",
    addParticipant: "Teilnehmer Hinzufügen",
    duplicateUpAddress: "Diese UP-Adresse wird bereits verwendet",
    upAddress: "UP-Adresse",
    copyAddress: "Adresse Kopieren",
    copied: "Kopiert!",
    withUpAddress: "Mit UP-Adresse",

    // Prizes
    prizes: "Preise",
    addNewPrize: "Neuen Preis Hinzufügen",
    prizeName: "Preisname",
    quantity: "Menge",
    addPrize: "Preis Hinzufügen",
    totalPrizes: "Gesamtpreise",
    categories: "Kategorien",

    // Winners
    winners: "Gewinner",
    winnersWillAppear: "Gewinner werden hier erscheinen",
    wins: "gewinnt",
    winnersSelected: "Gewinner ausgewählt aus",

    // Selection process
    readyToDraw: "Bereit zum Ziehen!",
    clickToSelect: "Klicken Sie auf die Schaltfläche unten, um einen Gewinner auszuwählen",
    selectWinner: "Gewinner Auswählen",
    selecting: "Auswählen...",

    // System status
    systemOk: "System OK",
    checkIssues: "Probleme Prüfen",
    systemStatusAllGood: "Systemstatus: Alles in Ordnung!",
    systemStatusIssuesFound: "Systemstatus: Probleme Gefunden",
    total: "Gesamt",
    unique: "Eindeutig",
    duplicateUpAddressesFound: "Doppelte UP-Adressen gefunden:",
    usedBy: "Verwendet von",
    overallStatus: "Gesamtstatus",
    everythingLooksGood: "Alles sieht gut aus! Sie können mit der Verlosung fortfahren.",
    resolveIssues: "Bitte lösen Sie die oben genannten Probleme, bevor Sie fortfahren.",

    // Customization
    customizeRaffle: "Verlosung Anpassen",
    personalizeRaffle: "Personalisieren Sie das Aussehen Ihrer Verlosung",
    enterRaffleTitle: "Verlosungstitel eingeben",
    raffleImage: "Verlosungsbild",
    preview: "Vorschau",

    // General
    defaultDescription: "Ein faires und transparentes Verlosungssystem",
    noRafflesYet: "Noch keine Verlosungen",
    viewDetails: "Details Anzeigen",

    // Completed raffles
    completedRaffles: "Abgeschlossene Verlosungen",
    noCompletedRaffles: "Noch keine abgeschlossenen Verlosungen",
    completedRafflesWillAppear: "Abgeschlossene Verlosungen werden hier erscheinen",
    viewResults: "Ergebnisse Anzeigen",
    raffleHistory: "Verlosungshistorie",
    raffleHistoryTitle: "Verlosungshistorie",
    raffleHistoryDescription: "Details aller abgeschlossenen Verlosungen anzeigen",

    // Results screen
    resultsTitle: "Verlosungsergebnisse",
    resultsCopyAddress: "Adresse Kopieren",
    resultsViewWinners: "Gewinner Anzeigen",
    resultsRestart: "Verlosung Neustarten",
    resultsNotReady: "Noch nicht bereit?",
    resultsContinueEditing: "Verlosung Weiter Bearbeiten",
    resultsWinner: "Gewinner",
    resultsPrize: "Preis",
    resultsUpAddress: "UP-Adresse",
    resultsNoWinners: "Noch keine Gewinner ausgewählt",
    resultsRaffleComplete: "Verlosung Abgeschlossen!",
    resultsBackToEdit: "Zurück zum Bearbeiten",

    // Language
    language: "Deutsch",
  },
}

export function getTranslations(language: string): Translations {
  return translations[language] || translations.en
}

export function getAvailableLanguages(): Array<{ code: string; name: string; flag: string }> {
  return [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Español", flag: "🇪🇸" },
    { code: "de", name: "Deutsch", flag: "🇩🇪" },
  ]
}

// Named exports for compatibility
export const languages = getAvailableLanguages()
export const i18n = {
  getTranslations,
  getAvailableLanguages,
  languages: getAvailableLanguages(),
}
