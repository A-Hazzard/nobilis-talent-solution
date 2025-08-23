# Calendar Page Plan (`/admin/calendar`)

## Overview
This page provides a fully functional calendar view and upcoming events list for managing appointments, workshops, and meetings. Users can add, edit, and delete events via modal dialogs. The UI is designed for clarity and extensibility.

---

## Features

### 1. Calendar View
- Dynamic monthly grid that works for any month/year
- Navigation buttons to move between months
- Each day cell shows events for that date
- Clicking an event opens the edit modal
- Today's date is highlighted
- Empty state handling for days without events

### 2. Upcoming Events List
- Shows next 5 events, sorted by date/time
- Each event displays: title, type badge, time, location, attendees
- Edit and delete buttons for each event
- Empty state with helpful message when no events exist

### 3. Add/Edit Event Modal
- Triggered by "Add Event" button or clicking existing events
- Modal contains a form:
  - Title (required)
  - Date (required, date picker)
  - Time (required, start/end time)
  - Location (required)
  - Attendees (number, required, minimum 1)
  - Type (select: workshop, consultation, training, meeting)
- Form validation with error messages
- On submit: adds/updates event, closes modal, updates UI
- Modal is accessible (focus trap, close on escape, etc.)

### 4. Quick Actions
- Schedule Consultation (pre-fills consultation type)
- Book Workshop (pre-fills workshop type)
- Plan Training Session (pre-fills training type)
- All quick actions open the modal with pre-filled type and today's date

### 5. State Management
- All events are managed in React state (array)
- Events persist in localStorage
- Adding/editing/deleting events updates both calendar and upcoming list
- (Future) Can be replaced with Firestore integration

### 6. Event Management
- Add new events
- Edit existing events by clicking on them
- Delete events with confirmation dialog
- Events are sorted by date for upcoming list

### 7. UI/UX
- Uses existing Card, Button, Badge, Input, etc. components
- Modal matches design system
- Error messages for invalid input
- Keyboard accessible
- Responsive design
- Loading states and error handling

---

## Extensibility
- Event state can be replaced with Firestore queries
- Modal form can be extended with more fields (description, etc.)
- Calendar navigation is already dynamic
- Event editing/deleting is implemented
- Easy to add recurring events, notifications, etc.

---

## Implementation Checklist
- [x] Calendar grid and upcoming events list
- [x] Add Event button opens modal
- [x] Modal form with validation
- [x] Add event to state and update UI
- [x] Accessibility and keyboard support
- [x] Edit existing events
- [x] Delete events with confirmation
- [x] Quick Actions functionality
- [x] Dynamic month navigation
- [x] Local storage persistence
- [x] Empty states and error handling
- [x] Form validation and error messages


---

## Technical Details
- **State Management**: React useState with localStorage persistence
- **Form Validation**: Client-side validation with error messages
- **Data Persistence**: localStorage (easily replaceable with Firestore)
- **Accessibility**: ARIA labels, keyboard navigation, focus management
- **Responsive**: Works on mobile and desktop
- **Type Safety**: TypeScript interfaces for all data structures

---

## Notes
- All UI/UX remains consistent with the current design
- No mock data - everything is functional
- All code is ready for Firestore integration
- Events persist between browser sessions
- Calendar is fully dynamic and navigable 