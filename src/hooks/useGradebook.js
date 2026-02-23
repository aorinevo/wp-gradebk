import { useEffect } from '@wordpress/element';
import { useGradebook as useGradebookContext } from '../context/GradebookContext';
import { SET_GRADEBOOK, SET_LOADING, SET_ERROR } from '../context/actions';
import { fetchGradebook } from '../api/gradebook';

export default function useGradebookData( courseId ) {
	const { dispatch } = useGradebookContext();

	useEffect( () => {
		if ( ! courseId ) {
			return;
		}

		let cancelled = false;

		async function load() {
			dispatch( { type: SET_LOADING, payload: true } );
			try {
				const data = await fetchGradebook( courseId );
				if ( ! cancelled ) {
					dispatch( { type: SET_GRADEBOOK, payload: data } );
				}
			} catch ( err ) {
				if ( ! cancelled ) {
					dispatch( { type: SET_ERROR, payload: err.message } );
				}
			}
		}

		load();

		return () => {
			cancelled = true;
		};
	}, [ courseId, dispatch ] );
}
