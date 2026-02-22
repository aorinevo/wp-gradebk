<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class gradebook_assignment_API {
	public function __construct() {
		add_action( 'wp_ajax_assignment', array( $this, 'assignment' ) );
	}

	public function assignment() {
		global $wpdb;
		check_ajax_referer( 'an_gradebook_nonce', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( 'Not Allowed.', 403 );
		}

		$table_assignments = an_gradebook_table( 'an_assignments' );
		$table_assignment  = an_gradebook_table( 'an_assignment' );
		$table_gradebook   = an_gradebook_table( 'an_gradebook' );

		$method = isset( $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] ) ? sanitize_text_field( $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] ) : $_SERVER['REQUEST_METHOD'];
		switch ( $method ) {
			case 'DELETE':
				parse_str( $_SERVER['QUERY_STRING'], $params );
				$id = absint( $params['id'] );
				$wpdb->delete( $table_assignment, array( 'amid' => $id ) );
				$wpdb->delete( $table_assignments, array( 'id' => $id ) );
				wp_send_json( array( 'id' => $id ) );
				break;

			case 'PUT':
				$params = json_decode( file_get_contents( 'php://input' ), true );
				$id     = absint( $params['id'] );
				$wpdb->update(
					$table_assignments,
					array(
						'assign_name'       => sanitize_text_field( $params['assign_name'] ),
						'assign_date'       => sanitize_text_field( $params['assign_date'] ),
						'assign_due'        => sanitize_text_field( $params['assign_due'] ),
						'assign_order'      => absint( $params['assign_order'] ),
						'assign_category'   => sanitize_text_field( $params['assign_category'] ),
						'assign_visibility' => sanitize_text_field( $params['assign_visibility_options'] ),
					),
					array( 'id' => $id )
				);
				$wpdb->update(
					$table_assignment,
					array( 'assign_order' => absint( $params['assign_order'] ) ),
					array( 'amid' => $id )
				);
				$assignmentDetails = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table_assignments} WHERE id = %d", $id ), ARRAY_A );
				$assignmentDetails['id']           = intval( $assignmentDetails['id'] );
				$assignmentDetails['gbid']         = intval( $assignmentDetails['gbid'] );
				$assignmentDetails['assign_order'] = intval( $assignmentDetails['assign_order'] );
				wp_send_json( $assignmentDetails );
				break;

			case 'POST':
				$params     = json_decode( file_get_contents( 'php://input' ), true );
				$gbid       = absint( $params['gbid'] );
				$assignOrders = $wpdb->get_col( $wpdb->prepare( "SELECT assign_order FROM {$table_assignments} WHERE gbid = %d", $gbid ) );
				if ( ! $assignOrders ) {
					$assignOrders = array( 0 );
				}
				$assignOrder = max( $assignOrders ) + 1;
				$wpdb->insert(
					$table_assignments,
					array(
						'assign_name'       => sanitize_text_field( $params['assign_name'] ),
						'assign_date'       => sanitize_text_field( $params['assign_date'] ),
						'assign_due'        => sanitize_text_field( $params['assign_due'] ),
						'assign_category'   => sanitize_text_field( $params['assign_category'] ),
						'assign_visibility' => sanitize_text_field( $params['assign_visibility_options'] ),
						'gbid'              => $gbid,
						'assign_order'      => $assignOrder,
					),
					array( '%s', '%s', '%s', '%s', '%s', '%d', '%d' )
				);
				$assignID   = $wpdb->insert_id;
				$studentIDs = $wpdb->get_results( $wpdb->prepare( "SELECT uid FROM {$table_gradebook} WHERE gbid = %d", $gbid ), ARRAY_N );
				foreach ( $studentIDs as $value ) {
					$wpdb->insert(
						$table_assignment,
						array(
							'amid'                 => $assignID,
							'uid'                  => $value[0],
							'gbid'                 => $gbid,
							'assign_order'         => $assignOrder,
							'assign_points_earned' => 0,
						),
						array( '%d', '%d', '%d', '%d' )
					);
				}
				$assignmentDetails = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table_assignments} WHERE id = %d", $assignID ), ARRAY_A );
				$assignmentDetails['assign_order'] = intval( $assignmentDetails['assign_order'] );
				$assignmentDetails['gbid']         = intval( $assignmentDetails['gbid'] );
				$assignmentDetails['id']           = intval( $assignmentDetails['id'] );

				$assignmentStudents = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table_assignment} WHERE amid = %d", $assignID ), ARRAY_A );
				foreach ( $assignmentStudents as &$assignmentDetail ) {
					$assignmentDetail['amid']                 = intval( $assignmentDetail['amid'] );
					$assignmentDetail['uid']                  = intval( $assignmentDetail['uid'] );
					$assignmentDetail['assign_order']         = intval( $assignmentDetail['assign_order'] );
					$assignmentDetail['assign_points_earned'] = intval( $assignmentDetail['assign_points_earned'] );
					$assignmentDetail['gbid']                 = intval( $assignmentDetail['gbid'] );
					$assignmentDetail['id']                   = intval( $assignmentDetail['id'] );
				}
				wp_send_json( array( 'assignmentDetails' => $assignmentDetails, 'assignmentStudents' => $assignmentStudents ) );
				break;
		}
		wp_die();
	}
}
