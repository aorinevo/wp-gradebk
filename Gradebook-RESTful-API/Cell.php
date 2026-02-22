<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class gradebook_cell_API {
	public function __construct() {
		add_action( 'wp_ajax_cell', array( $this, 'cell' ) );
	}

	public function cell() {
		global $wpdb;
		check_ajax_referer( 'an_gradebook_nonce', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( 'Not Allowed.', 403 );
		}

		$table_assignment = an_gradebook_table( 'an_assignment' );

		$method = isset( $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] ) ? sanitize_text_field( $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] ) : $_SERVER['REQUEST_METHOD'];
		switch ( $method ) {
			case 'PUT':
				$params = json_decode( file_get_contents( 'php://input' ), true );
				$uid    = absint( $params['uid'] );
				$amid   = absint( $params['amid'] );
				$wpdb->update(
					$table_assignment,
					array(
						'assign_order'         => absint( $params['assign_order'] ),
						'assign_points_earned' => floatval( $params['assign_points_earned'] ),
					),
					array( 'uid' => $uid, 'amid' => $amid )
				);
				$assign_points_earned = $wpdb->get_row( $wpdb->prepare( "SELECT assign_points_earned FROM {$table_assignment} WHERE uid = %d AND amid = %d", $uid, $amid ), ARRAY_A );
				$assign_points_earned['assign_points_earned'] = floatval( $assign_points_earned['assign_points_earned'] );
				wp_send_json( $assign_points_earned );
				break;
		}
		wp_die();
	}
}
