# Dinnertime - A Modern Angular Application

## Overview

Dinnertime is a feature-rich application designed to provide a seamless experience for restaurant customers. It includes functionalities for placing orders, viewing dine-in menus, making reservations, finding restaurant locations, and getting in touch with the restaurant. The application is built with the latest version of Angular, leveraging modern features like standalone components, signals, and native control flow for optimal performance and maintainability.

## Style, Design, and Features

### Initial Version

*   **Core Structure**: The application is set up with a main navigation component to provide access to all its features.
*   **Routing**: Routes are defined for each feature page, enabling easy navigation.
*   **Data Management**: All dynamic data is managed through JSON files, making future integrations with a backend API straightforward.
*   **Styling**: A consistent and modern design is applied across the application, with a focus on user experience and visual appeal.
*   **Order Form:** A form to place an order from a list of items.
*   **Dine-in PDF:** A PDF viewer to display the dine-in menu.
*   **Booking Form:** A form to book a table.
*   **Location Map:** A map to show the location of the branches.
*   **Get App Page:** A page to redirect to the app stores.
*   **Contact Us Page:** A page with the contact information of the branches.

## Current Plan

### Phase 1: Core Structure & Navigation

*   [x] Set up the main navigation to switch between features.
*   [x] Define routes for each page.
*   [x] Create a `blueprint.md` file to document the project.

### Phase 2: Order Form

*   [x] Create a JSON file for menu items.
*   [x] Build a service to fetch menu data.
*   [x] Develop a component to display items, manage quantities, and proceed to checkout.

### Phase 3: Dine-in PDF Viewer

*   [x] Integrate a PDF viewer.
*   [x] Create a component to display the dine-in menu PDF.

### Phase 4: Booking Form

*   [x] Design a reactive form for reservations with validation.

### Phase 5: Location Map

*   [x] Use a mapping library to display branch locations from a JSON file.

### Phase 6: "Get App" & "Contact Us" Pages

*   [x] Create a "Get App" page with app store buttons.
*   [x] Develop a "Contact Us" page with branch details and social media links.

### Phase 7: Styling & Design

*   [x] Apply a modern and consistent design across the application.