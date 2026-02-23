<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class AN_GradeBook_REST_Stats {

	public function register_routes() {
		register_rest_route( 'an-gradebook/v1', '/stats/assignment/(?P<amid>\d+)', array(
			'methods'             => 'GET',
			'callback'            => array( $this, 'get_pie_chart' ),
			'permission_callback' => array( $this, 'logged_in_permission' ),
		) );

		register_rest_route( 'an-gradebook/v1', '/stats/student', array(
			'methods'             => 'GET',
			'callback'            => array( $this, 'get_line_chart' ),
			'permission_callback' => array( $this, 'admin_permission' ),
		) );
	}

	public function admin_permission() {
		return current_user_can( 'manage_options' );
	}

	public function logged_in_permission() {
		return is_user_logged_in();
	}

	public function get_pie_chart( $request ) {
		global $wpdb;
		$table_assignment = an_gradebook_table( 'an_assignment' );

		$amid           = absint( $request['amid'] );
		$pie_chart_data = $wpdb->get_col( $wpdb->prepare(
			"SELECT assign_points_earned FROM {$table_assignment} WHERE amid = %d",
			$amid
		) );

		$is_A = count( array_filter( $pie_chart_data, function ( $n ) { return $n >= 90; } ) );
		$is_B = count( array_filter( $pie_chart_data, function ( $n ) { return $n >= 80 && $n < 90; } ) );
		$is_C = count( array_filter( $pie_chart_data, function ( $n ) { return $n >= 70 && $n < 80; } ) );
		$is_D = count( array_filter( $pie_chart_data, function ( $n ) { return $n >= 60 && $n < 70; } ) );
		$is_F = count( array_filter( $pie_chart_data, function ( $n ) { return $n < 60; } ) );

		return rest_ensure_response( array(
			'grades' => array( $is_A, $is_B, $is_C, $is_D, $is_F ),
		) );
	}

	public function get_line_chart( $request ) {
		global $wpdb;
		$table_assignment  = an_gradebook_table( 'an_assignment' );
		$table_assignments = an_gradebook_table( 'an_assignments' );

		$uid  = absint( $request['uid'] );
		$gbid = absint( $request['gbid'] );

		$student_grades = $wpdb->get_results( $wpdb->prepare(
			"SELECT * FROM {$table_assignment} WHERE uid = %d AND gbid = %d",
			$uid,
			$gbid
		), ARRAY_A );

		$assignments = $wpdb->get_results( $wpdb->prepare(
			"SELECT * FROM {$table_assignments} WHERE gbid = %d",
			$gbid
		), ARRAY_A );

		foreach ( $student_grades as &$grade ) {
			$grade['assign_order']         = intval( $grade['assign_order'] );
			$grade['assign_points_earned'] = intval( $grade['assign_points_earned'] );
			foreach ( $assignments as $assignment ) {
				if ( $assignment['id'] == $grade['amid'] ) {
					$all_scores    = $wpdb->get_col( $wpdb->prepare(
						"SELECT assign_points_earned FROM {$table_assignment} WHERE amid = %d",
						$assignment['id']
					) );
					$count         = count( $all_scores );
					$class_average = $count > 0 ? array_sum( $all_scores ) / $count : 0;
					$grade         = array_merge( $grade, array(
						'assign_name'   => $assignment['assign_name'],
						'class_average' => $class_average,
					) );
				}
			}
		}

		$result = array( array( 'Assignment', 'Student Score', 'Class Average' ) );
		foreach ( $student_grades as $grade ) {
			$result[] = array( $grade['assign_name'], $grade['assign_points_earned'], $grade['class_average'] );
		}

		return rest_ensure_response( $result );
	}
}
