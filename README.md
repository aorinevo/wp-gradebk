# GradeBook

A WordPress plugin for educators to create, maintain, and share grades directly from the dashboard.

## Features

### Instructor

- Create, edit, and delete courses
- Add, edit, and remove students (new or existing WordPress users)
- Create, edit, delete, and reorder assignments
- Edit grade cells inline
- Filter assignments by category and toggle visibility
- Sort by assignment columns
- Export gradebook data to CSV
- View student and assignment statistics with interactive charts

### Student

- View enrolled courses and grades
- View assignment details including due dates
- View performance statistics with pie and line charts

## Requirements

- WordPress 6.0+
- PHP 7.4+

## Installation

1. Upload the `an-gradebook` folder to `/wp-content/plugins/`, or install directly through the WordPress plugin screen.
2. Activate the plugin through **Plugins** in WordPress.
3. A **GradeBook** menu item will appear in the admin dashboard.

On activation, the plugin creates four database tables (`wp_an_gradebooks`, `wp_an_gradebook`, `wp_an_assignments`, `wp_an_assignment`) using the WordPress table prefix.

## Architecture

```
GradeBook.php                  Main plugin entry point
Gradebook-Database.php         Database schema setup (dbDelta)
functions.php                  Helper utilities
uninstall.php                  Cleanup on plugin deletion
Gradebook-RESTful-API/
  Course.php                   Course CRUD (wp_ajax)
  Assignment.php               Assignment CRUD (wp_ajax)
  Student.php                  Student CRUD (wp_ajax)
  Cell.php                     Grade cell updates (wp_ajax)
  Gradebook-API.php            Read-only endpoints (courses, gradebook, charts, CSV)
js/
  an-gradebook-namespace.js    Global namespace, nonce prefilter, utilities
  an-gradebook-instructor.js   Instructor entry point
  an-gradebook-student.js      Student entry point
  app/
    models/                    Backbone models and collections
    views/                     Backbone views
  lib/                         Bootstrap, jQuery UI
templates/                     Underscore.js templates
```

The frontend is a single-page application built on **Backbone.js** using WordPress-bundled jQuery, Backbone, and Underscore. All data flows through WordPress AJAX (`wp_ajax_*`) endpoints secured with nonce verification and capability checks.

## Development

### Database

The plugin uses `dbDelta()` to manage the schema. Table definitions live in `Gradebook-Database.php`. On activation and on every `plugins_loaded`, the plugin checks `an_gradebook_db_version` in `wp_options` and runs `dbDelta()` if the version is stale.

### AJAX Endpoints

All write endpoints require `manage_options` capability (WordPress Administrator). Read endpoints for students require only `is_user_logged_in()`. Every endpoint verifies the `an_gradebook_nonce` nonce.

| Action | Method | Description |
|--------|--------|-------------|
| `course` | POST/PUT/DELETE | Course CRUD |
| `assignment` | POST/PUT/DELETE | Assignment CRUD |
| `student` | POST/PUT/DELETE | Student CRUD |
| `cell` | PUT | Update a grade cell |
| `get_courses` | GET | List all courses |
| `get_gradebook_entire` | GET | Full gradebook for a course |
| `get_csv` | GET | Export gradebook as CSV |
| `get_pie_chart` | GET | Grade distribution for an assignment |
| `get_line_chart` | GET | Student progress chart |
| `get_student_courses` | GET | Courses for current student |
| `get_student_gradebook_entire` | GET | Student's gradebook view |

## License

GPL-2.0-or-later
