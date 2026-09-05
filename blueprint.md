# Savana Sushi Portal - A Modern Angular Hub Application

## Overview

Savana Sushi Portal is an interactive, modern portal and redirection hub for restaurant guests. Rather than navigating across multi-page website menus, guests use a streamlined, single-screen hub to quickly book a table, place delivery or pickup orders, view dine-in PDF menus, check branch location and opening hours, contact the restaurant, install the mobile app, and leave reviews. The application is built with Angular v20+, featuring standalone components, reactive Signals, native control flow, and persistent session-based branch selection. In addition, a modern Content Management System (CMS) is integrated under `/management` to configure company info, notice ads, and restaurant branch listings with a companion PHP PoC backend.

## Style, Design, and Features

### Version History & Evolution

#### Initial Version
*   **Multi-Page Routing**: Independent routes for Order, Dine-In, Booking, Location, App, Contact, and Reviews.
*   **Forms**: Booking form and item checkout templates.
*   **Data Structure**: JSON-based branch configuration (`assets/data/branches.json`) containing redirect URLs, opening schedules, phone numbers, and coordinates.

#### Modern Hub & Portal Redesign
*   **Onboarding Setup**: Modal on first visit prompting the user to select a branch (e.g., Amadora or Mem Martins - Sintra), stored securely in `sessionStorage`.
*   **Persistent TopBar with Branch Indicator**: Real-time display of the currently active branch with a one-touch branch switcher dialog.
*   **Single-Screen Portal Layout**: Replaces multi-page navigation with an intuitive, clean grid of interactive tiles.
*   **Interactive Modal System**:
    *   **Branch Switcher Modal**: Allows fast switching between restaurant branches anytime.
    *   **Reservation Modal**: Direct link and quick details to reserve a table at the active branch.
    *   **Delivery & Pickup Modal**: Multi-option access to direct online ordering, Glovo, Uber Eats, and Bolt.
    *   **Dine-In Menu Modal**: Direct access to view and download À la Carte and Rodízio PDF menus.
    *   **Location & Hours Modal**: Detailed view of address, Google Maps routing, click-to-call phone, and weekly opening hours timetable.
    *   **Contact & Socials Modal**: Direct phone dialing with call notes, and links to Instagram and Facebook.
    *   **App Download Modal**: Apple App Store & Google Play redirect cards.
    *   **Reviews Modal**: Direct links to Google Reviews (branch-specific), TripAdvisor, and The Fork.
    *   **Privacy Modal**: Quick access to privacy policy and terms.
    *   **Notice Carousel Modal**: High-impact promotional popup with multi-slide advertisement carousel.
*   **Design & Theme**: Glassmorphism with deep burgundy/crimson accents, glowing elements, responsive mobile-first cards, smooth dialog transitions, and accessible backdrop dismiss.

#### Management CMS & PHP Backend
*   **Protected Management Routing**: Management portal starting at `/management` with `authGuard`.
*   **Authentication & Login**: Admin login (`/management/login`) with demo credential helper and mock token session management.
*   **Company Management (`/management/company`)**: Full form to manage brand name, logos, favicon, social channels, mobile apps, delivery partners, and promotional notice images.
*   **Branch Management (`/management/branches`)**: Searchable list of branches with placeholder creation, editing, duplicate, status toggling, and delete operations.
*   **JSON Schema Integrity**: Full synchronization with `src/assets/data/branches.json` schema including live JSON payload inspector and export functionality.
*   **PHP PoC Backend**: Static mock RESTful endpoints with CORS headers (`api/login.php`, `api/company.php`, `api/branches.php`, `api/data.php`, `api/cors.php`).

#### Individual Section Saving & Branch Placeholder System (Current Version)
*   **Section-by-Section Saving**: Each form section (General Info, Opening Hours, Redirects & Menus, Review Channels) is saved independently with dedicated validation and API synchronization.
*   **Default Placeholder Creation**: Elimination of blank "Add Branch" form pages in favor of automatic default placeholder branch creation (`POST api/branches.php?action=create_default`) with immediate edit navigation.
*   **Separation of Internal ID and Identifier**: Every branch maintains an immutable internal ID (`id`) alongside an editable user-facing unique slug (`identifier`).
*   **Active / Inactive Status**: Branches have an `isActive` toggle (inactive by default for new placeholders), with status indicators on branch cards and filtering on the public guest portal.
*   **100% Backend-Driven Architecture**: Complete removal of `localStorage` draft caching and fake offline fallbacks. Management components communicate directly with SQLite backend endpoints (`api/data.php`, `api/branches.php`, `api/company.php`), with responsive loading states and backend error handling.

---

## Current Plan: Dynamic Backend URL Integration via ConfigService

### Phase 1: ConfigService Refinements
*   [x] Enhance `ConfigService` with `backend_url` property alias and safe URL builder helper (`apiUrl(endpoint)`).
*   [x] Guarantee trailing slash normalization so paths like `api/login.php` or `/api/login.php` join seamlessly.

### Phase 2: AuthService Integration
*   [x] Inject `ConfigService` into `AuthService`.
*   [x] Update `login()` to send requests to `${this.configService.backend_url}/api/login.php`.

### Phase 3: ManagementService Integration
*   [x] Inject `ConfigService` into `ManagementService`.
*   [x] Update all endpoints (`api/data.php`, `api/branches.php`, `api/company.php`) to use `backend_url`.

### Phase 4: Verification & Build Check
*   [x] Run `ng build` to verify clean compilation.
*   [x] Confirm zero breaking changes across services.


