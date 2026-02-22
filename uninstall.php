<?php
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

global $wpdb;

$tables = array( 'an_gradebooks', 'an_gradebook', 'an_assignments', 'an_assignment' );
foreach ( $tables as $table ) {
	$wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}{$table}" );
	// Also drop unprefixed tables from older versions.
	$wpdb->query( "DROP TABLE IF EXISTS {$table}" );
}

$wpdb->query(
	$wpdb->prepare(
		"DELETE FROM $wpdb->options WHERE option_name = %s",
		'an_gradebook_db_version'
	)
);
