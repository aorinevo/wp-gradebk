<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class AN_GradeBook_REST_Student_View {

	public function register_routes() {
		register_rest_route( 'an-gradebook/v1', '/student/courses', array(
			'methods'             => 'GET',
			'callback'            => array( $this, 'get_courses' ),
			'permission_callback' => array( $this, 'logged_in_permission' ),
		) );

		register_rest_route( 'an-gradebook/v1', '/student/courses/(?P<id>\d+)/gradebook', array(
			'methods'             => 'GET',
			'callback'            => array( $this, 'get_gradebook' ),
			'permission_callback' => array( $this, 'logged_in_permission' ),
		) );

		register_rest_route( 'an-gradebook/v1', '/stats/student/me', array(
			'methods'             => 'GET',
			'callback'            => array( $this, 'get_line_chart' ),
			'permission_callback' => array( $this, 'logged_in_permission' ),
		) );
	}

	public function logged_in_permission() {
		return is_user_logged_in();
	}

	public function get_courses() {
		global $wpdb;
		$table_gradebook  = an_gradebook_table( 'an_gradebook' );
		$table_gradebooks = an_gradebook_table( 'an_gradebooks' );

		$current_user = wp_get_current_user();
		$gbids        = $wpdb->get_col( $wpdb->prepare(
			"SELECT gbid FROM {$table_gradebook} WHERE uid = %d",
			$current_user->ID
		) );

		if ( empty( $gbids ) ) {
			return rest_ensure_response( array() );
		}

		$gbids        = array_map( 'absint', $gbids );
		$placeholders = implode( ',', array_fill( 0, count( $gbids ), '%d' ) );
		$courses      = $wpdb->get_results( $wpdb->prepare(
			"SELECT * FROM {$table_gradebooks} WHERE id IN ({$placeholders})",
			$gbids
		), ARRAY_A );

		return rest_ensure_response( $courses );
	}

	public function get_gradebook( $request ) {
		global $wpdb;
		$table_assignments = an_gradebook_table( 'an_assignments' );
		$table_assignment  = an_gradebook_table( 'an_assignment' );

		$gbid         = absint( $request['id'] );
		$current_user = wp_get_current_user();

		// Only visible assignments
		$assignments = $wpdb->get_results( $wpdb->prepare(
			"SELECT * FROM {$table_assignments} WHERE assign_visibility = 'Students' AND gbid = %d",
			$gbid
		), ARRAY_A );

		foreach ( $assignments as &$assignment ) {
			$assignment['id']           = intval( $assignment['id'] );
			$assignment['gbid']         = intval( $assignment['gbid'] );
			$assignment['assign_order'] = intval( $assignment['assign_order'] );
		}

		if ( empty( $assignments ) ) {
			$student = get_userdata( $current_user->ID );
			return rest_ensure_response( array(
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

		// Only cells for visible assignments and current user
		$assignment_ids = array_map( function ( $a ) { return absint( $a['id'] ); }, $assignments );
		$placeholders   = implode( ',', array_fill( 0, count( $assignment_ids ), '%d' ) );
		$query_args     = array_merge( $assignment_ids, array( $current_user->ID ) );

		$student_assignments = $wpdb->get_results( $wpdb->prepare(
			"SELECT * FROM {$table_assignment} WHERE amid IN ({$placeholders}) AND uid = %d",
			$query_args
		), ARRAY_A );

		foreach ( $student_assignments as &$sa ) {
			$sa['gbid'] = intval( $sa['gbid'] );
		}

		$student = get_userdata( $current_user->ID );
		$student_data = array(
			'firstname'  => $student->first_name,
			'lastname'   => $student->last_name,
			'user_login' => $student->user_login,
			'id'         => intval( $student->ID ),
			'gbid'       => $gbid,
		);

		usort( $student_assignments, an_gradebook_build_sorter( 'assign_order' ) );
		foreach ( $student_assignments as &$sa ) {
			$sa['amid']                 = intval( $sa['amid'] );
			$sa['uid']                  = intval( $sa['uid'] );
			$sa['assign_order']         = intval( $sa['assign_order'] );
			$sa['assign_points_earned'] = floatval( $sa['assign_points_earned'] );
			$sa['gbid']                 = intval( $sa['gbid'] );
			$sa['id']                   = intval( $sa['id'] );
		}

		return rest_ensure_response( array(
			'assignments' => $assignments,
			'cells'       => $student_assignments,
			'students'    => $student_data,
		) );
	}

	public function get_line_chart( $request ) {
		global $wpdb;
		$table_assignment  = an_gradebook_table( 'an_assignment' );
		$table_assignments = an_gradebook_table( 'an_assignments' );

		$uid  = get_current_user_id();
		$gbid = absint( $request['gbid'] );

		// Only visible assignments
		$assignments = $wpdb->get_results( $wpdb->prepare(
			"SELECT * FROM {$table_assignments} WHERE assign_visibility = 'Students' AND gbid = %d",
			$gbid
		), ARRAY_A );

		if ( empty( $assignments ) ) {
			return rest_ensure_response( array( array( 'Assignment', 'Student Score', 'Class Average' ) ) );
		}

		$assignment_ids = array_map( function ( $a ) { return absint( $a['id'] ); }, $assignments );
		$placeholders   = implode( ',', array_fill( 0, count( $assignment_ids ), '%d' ) );
		$query_args     = array_merge( $assignment_ids, array( $uid ) );

		$student_grades = $wpdb->get_results( $wpdb->prepare(
			"SELECT * FROM {$table_assignment} WHERE amid IN ({$placeholders}) AND uid = %d",
			$query_args
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
