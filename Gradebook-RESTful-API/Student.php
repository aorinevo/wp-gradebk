<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class gradebook_student_API {
	public function __construct() {
		add_action( 'wp_ajax_student', array( $this, 'student' ) );
	}

	public function student() {
		global $wpdb;
		check_ajax_referer( 'an_gradebook_nonce', 'nonce' );
		if ( ! current_user_can( 'manage_options' ) ) {
			wp_send_json_error( 'Not Allowed.', 403 );
		}

		$table_gradebook   = an_gradebook_table( 'an_gradebook' );
		$table_assignment  = an_gradebook_table( 'an_assignment' );
		$table_assignments = an_gradebook_table( 'an_assignments' );

		$method = isset( $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] ) ? sanitize_text_field( $_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'] ) : $_SERVER['REQUEST_METHOD'];
		switch ( $method ) {
			case 'DELETE':
				parse_str( $_SERVER['QUERY_STRING'], $params );
				$delete_options = sanitize_text_field( $params['delete_options'] );
				$x              = absint( $params['id'] );
				$y              = absint( $params['gbid'] );
				switch ( $delete_options ) {
					case 'gradebook':
						$wpdb->delete( $table_gradebook, array( 'uid' => $x, 'gbid' => $y ) );
						$wpdb->delete( $table_assignment, array( 'uid' => $x, 'gbid' => $y ) );
						break;
					case 'all_gradebooks':
						$wpdb->delete( $table_gradebook, array( 'uid' => $x ) );
						$wpdb->delete( $table_assignment, array( 'uid' => $x ) );
						break;
					case 'database':
						$wpdb->delete( $table_gradebook, array( 'uid' => $x ) );
						$wpdb->delete( $table_assignment, array( 'uid' => $x ) );
						require_once( ABSPATH . 'wp-admin/includes/user.php' );
						wp_delete_user( $x );
						wp_die();
						break;
				}
				break;

			case 'PUT':
				$params = json_decode( file_get_contents( 'php://input' ), true );
				$id     = absint( $params['id'] );
				$result = wp_update_user( array(
					'ID'         => $id,
					'first_name' => sanitize_text_field( $params['firstname'] ),
					'last_name'  => sanitize_text_field( $params['lastname'] ),
				) );
				$studentDetails = get_user_by( 'id', $result );
				wp_send_json( array(
					'student' => array(
						'firstname' => $studentDetails->first_name,
						'lastname'  => $studentDetails->last_name,
						'id'        => $result,
					),
				) );
				break;

			case 'POST':
				$params = json_decode( file_get_contents( 'php://input' ), true );
				$gbid   = absint( $params['gbid'] );

				if ( ! $params['id-exists'] ) {
					$firstname  = sanitize_text_field( $params['firstname'] );
					$lastname   = sanitize_text_field( $params['lastname'] );
					$user_login = strtolower( $firstname[0] . $lastname );

					$result = wp_insert_user( array(
						'user_login' => $user_login,
						'first_name' => $firstname,
						'last_name'  => $lastname,
						'user_pass'  => wp_generate_password(),
					) );

					if ( is_wp_error( $result ) ) {
						wp_send_json_error( $result->get_error_message() );
					}

					$wpdb->update(
						$wpdb->users,
						array( 'user_login' => $user_login . $result ),
						array( 'ID' => $result )
					);

					$assignmentDetails = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table_assignments} WHERE gbid = %d", $gbid ), ARRAY_A );
					foreach ( $assignmentDetails as $assignment ) {
						$wpdb->insert( $table_assignment, array(
							'gbid'        => $gbid,
							'amid'        => $assignment['id'],
							'uid'         => $result,
							'assign_order' => $assignment['assign_order'],
						) );
					}

					$studentDetails = get_user_by( 'id', $result );
					$wpdb->insert( $table_gradebook, array( 'uid' => $studentDetails->ID, 'gbid' => $gbid ) );
					$assignments  = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table_assignment} WHERE uid = %d", $result ), ARRAY_A );
					$anGradebook  = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table_gradebook} WHERE id = %d", $wpdb->insert_id ), ARRAY_A );
					usort( $assignments, an_gradebook_build_sorter( 'assign_order' ) );
					foreach ( $assignments as &$assignmentDetail ) {
						$assignmentDetail['amid']                 = intval( $assignmentDetail['amid'] );
						$assignmentDetail['uid']                  = intval( $assignmentDetail['uid'] );
						$assignmentDetail['assign_order']         = intval( $assignmentDetail['assign_order'] );
						$assignmentDetail['assign_points_earned'] = intval( $assignmentDetail['assign_points_earned'] );
						$assignmentDetail['gbid']                 = intval( $assignmentDetail['gbid'] );
						$assignmentDetail['id']                   = intval( $assignmentDetail['id'] );
					}
					wp_send_json( array(
						'student'     => array(
							'firstname'  => $studentDetails->first_name,
							'lastname'   => $studentDetails->last_name,
							'user_login' => $studentDetails->user_login,
							'gbid'       => $gbid,
							'id'         => intval( $result ),
						),
						'assignment'  => $assignments,
						'anGradebook' => $anGradebook,
					) );
				} else {
					$studentDetails = get_user_by( 'login', sanitize_user( $params['id-exists'] ) );
					if ( $studentDetails ) {
						$wpdb->insert( $table_gradebook, array( 'uid' => $studentDetails->ID, 'gbid' => $gbid ), array( '%d', '%d' ) );
						$assignmentDetails = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table_assignments} WHERE gbid = %d", $gbid ), ARRAY_A );
						foreach ( $assignmentDetails as $assignment ) {
							$wpdb->insert( $table_assignment, array(
								'gbid'        => $gbid,
								'amid'        => $assignment['id'],
								'uid'         => $studentDetails->ID,
								'assign_order' => $assignment['assign_order'],
							) );
						}
						$anGradebook = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table_gradebook} WHERE id = %d", $wpdb->insert_id ), ARRAY_A );
						foreach ( $anGradebook as &$value ) {
							$value['gbid'] = intval( $value['gbid'] );
						}
						$assignments = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM {$table_assignment} WHERE uid = %d AND gbid = %d", $studentDetails->ID, $gbid ), ARRAY_A );
						usort( $assignments, an_gradebook_build_sorter( 'assign_order' ) );
						foreach ( $assignments as &$assignmentDetail ) {
							$assignmentDetail['amid']                 = intval( $assignmentDetail['amid'] );
							$assignmentDetail['uid']                  = intval( $assignmentDetail['uid'] );
							$assignmentDetail['assign_order']         = intval( $assignmentDetail['assign_order'] );
							$assignmentDetail['assign_points_earned'] = intval( $assignmentDetail['assign_points_earned'] );
							$assignmentDetail['gbid']                 = intval( $assignmentDetail['gbid'] );
							$assignmentDetail['id']                   = intval( $assignmentDetail['id'] );
						}
						wp_send_json( array(
							'student'     => array(
								'firstname'  => $studentDetails->first_name,
								'lastname'   => $studentDetails->last_name,
								'user_login' => $studentDetails->user_login,
								'gbid'       => $gbid,
								'id'         => $studentDetails->ID,
							),
							'assignment'  => $assignments,
							'anGradebook' => $anGradebook,
						) );
					}
				}
				break;
		}
		wp_die();
	}
}
