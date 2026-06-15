## Event Manager - Infos importantes

### Installation

- Après un `git clone`, installer les dépendances frontend :
  - `cd frontend`
  - `npm install`
- Installer les dépendances backend (Symfony) :
  - `cd api_event_manager`
  - `composer install`

### Variables d'environnement

- Le frontend utilise `VITE_API_BASE_URL` pour appeler l'API.
- Exemple attendu : `https://event-manager.fr`.

### Base de donnees / migrations

- Après récupération des changements backend, lancer les migrations :
  - `cd api_event_manager`
  - `php bin/console doctrine:migrations:migrate`
- Important : la feature de desactivation de compte repose sur la colonne `is_active`.

### Rôles et accès

- `ROLE_ADMIN` :
  - accès au dashboard admin (`/dashboard`)
  - gestion des demandes (`/RequestDashboard`)
  - gestion des utilisateurs (`/dashboard/users`)
- `ROLE_ORGANISATEUR` :
  - accès à la gestion des événements organisateur (`/organisateur/evenements`)
- `ROLE_USER` :
  - accès utilisateur standard

### Lancement du projet

- Frontend :
  - `npm run dev`
- Backend :
  - `symfony serve`

### Structure du frontend (fichiers importants)

- `src/main.jsx` : point d'entrée React.
- `src/App.jsx` : configuration des routes principales.
- `src/api/client.js` : client Axios central (base URL + JWT auto).
- `src/utils/auth.js` : utilitaires token/authentification.
- `src/components/RouteProteger.jsx` : protection des routes selon token/rôles.

- `src/pages/Home.jsx` : page d'accueil utilisateur.
- `src/pages/Calendrier.jsx` : calendrier principal + ajout d'événement + participation.
- `src/pages/Contact.jsx` : formulaire de demande support.
- `src/pages/Login.jsx` / `src/pages/Register.jsx` : authentification.
- `src/pages/profile.jsx` : profil utilisateur.
- `src/pages/404.jsx` : page introuvable.

- `src/pages/DashboardAdmin.jsx` : hub admin (accès aux modules admin).
- `src/pages/RequestDashboard.jsx` : page admin de gestion des demandes.
- `src/pages/UsersDashboard.jsx` : page admin utilisateurs/organisateurs + activation/désactivation.
- `src/pages/GestionEvenement.jsx` : gestion organisateur/admin des événements.

- `src/components/navbar.jsx` / `src/components/footer.jsx` : layout global.
- `src/components/RequestList.jsx` : liste + actions accepter/refuser des demandes.
- `src/components/AddEvent.jsx` : modal/formulaire création d'événement.
- `src/components/EventDetailModal.jsx` : détail d'un événement (inscription/désinscription).
- `src/components/ParticipationButtons.jsx` : logique boutons de participation.
- `src/components/CalendarGrid.jsx` / `src/components/EventsList.jsx` : blocs UI de la page calendrier.
- `src/hooks/useEventTeams.js` : hook utilitaire pour gérer les équipes.
