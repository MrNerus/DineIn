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

#### Form-First Branch Creation & Unified Full Branch Saving (Current Version)
*   **Direct Form-First Branch Creation**: Clicking "Add Branch" (`createNewBranch()`) directly navigates to `/management/branches/create` with a clean, unpopulated form instead of immediately creating a draft placeholder record via API.
*   **Backend 'id: null' Handled as New**: In `public/api/branches.php`, both POST requests and PUT requests where `id` is null (or omitted) are treated as new branch creation, assigning a database auto-increment ID and returning the created branch entity.
*   **Enforced Unique Branch Identifiers**: Branch slugs/identifiers (`identifier`) are strictly unique across all records using case-insensitive validation (`LOWER(identifier) = LOWER(:ident)`). Conflicting creation or rename attempts trigger an HTTP 400 response with a clear error message.
*   **Unified Full Branch Saving**: Form submissions are handled uniformly via `saveFullBranch()` through the header action button, eliminating cluttered section-by-section save buttons and ensuring atomic synchronization of info, schedules, redirects, and reviews.
*   **Seamless Transition to Edit Mode**: Upon saving the newly created branch, the frontend updates its state with the returned entity and silently transitions the URL to `/management/branches/edit/:id`.

---

## Current Plan: Unified Full Branch Saving & Cleanup of Section-by-Section Saves

### Phase 1: Angular Template Cleanup (`management-branch-form.html`)
*   [x] Remove redundant duplicate headers and icons.
*   [x] Remove individual save buttons from Section 1 (General Info), Section 2 (Opening Hours), Section 3 (Redirects & PDF Menus), and Section 4 (Review Platforms).
*   [x] Maintain only adding/removing list controls for dynamic schedules and reviews.
*   [x] Keep single, unified "Save Branch" / "Create Branch" button in the form header.

### Phase 2: Angular Component Cleanup (`management-branch-form.component.ts`)
*   [x] Remove `saveGeneralInfo()`, `saveSchedule()`, `saveRedirects()`, and `saveReviews()`.
*   [x] Retain `saveFullBranch()` to validate all sections and submit the full branch payload via `managementService.saveBranch()`.
*   [x] Replace `savingSection` with unified `isSavingBranch` signal.
*   [x] Clean up `ngOnInit()` initialization.

### Phase 3: Verification & Compilation
*   [x] Run `npx ng build` to confirm zero compiler/template errors.




