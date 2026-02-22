<?php
/*
Plugin Name: GradeBook
Plugin URI: https://wordpress.org/plugins/an-gradebook/
Description: A gradebook plugin for educators to create, maintain, and share grades.
Version: 6.2.0
Author: Aori Nevo
Author URI: http://www.aorinevo.com
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Text Domain: an-gradebook
Domain Path: /languages
Requires at least: 6.0
Tested up to: 6.9
Requires PHP: 7.4
*/

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'AN_GRADEBOOK_VERSION', '6.2.0' );

require_once plugin_dir_path( __FILE__ ) . 'functions.php';
require_once plugin_dir_path( __FILE__ ) . 'Gradebook-Database.php';
require_once plugin_dir_path( __FILE__ ) . 'Gradebook-RESTful-API/Assignment.php';
require_once plugin_dir_path( __FILE__ ) . 'Gradebook-RESTful-API/Course.php';
require_once plugin_dir_path( __FILE__ ) . 'Gradebook-RESTful-API/Student.php';
require_once plugin_dir_path( __FILE__ ) . 'Gradebook-RESTful-API/Cell.php';
require_once plugin_dir_path( __FILE__ ) . 'Gradebook-RESTful-API/Gradebook-API.php';

register_activation_hook( __FILE__, array( 'AN_GradeBook_Database', 'setup' ) );
add_action( 'plugins_loaded', array( 'AN_GradeBook_Database', 'maybe_setup' ) );

function an_gradebook_init() {
	new gradebook_course_API();
	new gradebook_assignment_API();
	new gradebook_cell_API();
	new gradebook_student_API();
	new AN_GradeBookAPI();
}
add_action( 'init', 'an_gradebook_init' );

function an_gradebook_load_textdomain() {
	load_plugin_textdomain( 'an-gradebook', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' );
}
add_action( 'plugins_loaded', 'an_gradebook_load_textdomain' );

function register_an_gradebook_menu_page() {
	add_menu_page(
		__( 'GradeBook', 'an-gradebook' ),
		__( 'GradeBook', 'an-gradebook' ),
		'read',
		'an_gradebook',
		'init_an_gradebook',
		'dashicons-book-alt',
		'6.12'
	);
}
add_action( 'admin_menu', 'register_an_gradebook_menu_page' );

function enqueue_an_gradebook_scripts( $hook ) {
	if ( 'toplevel_page_an_gradebook' !== $hook ) {
		return;
	}

	$plugin_url = plugins_url( '', __FILE__ );
	$js_url     = $plugin_url . '/js';
	$version    = AN_GRADEBOOK_VERSION;

	// Styles
	wp_enqueue_style( 'an-gradebook-jquery-ui', $js_url . '/lib/jquery-ui/jquery-ui.css', array(), $version );
	wp_enqueue_style( 'an-gradebook-bootstrap', $js_url . '/lib/bootstrap/css/bootstrap2.css', array(), $version );
	wp_enqueue_style( 'an-gradebook', $plugin_url . '/GradeBook.css', array( 'an-gradebook-bootstrap', 'an-gradebook-jquery-ui' ), $version );

	// Google Charts
	wp_enqueue_script( 'google-charts', 'https://www.gstatic.com/charts/loader.js', array(), null, true );

	// Bootstrap JS (not bundled by WordPress)
	wp_enqueue_script( 'an-gradebook-bootstrap', $js_url . '/lib/bootstrap/js/bootstrap.js', array( 'jquery' ), $version, true );

	// Plugin namespace (depends on WordPress-bundled jQuery, Backbone, Underscore)
	wp_enqueue_script( 'an-gradebook-namespace', $js_url . '/an-gradebook-namespace.js', array( 'jquery', 'backbone', 'underscore' ), $version, true );

	// Pass nonce and ajax URL to JavaScript
	wp_localize_script( 'an-gradebook-namespace', 'anGradebookSettings', array(
		'ajaxurl' => admin_url( 'admin-ajax.php' ),
		'nonce'   => wp_create_nonce( 'an_gradebook_nonce' ),
	) );

	// Models (base models first, then collections that depend on them)
	$models = array(
		'Course', 'CourseList',
		'Assignment', 'AssignmentList',
		'Student', 'StudentList',
		'Cell', 'CellList',
		'CourseGradebook',
		'StudentCourse', 'StudentCourseList',
		'StudentCourseGradebook',
	);
	foreach ( $models as $model ) {
		$handle = 'an-gradebook-model-' . strtolower( $model );
		wp_enqueue_script( $handle, $js_url . "/app/models/{$model}.js", array( 'an-gradebook-namespace' ), $version, true );
	}

	// Views — leaf views first, then composites
	$views = array(
		'EditCourseView',
		'CourseView',
		'DeleteStudentView',
		'EditStudentView',
		'EditAssignmentView',
		'StatisticsView',
		'AssignmentStatisticsView',
		'StudentDetailsAssignmentView',
		'CellView',
		'StudentCellView',
		'StudentView',
		'StudentStudentView',
		'AssignmentView',
		'StudentAssignmentView',
		'GradebookView',
		'StudentGradebookView',
		'StudentCourseView',
	);
	foreach ( $views as $view ) {
		$handle = 'an-gradebook-view-' . strtolower( $view );
		wp_enqueue_script( $handle, $js_url . "/app/views/{$view}.js", array( 'an-gradebook-namespace', 'google-charts' ), $version, true );
	}

	// Main app views
	wp_enqueue_script( 'an-gradebook-app-instructor', $js_url . '/app/GradeBook.js', array( 'an-gradebook-namespace' ), $version, true );
	wp_enqueue_script( 'an-gradebook-app-student', $js_url . '/app/GradeBook_student.js', array( 'an-gradebook-namespace' ), $version, true );

	// Entry point (instructor or student)
	if ( current_user_can( 'manage_options' ) ) {
		wp_enqueue_script( 'an-gradebook-instructor', $js_url . '/an-gradebook-instructor.js', array( 'an-gradebook-app-instructor' ), $version, true );
	} else {
		wp_enqueue_script( 'an-gradebook-student', $js_url . '/an-gradebook-student.js', array( 'an-gradebook-app-student' ), $version, true );
	}
}
add_action( 'admin_enqueue_scripts', 'enqueue_an_gradebook_scripts' );

function init_an_gradebook() {
	if ( current_user_can( 'manage_options' ) ) {
		ob_start();
		include plugin_dir_path( __FILE__ ) . 'templates/edit-student-template.php';
		include plugin_dir_path( __FILE__ ) . 'templates/delete-student-template.php';
		include plugin_dir_path( __FILE__ ) . 'templates/edit-assignment-template.php';
		include plugin_dir_path( __FILE__ ) . 'templates/stats-assignment-template.php';
		include plugin_dir_path( __FILE__ ) . 'templates/edit-cell-template.php';
		include plugin_dir_path( __FILE__ ) . 'templates/stats-student-template.php';
		include plugin_dir_path( __FILE__ ) . 'templates/assignment-view-template.php';
		include plugin_dir_path( __FILE__ ) . 'templates/course-view-template.php';
		include plugin_dir_path( __FILE__ ) . 'templates/student-view-template.php';
		include plugin_dir_path( __FILE__ ) . 'templates/gradebook-interface-template.php';
		include plugin_dir_path( __FILE__ ) . 'templates/student-courses-interface-template.php';
		include plugin_dir_path( __FILE__ ) . 'templates/edit-course-template.php';
		include plugin_dir_path( __FILE__ ) . 'templates/courses-interface-template.php';
		include plugin_dir_path( __FILE__ ) . 'templates/student-gradebook-interface-template.php';
		echo ob_get_clean();
	} elseif ( is_user_logged_in() ) {
		ob_start();
		include plugin_dir_path( __FILE__ ) . 'templates/stats-assignment-template.php';
		include plugin_dir_path( __FILE__ ) . 'templates/stats-student-template.php';
		include plugin_dir_path( __FILE__ ) . 'templates/student-student-view-template.php';
		include plugin_dir_path( __FILE__ ) . 'templates/student-course-view-template.php';
		include plugin_dir_path( __FILE__ ) . 'templates/student-cell-template.php';
		include plugin_dir_path( __FILE__ ) . 'templates/student-assignment-view-template.php';
		include plugin_dir_path( __FILE__ ) . 'templates/student-details-assignment-template.php';
		include plugin_dir_path( __FILE__ ) . 'templates/student-courses-interface-template.php';
		include plugin_dir_path( __FILE__ ) . 'templates/student-gradebook-interface-template.php';
		echo ob_get_clean();
	} else {
		echo esc_html__( 'You do not have permissions to view this GradeBook.', 'an-gradebook' );
	}
}

function an_gradebook_my_delete_user( $user_id ) {
	global $wpdb;
	$table_gradebook  = an_gradebook_table( 'an_gradebook' );
	$table_assignment = an_gradebook_table( 'an_assignment' );
	$wpdb->delete( $table_gradebook, array( 'uid' => $user_id ) );
	$wpdb->delete( $table_assignment, array( 'uid' => $user_id ) );
}
add_action( 'delete_user', 'an_gradebook_my_delete_user' );
