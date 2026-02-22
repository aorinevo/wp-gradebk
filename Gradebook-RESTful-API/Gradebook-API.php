<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class AN_GradeBookAPI {
	public function __construct() {
		// admin_gradebook
		add_action( 'wp_ajax_get_courses', array( $this, 'get_courses' ) );
		add_action( 'wp_ajax_get_gradebook_entire', array( $this, 'get_gradebook_entire' ) );
		add_action( 'wp_ajax_get_pie_chart', array( $this, 'get_pie_chart' ) );
		add_action( 'wp_ajax_get_line_chart', array( $this, 'get_line_chart' ) );
		add_action( 'wp_ajax_get_csv', array( $this, 'get_csv' ) );
		// student_gradebook
		add_action( 'wp_ajax_get_line_chart_studentview', array( $this, 'get_line_chart_studentview' ) );
		add_action( 'wp_ajax_get_student_courses', array( $this, 'get_student_courses' ) );
		add_action( 'wp_ajax_get_student_assignments', array( $this, 'get_student_assignments' ) );
		add_action( 'wp_ajax_get_student_assignment', array( $this, 'get_student_assignment' ) );
		add_action( 'wp_ajax_get_student_gradebook', array( $this, 'get_student_gradebook' ) );
		add_action( 'wp_ajax_get_student_gradebook_entire', array( $this, 'get_student_gradebook_entire' ) );
		add_action( 'wp_ajax_get_student', array( $this, 'get_student' ) );
	}

	public function get_csv() {
		global $wpdb;
		check_ajax_referer( 'an_gradebook_nonce', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( 'Not Allowed.', 403 );
		}

		$gbid             = absint( $_GET['id'] );
		$table_gradebooks = an_gradebook_table( 'an_gradebooks' );
		$table_assignments = an_gradebook_table( 'an_assignments' );
		$table_assignment = an_gradebook_table( 'an_assignment' );
		$table_gradebook  = an_gradebook_table( 'an_gradebook' );

		$gradebook   = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table_gradebooks} WHERE id = %d", $gbid ), ARRAY_A );
		$assignments = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table_assignments} WHERE gbid = %d", $gbid ), ARRAY_A );
		foreach ( $assignments as &$assignment ) {
			$assignment['id']           = intval( $assignment['id'] );
			$assignment['gbid']         = intval( $assignment['gbid'] );
			$assignment['assign_order'] = intval( $assignment['assign_order'] );
		}
		usort( $assignments, an_gradebook_build_sorter( 'assign_order' ) );

		$column_headers_assignment_names = array();
		foreach ( $assignments as &$assignment ) {
			array_push( $column_headers_assignment_names, $assignment['assign_name'] );
		}
		$column_headers = array_merge(
			array( 'firstname', 'lastname', 'user_login', 'id', 'gbid' ),
			$column_headers_assignment_names
		);

		$student_assignments = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table_assignment} WHERE gbid = %d", $gbid ), ARRAY_A );
		foreach ( $student_assignments as &$student_assignment ) {
			$student_assignment['gbid'] = intval( $student_assignment['gbid'] );
		}

		$students = $wpdb->get_results( $wpdb->prepare( "SELECT uid FROM {$table_gradebook} WHERE gbid = %d", $gbid ), ARRAY_N );
		foreach ( $students as &$value ) {
			$studentData = get_userdata( $value[0] );
			$value       = array(
				'firstname'  => $studentData->first_name,
				'lastname'   => $studentData->last_name,
				'user_login' => $studentData->user_login,
				'id'         => intval( $studentData->ID ),
				'gbid'       => $gbid,
			);
		}

		usort( $student_assignments, an_gradebook_build_sorter( 'assign_order' ) );
		foreach ( $student_assignments as &$student_assignment ) {
			$student_assignment['amid']                 = intval( $student_assignment['amid'] );
			$student_assignment['uid']                  = intval( $student_assignment['uid'] );
			$student_assignment['assign_order']         = intval( $student_assignment['assign_order'] );
			$student_assignment['assign_points_earned'] = floatval( $student_assignment['assign_points_earned'] );
			$student_assignment['gbid']                 = intval( $student_assignment['gbid'] );
			$student_assignment['id']                   = intval( $student_assignment['id'] );
		}

		$student_records = array();
		foreach ( $students as &$row ) {
			$records_for_student = array_filter(
				$student_assignments,
				function ( $k ) use ( $row ) {
					return $k['uid'] == $row['id'];
				}
			);
			$scores_for_student = array_map( function ( $k ) { return $k['assign_points_earned']; }, $records_for_student );
			$student_record     = array_merge( $row, $scores_for_student );
			array_push( $student_records, $student_record );
		}

		header( 'Content-Type: text/csv; charset=utf-8' );
		$filename = str_replace( ' ', '_', $gradebook[0]['name'] . '_' . $gbid );
		header( 'Content-Disposition: attachment; filename=' . $filename . '.csv' );

		$output = fopen( 'php://output', 'w' );
		fputcsv( $output, $column_headers );
		foreach ( $student_records as &$row ) {
			fputcsv( $output, $row );
		}
		fclose( $output );
		wp_die();
	}

	public function get_pie_chart() {
		global $wpdb;
		check_ajax_referer( 'an_gradebook_nonce', 'nonce' );

		$amid             = absint( $_GET['amid'] );
		$table_assignment = an_gradebook_table( 'an_assignment' );

		$pie_chart_data = $wpdb->get_col( $wpdb->prepare( "SELECT assign_points_earned FROM {$table_assignment} WHERE amid = %d", $amid ) );

		$is_A = count( array_filter( $pie_chart_data, function ( $n ) { return $n >= 90; } ) );
		$is_B = count( array_filter( $pie_chart_data, function ( $n ) { return $n >= 80 && $n < 90; } ) );
		$is_C = count( array_filter( $pie_chart_data, function ( $n ) { return $n >= 70 && $n < 80; } ) );
		$is_D = count( array_filter( $pie_chart_data, function ( $n ) { return $n >= 60 && $n < 70; } ) );
		$is_F = count( array_filter( $pie_chart_data, function ( $n ) { return $n < 60; } ) );

		wp_send_json( array(
			'grades' => array( $is_A, $is_B, $is_C, $is_D, $is_F ),
		) );
	}

	public function get_line_chart() {
		global $wpdb;
		check_ajax_referer( 'an_gradebook_nonce', 'nonce' );

		$uid               = absint( $_GET['uid'] );
		$gbid              = absint( $_GET['gbid'] );
		$table_assignment  = an_gradebook_table( 'an_assignment' );
		$table_assignments = an_gradebook_table( 'an_assignments' );

		$line_chart_data1 = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table_assignment} WHERE uid = %d AND gbid = %d", $uid, $gbid ), ARRAY_A );
		$line_chart_data2 = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table_assignments} WHERE gbid = %d", $gbid ), ARRAY_A );

		foreach ( $line_chart_data1 as &$line_chart_value1 ) {
			$line_chart_value1['assign_order']         = intval( $line_chart_value1['assign_order'] );
			$line_chart_value1['assign_points_earned'] = intval( $line_chart_value1['assign_points_earned'] );
			foreach ( $line_chart_data2 as $line_chart_value2 ) {
				if ( $line_chart_value2['id'] == $line_chart_value1['amid'] ) {
					$all_homework_scores = $wpdb->get_col( $wpdb->prepare( "SELECT assign_points_earned FROM {$table_assignment} WHERE amid = %d", $line_chart_value2['id'] ) );
					$count               = count( $all_homework_scores );
					$class_average       = $count > 0 ? array_sum( $all_homework_scores ) / $count : 0;
					$line_chart_value1   = array_merge( $line_chart_value1, array( 'assign_name' => $line_chart_value2['assign_name'], 'class_average' => $class_average ) );
				}
			}
		}

		$result = array( array( 'Assignment', 'Student Score', 'Class Average' ) );
		foreach ( $line_chart_data1 as $line_chart_value3 ) {
			array_push( $result, array( $line_chart_value3['assign_name'], $line_chart_value3['assign_points_earned'], $line_chart_value3['class_average'] ) );
		}

		wp_send_json( $result );
	}

	public function get_line_chart_studentview() {
		global $wpdb;
		check_ajax_referer( 'an_gradebook_nonce', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( 'Not Allowed.', 403 );
		}

		$uid               = get_current_user_id();
		$gbid              = absint( $_GET['gbid'] );
		$table_assignment  = an_gradebook_table( 'an_assignment' );
		$table_assignments = an_gradebook_table( 'an_assignments' );

		$line_chart_data2 = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table_assignments} WHERE assign_visibility = 'Students' AND gbid = %d", $gbid ), ARRAY_A );

		if ( empty( $line_chart_data2 ) ) {
			wp_send_json( array( array( 'Assignment', 'Student Score', 'Class Average' ) ) );
		}

		$assignment_ids = array_map( function ( $a ) { return absint( $a['id'] ); }, $line_chart_data2 );
		$placeholders   = implode( ',', array_fill( 0, count( $assignment_ids ), '%d' ) );
		$query_args     = array_merge( $assignment_ids, array( $uid ) );
		$line_chart_data1 = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table_assignment} WHERE amid IN ({$placeholders}) AND uid = %d", $query_args ), ARRAY_A );

		foreach ( $line_chart_data1 as &$line_chart_value1 ) {
			$line_chart_value1['assign_order']         = intval( $line_chart_value1['assign_order'] );
			$line_chart_value1['assign_points_earned'] = intval( $line_chart_value1['assign_points_earned'] );
			foreach ( $line_chart_data2 as $line_chart_value2 ) {
				if ( $line_chart_value2['id'] === $line_chart_value1['amid'] ) {
					$all_homework_scores = $wpdb->get_col( $wpdb->prepare( "SELECT assign_points_earned FROM {$table_assignment} WHERE amid = %d", $line_chart_value2['id'] ) );
					$count               = count( $all_homework_scores );
					$class_average       = $count > 0 ? array_sum( $all_homework_scores ) / $count : 0;
					$line_chart_value1   = array_merge( $line_chart_value1, array( 'assign_name' => $line_chart_value2['assign_name'], 'class_average' => $class_average ) );
				}
			}
		}

		$result = array( array( 'Assignment', 'Student Score', 'Class Average' ) );
		foreach ( $line_chart_data1 as $line_chart_value3 ) {
			array_push( $result, array( $line_chart_value3['assign_name'], $line_chart_value3['assign_points_earned'], $line_chart_value3['class_average'] ) );
		}

		wp_send_json( $result );
	}

	public function get_courses() {
		global $wpdb;
		check_ajax_referer( 'an_gradebook_nonce', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( 'Not Allowed.', 403 );
		}

		$table_gradebooks = an_gradebook_table( 'an_gradebooks' );
		$results          = $wpdb->get_results( "SELECT * FROM {$table_gradebooks}", ARRAY_A );
		wp_send_json( $results );
	}

	public function get_student_courses() {
		global $wpdb;
		check_ajax_referer( 'an_gradebook_nonce', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( 'Not Allowed.', 403 );
		}

		$current_user     = wp_get_current_user();
		$table_gradebook  = an_gradebook_table( 'an_gradebook' );
		$table_gradebooks = an_gradebook_table( 'an_gradebooks' );

		$results1 = $wpdb->get_col( $wpdb->prepare( "SELECT gbid FROM {$table_gradebook} WHERE uid = %d", $current_user->ID ) );

		if ( empty( $results1 ) ) {
			wp_send_json( array() );
		}

		$results1     = array_map( 'absint', $results1 );
		$placeholders = implode( ',', array_fill( 0, count( $results1 ), '%d' ) );
		$results2     = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table_gradebooks} WHERE id IN ({$placeholders})", $results1 ), ARRAY_A );
		wp_send_json( $results2 );
	}

	public function get_gradebook_entire() {
		global $wpdb;
		check_ajax_referer( 'an_gradebook_nonce', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( 'Not Allowed.', 403 );
		}

		$gbid              = absint( $_GET['gbid'] );
		$table_assignments = an_gradebook_table( 'an_assignments' );
		$table_assignment  = an_gradebook_table( 'an_assignment' );
		$table_gradebook   = an_gradebook_table( 'an_gradebook' );

		$assignments = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table_assignments} WHERE gbid = %d", $gbid ), ARRAY_A );
		foreach ( $assignments as &$assignment ) {
			$assignment['id']           = intval( $assignment['id'] );
			$assignment['gbid']         = intval( $assignment['gbid'] );
			$assignment['assign_order'] = intval( $assignment['assign_order'] );
		}

		$student_assignments = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table_assignment} WHERE gbid = %d", $gbid ), ARRAY_A );
		foreach ( $student_assignments as &$student_assignment ) {
			$student_assignment['gbid'] = intval( $student_assignment['gbid'] );
		}

		$students = $wpdb->get_results( $wpdb->prepare( "SELECT uid FROM {$table_gradebook} WHERE gbid = %d", $gbid ), ARRAY_N );
		foreach ( $students as &$value ) {
			$studentData = get_userdata( $value[0] );
			$value       = array(
				'firstname'  => $studentData->first_name,
				'lastname'   => $studentData->last_name,
				'user_login' => $studentData->user_login,
				'id'         => intval( $studentData->ID ),
				'gbid'       => $gbid,
			);
		}

		usort( $student_assignments, an_gradebook_build_sorter( 'assign_order' ) );
		foreach ( $student_assignments as &$student_assignment ) {
			$student_assignment['amid']                 = intval( $student_assignment['amid'] );
			$student_assignment['uid']                  = intval( $student_assignment['uid'] );
			$student_assignment['assign_order']         = intval( $student_assignment['assign_order'] );
			$student_assignment['assign_points_earned'] = floatval( $student_assignment['assign_points_earned'] );
			$student_assignment['gbid']                 = intval( $student_assignment['gbid'] );
			$student_assignment['id']                   = intval( $student_assignment['id'] );
		}

		wp_send_json( array(
			'assignments' => $assignments,
			'cells'       => $student_assignments,
			'students'    => $students,
		) );
	}

	public function get_student_gradebook_entire() {
		global $wpdb;
		check_ajax_referer( 'an_gradebook_nonce', 'nonce' );

		if ( ! is_user_logged_in() ) {
			wp_send_json_error( 'Not Allowed.', 403 );
		}

		$gbid              = absint( $_GET['gbid'] );
		$current_user      = wp_get_current_user();
		$table_assignments = an_gradebook_table( 'an_assignments' );
		$table_assignment  = an_gradebook_table( 'an_assignment' );

		$assignments = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table_assignments} WHERE assign_visibility = 'Students' AND gbid = %d", $gbid ), ARRAY_A );
		foreach ( $assignments as &$assignment ) {
			$assignment['id']           = intval( $assignment['id'] );
			$assignment['gbid']         = intval( $assignment['gbid'] );
			$assignment['assign_order'] = intval( $assignment['assign_order'] );
		}

		if ( empty( $assignments ) ) {
			$student = get_userdata( $current_user->ID );
			wp_send_json( array(
				'assignments' => array(),
				'cells'       => array(),
				'students'    => array(
					'firstname'  => $student->first_name,
					'lastname'   => $student->last_name,
					'user_login' => $student->user_login,
					'id'         => intval( $student->ID ),
					'gbid'       => $gbid,
				),
			) );
		}

		$assignment_ids = array_map( function ( $a ) { return absint( $a['id'] ); }, $assignments );
		$placeholders   = implode( ',', array_fill( 0, count( $assignment_ids ), '%d' ) );
		$query_args     = array_merge( $assignment_ids, array( $current_user->ID ) );
		$student_assignments = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table_assignment} WHERE amid IN ({$placeholders}) AND uid = %d", $query_args ), ARRAY_A );

		foreach ( $student_assignments as &$student_assignment ) {
			$student_assignment['gbid'] = intval( $student_assignment['gbid'] );
		}

		$student = get_userdata( $current_user->ID );
		$student = array(
			'firstname'  => $student->first_name,
			'lastname'   => $student->last_name,
			'user_login' => $student->user_login,
			'id'         => intval( $student->ID ),
			'gbid'       => $gbid,
		);

		usort( $student_assignments, an_gradebook_build_sorter( 'assign_order' ) );
		foreach ( $student_assignments as &$student_assignment ) {
			$student_assignment['amid']                 = intval( $student_assignment['amid'] );
			$student_assignment['uid']                  = intval( $student_assignment['uid'] );
			$student_assignment['assign_order']         = intval( $student_assignment['assign_order'] );
			$student_assignment['assign_points_earned'] = floatval( $student_assignment['assign_points_earned'] );
			$student_assignment['gbid']                 = intval( $student_assignment['gbid'] );
			$student_assignment['id']                   = intval( $student_assignment['id'] );
		}

		wp_send_json( array(
			'assignments' => $assignments,
			'cells'       => $student_assignments,
			'students'    => $student,
		) );
	}
}
