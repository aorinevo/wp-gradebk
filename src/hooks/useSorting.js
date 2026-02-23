import { useState, useMemo } from '@wordpress/element';

export default function useSorting( students, cells ) {
	const [ sortKey, setSortKey ] = useState( 'lastname' );
	const [ sortDir, setSortDir ] = useState( 'asc' );

	const sorted = useMemo( () => {
		const copy = [ ...students ];
		copy.sort( ( a, b ) => {
			let valA, valB;
			if ( sortKey === 'lastname' || sortKey === 'firstname' ) {
				valA = ( a[ sortKey ] || '' ).toLowerCase();
				valB = ( b[ sortKey ] || '' ).toLowerCase();
			} else {
				// sortKey is an assignment id (amid)
				const amid = parseInt( sortKey, 10 );
				const cellA = cells.find(
					( c ) => c.uid === a.id && c.amid === amid
				);
				const cellB = cells.find(
					( c ) => c.uid === b.id && c.amid === amid
				);
				valA = cellA ? cellA.assign_points_earned : 0;
				valB = cellB ? cellB.assign_points_earned : 0;
			}
			if ( valA < valB ) {
				return sortDir === 'asc' ? -1 : 1;
			}
			if ( valA > valB ) {
				return sortDir === 'asc' ? 1 : -1;
			}
			return 0;
		} );
		return copy;
	}, [ students, cells, sortKey, sortDir ] );

	function toggleSort( key ) {
		if ( sortKey === key ) {
			setSortDir( sortDir === 'asc' ? 'desc' : 'asc' );
		} else {
			setSortKey( key );
			setSortDir( 'asc' );
		}
	}

	return { sorted, sortKey, sortDir, toggleSort };
}
