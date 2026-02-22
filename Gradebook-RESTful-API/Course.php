<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class gradebook_course_API {
	public function __construct() {
		add_action( 'wp_ajax_course', array( $this, 'course' ) );
	}

	public function course() {
		global $wpdb;
		check_ajax_referer( 'an_gradebook_nonce', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( 'Not Allowed.', 403 );
		}

		$table_gradebooks  = an_gradebook_table( 'an_gradebooks' );
		$table_gradebook   = an_gradebook_table( 'an_gradebook' );
		$table_assignments = an_gradebook_table( 'an_assignments' );
		$table_assignment  = an_gradebook_table( 'an_assignment' );

		$method = isset( $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] ) ? sanitize_text_field( $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] ) : $_SERVER['REQUEST_METHOD'];
		switch ( $method ) {
			case 'DELETE':
				$id   = absint( $_REQUEST['id'] );
				$gbid = $id;
				$wpdb->delete( $table_gradebooks, array( 'id' => $id ) );
				$wpdb->delete( $table_gradebook, array( 'gbid' => $gbid ) );
				$wpdb->delete( $table_assignments, array( 'gbid' => $gbid ) );
				$wpdb->delete( $table_assignment, array( 'gbid' => $gbid ) );
				wp_send_json( array( 'delete_course' => 'Success' ) );
				break;

			case 'PUT':
				$params = json_decode( file_get_contents( 'php://input' ), true );
				$id     = absint( $params['id'] );
				$wpdb->update(
					$table_gradebooks,
					array(
						'name'     => sanitize_text_field( $params['name'] ),
						'school'   => sanitize_text_field( $params['school'] ),
						'semester' => sanitize_text_field( $params['semester'] ),
						'year'     => absint( $params['year'] ),
					),
					array( 'id' => $id )
				);
				$courseDetails = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table_gradebooks} WHERE id = %d", $id ), ARRAY_A );
				wp_send_json( $courseDetails );
				break;

			case 'POST':
				$params = json_decode( file_get_contents( 'php://input' ), true );
				$wpdb->insert(
					$table_gradebooks,
					array(
						'name'     => sanitize_text_field( $params['name'] ),
						'school'   => sanitize_text_field( $params['school'] ),
						'semester' => sanitize_text_field( $params['semester'] ),
						'year'     => absint( $params['year'] ),
					),
					array( '%s', '%s', '%s', '%d' )
				);
				if ( $wpdb->insert_id ) {
					$courseDetails = $wpdb->get_row( $wpdb->prepare( "SELECT * FROM {$table_gradebooks} WHERE id = %d", $wpdb->insert_id ), ARRAY_A );
					wp_send_json( $courseDetails );
				} else {
					wp_send_json_error( 'Failed to create course.' );
				}
				break;
		}
		wp_die();
	}
}
