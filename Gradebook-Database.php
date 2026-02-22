<?php
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class AN_GradeBook_Database {
	const an_gradebook_db_version = 4.0;

	public function __construct() {
		register_activation_hook( dirname( __FILE__ ) . '/GradeBook.php', array( $this, 'database_init' ) );
		register_activation_hook( dirname( __FILE__ ) . '/GradeBook.php', array( $this, 'database_alter' ) );
		add_action( 'plugins_loaded', array( $this, 'an_gradebook_upgrade_db' ) );
	}

	public function an_gradebook_upgrade_db() {
		if ( ! get_site_option( 'an_gradebook_db_version' ) ) {
			$this->database_init();
		}
		if ( self::an_gradebook_db_version > get_site_option( 'an_gradebook_db_version' ) ) {
			$this->database_alter();
		}
	}

	public function database_alter() {
		global $wpdb;

		$old_version = get_site_option( 'an_gradebook_db_version' );

		// Legacy migrations (operate on unprefixed tables for upgrades from old versions)
		if ( $old_version == 2 ) {
			$sql = "ALTER TABLE an_gradebooks CHANGE name name MEDIUMTEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
				CHANGE school school TINYTEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
				CHANGE semester semester TINYTEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL";
			$wpdb->query( $sql );
			update_option( 'an_gradebook_db_version', 3 );
			$old_version = 3;
		}

		if ( $old_version == 3 ) {
			$sql = "ALTER TABLE an_assignment CHANGE assign_points_earned assign_points_earned decimal(7,2) NOT NULL";
			$wpdb->query( $sql );
			update_option( 'an_gradebook_db_version', 3.1 );
			$old_version = 3.1;
		}

		if ( $old_version == 3.1 ) {
			$gradebooks  = $wpdb->get_results( 'SELECT * FROM an_gradebooks', ARRAY_A );
			$assignments = $wpdb->get_results( 'SELECT * FROM an_assignments', ARRAY_A );
			$cells       = $wpdb->get_results( 'SELECT * FROM an_assignment', ARRAY_A );
			foreach ( $gradebooks as $gradebook ) {
				$gbid             = $gradebook['id'];
				$assignments_temp = array_filter(
					$assignments,
					function ( $assignment ) use ( $gbid ) {
						return $assignment['gbid'] == $gbid;
					}
				);
				usort( $assignments_temp, an_gradebook_build_sorter( 'assign_order' ) );
				$i = 1;
				foreach ( $assignments_temp as &$assignment ) {
					$amid = $assignment['id'];
					$wpdb->update( 'an_assignments', array( 'assign_order' => $i ), array( 'id' => $amid ) );
					$cells_temp = array_filter(
						$cells,
						function ( $cell ) use ( $amid ) {
							return $cell['amid'] == $amid;
						}
					);
					usort( $cells_temp, an_gradebook_build_sorter( 'assign_order' ) );
					foreach ( $cells_temp as &$cell ) {
						$cid = $cell['id'];
						$wpdb->update( 'an_assignment', array( 'assign_order' => $i ), array( 'id' => $cid ) );
					}
					$i++;
				}
			}
			update_option( 'an_gradebook_db_version', 3.14 );
			$old_version = 3.14;
		}

		if ( $old_version == 3.14 ) {
			$sql = 'ALTER TABLE an_assignments ADD assign_visibility VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT "Students"';
			$wpdb->query( $sql );
			update_option( 'an_gradebook_db_version', 3.141 );
			$old_version = 3.141;
		}

		if ( $old_version == 3.141 ) {
			$result1              = $wpdb->get_col( 'SELECT uid FROM an_gradebook' );
			$result2              = $wpdb->get_col( "SELECT ID FROM {$wpdb->users}" );
			$uids_to_delete       = array_diff( $result1, $result2 );
			if ( ! empty( $uids_to_delete ) ) {
				$uids_to_delete   = array_map( 'absint', $uids_to_delete );
				$placeholders     = implode( ',', array_fill( 0, count( $uids_to_delete ), '%d' ) );
				$wpdb->query( $wpdb->prepare( "DELETE FROM an_gradebook WHERE uid IN ({$placeholders})", $uids_to_delete ) );
				$wpdb->query( $wpdb->prepare( "DELETE FROM an_assignment WHERE uid IN ({$placeholders})", $uids_to_delete ) );
			}
			update_option( 'an_gradebook_db_version', 3.1415 );
			$old_version = 3.1415;
		}

		// Migration: Rename unprefixed tables to prefixed tables (v3.1415 -> v4.0)
		if ( $old_version == 3.1415 ) {
			$old_tables = array( 'an_gradebooks', 'an_gradebook', 'an_assignments', 'an_assignment' );
			foreach ( $old_tables as $old_table ) {
				$new_table = $wpdb->prefix . $old_table;
				$old_exists = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $old_table ) );
				$new_exists = $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $new_table ) );
				if ( $old_exists === $old_table && $new_exists !== $new_table ) {
					$wpdb->query( "RENAME TABLE `{$old_table}` TO `{$new_table}`" );
				}
			}
			update_option( 'an_gradebook_db_version', self::an_gradebook_db_version );
		}
	}

	public function database_init() {
		global $wpdb;
		require_once( ABSPATH . 'wp-admin/includes/upgrade.php' );

		$charset_collate = $wpdb->get_charset_collate();

		$table_gradebooks = an_gradebook_table( 'an_gradebooks' );
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table_gradebooks ) ) != $table_gradebooks ) {
			$sql = "CREATE TABLE {$table_gradebooks} (
				id int(11) NOT NULL AUTO_INCREMENT,
				name MEDIUMTEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
				school TINYTEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
				semester TINYTEXT CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
				year int(11) NOT NULL,
				PRIMARY KEY  (id)
			) {$charset_collate}";
			dbDelta( $sql );
		}

		$table_gradebook = an_gradebook_table( 'an_gradebook' );
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table_gradebook ) ) != $table_gradebook ) {
			$sql = "CREATE TABLE {$table_gradebook} (
				id int(11) NOT NULL AUTO_INCREMENT,
				uid int(11) NOT NULL,
				gbid int(11) NOT NULL,
				PRIMARY KEY  (id)
			) {$charset_collate}";
			dbDelta( $sql );
		}

		$table_assignments = an_gradebook_table( 'an_assignments' );
		$table_columns     = array( 'id', 'gbid', 'assign_order', 'assign_name', 'assign_category', 'assign_visibility', 'assign_date', 'assign_due' );
		$table_columns_specs = array(
			'id'                => 'int(11) NOT NULL AUTO_INCREMENT',
			'gbid'              => 'int(11) NOT NULL',
			'assign_order'      => 'int(11) NOT NULL',
			'assign_name'       => 'mediumtext NOT NULL',
			'assign_category'   => 'mediumtext NOT NULL',
			'assign_visibility' => 'VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT "Students"',
			'assign_date'       => 'DATE NOT NULL DEFAULT "0000-00-00"',
			'assign_due'        => 'DATE NOT NULL DEFAULT "0000-00-00"',
		);
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table_assignments ) ) != $table_assignments ) {
			$sql = "CREATE TABLE {$table_assignments} (
				id int(11) NOT NULL AUTO_INCREMENT,
				gbid int(11) NOT NULL,
				assign_order int(11) NOT NULL,
				assign_name mediumtext NOT NULL,
				assign_category mediumtext NOT NULL,
				assign_visibility VARCHAR(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT 'Students',
				assign_date DATE NOT NULL DEFAULT '0000-00-00',
				assign_due DATE NOT NULL DEFAULT '0000-00-00',
				PRIMARY KEY  (id)
			) {$charset_collate}";
			dbDelta( $sql );
		} else {
			$an_assignments_columns = $wpdb->get_col( $wpdb->prepare(
				"SELECT column_name FROM information_schema.columns WHERE table_name = %s ORDER BY ordinal_position",
				$table_assignments
			) );
			$missing_columns = array_diff( $table_columns, $an_assignments_columns );
			if ( count( $missing_columns ) ) {
				$sql = "ALTER TABLE {$table_assignments} ";
				foreach ( $missing_columns as $missing_column ) {
					$sql .= 'ADD ' . $missing_column . ' ' . $table_columns_specs[ $missing_column ] . ', ';
				}
				$sql = rtrim( trim( $sql ), ',' );
				$wpdb->query( $sql );
			}
		}

		$table_assignment = an_gradebook_table( 'an_assignment' );
		if ( $wpdb->get_var( $wpdb->prepare( 'SHOW TABLES LIKE %s', $table_assignment ) ) != $table_assignment ) {
			$sql = "CREATE TABLE {$table_assignment} (
				id int(11) NOT NULL AUTO_INCREMENT,
				uid int(11) NOT NULL,
				gbid int(11) NOT NULL,
				amid int(11) NOT NULL,
				assign_order int(11) NOT NULL,
				assign_points_earned decimal(7,2) NOT NULL,
				PRIMARY KEY  (id)
			) {$charset_collate}";
			dbDelta( $sql );
		}

		update_option( 'an_gradebook_db_version', self::an_gradebook_db_version );
	}
}
