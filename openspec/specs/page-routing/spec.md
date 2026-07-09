## Purpose
Configures React Router routes with lazy loading, View Transition API for crossfade navigation, shared-element transitions for camera drill-down, and framer-motion component animations.

## ADDED Requirements

### Requirement: Route configuration
The system SHALL configure 11 routes using react-router-dom v7: `/` (redirect to `/main`), `/main`, `/view`, `/view/:viewId/edit`, `/replay/:eventId`, `/log`, `/report/:date`, `/users`, `/characters`, `/equipment`, `/exception-settings`. All page components SHALL be loaded via React.lazy with Suspense fallback (Skeleton).

#### Scenario: Root route redirects to main dashboard
- **WHEN** user navigates to "/"
- **THEN** browser redirects to "/main" and renders the main dashboard page

#### Scenario: Parameterized route works correctly
- **WHEN** user navigates to "/view/cam-03/edit"
- **THEN** the FenceEditor page renders with viewId "cam-03" available via useParams()

### Requirement: View Transition API for module switching
When navigating between modules (e.g., main ↔ log, main ↔ users), the system SHALL invoke `document.startViewTransition()` to perform a crossfade transition. When the browser does not support View Transition API, navigation SHALL complete instantly without animation.

#### Scenario: Crossfade between main and log pages
- **WHEN** user clicks "日志" in the sidebar while on the main dashboard
- **THEN** the page content crossfades (150-200ms) from the main dashboard to the log center

#### Scenario: Unsupported browser falls back gracefully
- **WHEN** user navigates in a browser without View Transition API support (e.g., Firefox)
- **THEN** navigation completes instantly with no animation and no error

### Requirement: Shared element transition for camera drill-down
When navigating from main dashboard to live monitor (main → view), the system SHALL assign `view-transition-name` to the camera thumbnail card and the target video area for a shared-element morph transition.

#### Scenario: Camera thumbnail morphs to full video area
- **WHEN** user clicks a camera thumbnail card on the main dashboard to enter live view
- **THEN** the clicked thumbnail smoothly morphs (300ms) into the full-size video placeholder area using shared element transition

### Requirement: Component-level animation with framer-motion
Panel open/close, list item enter/exit, and mode switch (view↔edit) SHALL use framer-motion `<AnimatePresence>` for smooth enter/exit animations targeting only `opacity` and `transform` properties.

#### Scenario: Panel slides in from right
- **WHEN** user selects a user card on the user management page
- **THEN** the detail panel slides in from the right (250ms, cubic-bezier easing) without layout shift in the main content area
