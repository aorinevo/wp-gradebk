<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class AN_GradeBook_REST_Assignments {

	public function register_routes() {
		register_rest_route( 'an-gradebook/v1', '/assignments', array(
			'methods'             => 'POST',
			'callback'            => array( $this, 'create_assignment' ),
			'permission_callback' => array( $this, 'admin_permission' ),
		) );

		register_rest_route( 'an-gradebook/v1', '/assignments/(?P<id>\d+)', array(
			array(
				'methods'             => 'PUT',
				'callback'            => array( $this, 'update_assignment' ),
				'permission_callback' => array( $this, 'admin_permission' ),
			),
			array(
				'methods'             => 'DELETE',
				'callback'            => array( $this, 'delete_assignment' ),
				'permission_callback' => array( $this, 'admin_permission' ),
			),
		) );
	}

	public function admin_permission() {
		return current_user_can( 'manage_options' );
	}

	public function create_assignment( $request ) {
		global $wpdb;
		$table_assignments = an_gradebook_table( 'an_assignments' );
		$table_assignment  = an_gradebook_table( 'an_assignment' );
		$table_gradebook   = an_gradebook_table( 'an_gradebook' );

		$gbid         = absint( $request['gbid'] );
		$assignOrders = $wpdb->get_col( $wpdb->prepare( "SELECT assign_order FROM {$table_assignments} WHERE gbid = %d", $gbid ) );
		if ( ! $assignOrders ) {
			$assignOrders = array( 0 );
		}
		$assignOrder = max( $assignOrders ) + 1;

		$wpdb->insert( $table_assignments, array(
			'assign_name'       => sanitize_text_field( $request['assign_name'] ),
			'assign_date'       => sanitize_text_field( $request['assign_date'] ),
			'assign_due'        => sanitize_text_field( $request['assign_due'] ),
			'assign_category'   => sanitize_text_field( $request['assign_category'] ),
			'assign_visibility' => sanitize_text_field( $request['assign_visibility_options'] ),
			'gbid'              => $gbid,
			'assign_order'      => $assignOrder,
		), array( '%s', '%s', '%s', '%s', '%s', '%d', '%d' ) );

		$assignID   = $wpdb->insert_id;
		$studentIDs = $wpdb->get_results( $wpdb->prepare( "SELECT uid FROM {$table_gradebook} WHERE gbid = %d", $gbid ), ARRAY_N );
		foreach ( $studentIDs as $value ) {
			$wpdb->insert( $table_assignment, array(
				'amid'                 => $assignID,
				'uid'                  => $value[0],
				'gbid'                 => $gbid,
				'assign_order'         => $assignOrder,
				'assign_points_earned' => 0,
			), array( '%d', '%d', '%d', '%d', '%d' ) );
		}

		$details = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table_assignments} WHERE id = %d", $assignID ), ARRAY_A );
		$details['assign_order'] = intval( $details['assign_order'] );
		$details['gbid']         = intval( $details['gbid'] );
		$details['id']           = intval( $details['id'] );

		$cells = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table_assignment} WHERE amid = %d", $assignID ), ARRAY_A );
		foreach ( $cells as &$c ) {
			$c['amid']                 = intval( $c['amid'] );
			$c['uid']                  = intval( $c['uid'] );
			$c['assign_order']         = intval( $c['assign_order'] );
			$c['assign_points_earned'] = intval( $c['assign_points_earned'] );
			$c['gbid']                 = intval( $c['gbid'] );
			$c['id']                   = intval( $c['id'] );
		}

		return rest_ensure_response( array(
			'assignmentDetails'  => $details,
			'assignmentStudents' => $cells,
		) );
	}

	public function update_assignment( $request ) {
		global $wpdb;
		$table_assignments = an_gradebook_table( 'an_assignments' );
		$table_assignment  = an_gradebook_table( 'an_assignment' );
		$id                = absint( $request['id'] );

		$wpdb->update( $table_assignments, array(
			'assign_name'       => sanitize_text_field( $request['assign_name'] ),
			'assign_date'       => sanitize_text_field( $request['assign_date'] ),
			'assign_due'        => sanitize_text_field( $request['assign_due'] ),
			'assign_order'      => absint( $request['assign_order'] ),
			'assign_category'   => sanitize_text_field( $request['assign_category'] ),
			'assign_visibility' => sanitize_text_field( $request['assign_visibility_options'] ),
		), array( 'id' => $id ) );

		$wpdb->update( $table_assignment, array(
			'assign_order' => absint( $request['assign_order'] ),
		), array( 'amid' => $id ) );

		$details = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table_assignments} WHERE id = %d", $id ), ARRAY_A );
		$details['id']           = intval( $details['id'] );
		$details['gbid']         = intval( $details['gbid'] );
		$details['assign_order'] = intval( $details['assign_order'] );

		return rest_ensure_response( $details );
	}

	public function delete_assignment( $request ) {
		global $wpdb;
		$id = absint( $request['id'] );

		$wpdb->delete( an_gradebook_table( 'an_assignment' ), array( 'amid' => $id ) );
		$wpdb->delete( an_gradebook_table( 'an_assignments' ), array( 'id' => $id ) );

		return rest_ensure_response( array( 'id' => $id ) );
	}
}
