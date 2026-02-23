import { useEffect } from '@wordpress/element';
import { useGradebook as useGradebookContext } from '../context/gradebook-context';
import { SET_GRADEBOOK, SET_LOADING, SET_ERROR } from '../context/actions';
import { fetchGradebook } from '../api/gradebook';
import type { GradebookData } from '../types/models';

export default function useGradebookData( courseId: number | null ): void {
	const { dispatch } = useGradebookContext();

	useEffect( () => {
		if ( ! courseId ) {
			return;
		}

		let cancelled = false;

		async function load() {
			dispatch( { type: SET_LOADING, payload: true } );
			try {
				const data: GradebookData = await fetchGradebook(
					courseId as number
				);
				if ( ! cancelled ) {
					dispatch( { type: SET_GRADEBOOK, payload: data } );
				}
			} catch ( err ) {
				if ( ! cancelled ) {
					dispatch( {
						type: SET_ERROR,
						payload: ( err as Error ).message,
					} );
				}
			}
		}

		load();

		return () => {
			cancelled = true;
		};
	}, [ courseId, dispatch ] );
}
