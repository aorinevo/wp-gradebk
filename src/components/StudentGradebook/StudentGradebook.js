import { useState, useEffect, useMemo } from '@wordpress/element';
import { fetchStudentGradebook } from '../../api/studentApi';
import StudentAssignmentHeader from './StudentAssignmentHeader';
import StudentStudentRow from './StudentStudentRow';
import AssignmentDetailsModal from '../modals/AssignmentDetailsModal';
import AssignmentStatsModal from '../modals/AssignmentStatsModal';
import StudentStatsModal from '../modals/StudentStatsModal';

export default function StudentGradebook( { courseId } ) {
	const [ data, setData ] = useState( null );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState( null );
	const [ detailsAssignment, setDetailsAssignment ] = useState( null );
	const [ statsAssignment, setStatsAssignment ] = useState( null );
	const [ showStudentStats, setShowStudentStats ] = useState( false );

	useEffect( () => {
		let cancelled = false;
		setLoading( true );

		async function load() {
			try {
				const result = await fetchStudentGradebook( courseId );
				if ( ! cancelled ) {
					setData( result );
				}
			} catch ( err ) {
				if ( ! cancelled ) {
					setError( err.message );
				}
			} finally {
				if ( ! cancelled ) {
					setLoading( false );
				}
			}
		}

		load();
		return () => {
			cancelled = true;
		};
	}, [ courseId ] );

	const sortedAssignments = useMemo( () => {
		if ( ! data?.assignments ) {
			return [];
		}
		return [ ...data.assignments ].sort(
			( a, b ) => a.assign_order - b.assign_order
		);
	}, [ data ] );

	if ( loading ) {
		return <p>Loading gradebook&hellip;</p>;
	}

	if ( error ) {
		return (
			<div className="notice notice-error">
				<p>{ error }</p>
			</div>
		);
	}

	if ( ! data ) {
		return null;
	}

	const student = Array.isArray( data.students )
		? data.students[ 0 ]
		: data.students;

	return (
		<div className="an-gb-gradebook">
			{ student && (
				<div className="an-gb-toolbar">
					<button
						type="button"
						className="button"
						onClick={ () => setShowStudentStats( true ) }
					>
						My Stats
					</button>
				</div>
			) }
			<div className="an-gb-table-wrap">
				<table className="widefat an-gb-table">
					<thead>
						<tr>
							<th className="an-gb-student-col">Student</th>
							{ sortedAssignments.map( ( a ) => (
								<StudentAssignmentHeader
									key={ a.id }
									assignment={ a }
									onDetails={ setDetailsAssignment }
									onStats={ setStatsAssignment }
								/>
							) ) }
						</tr>
					</thead>
					<tbody>
						{ student && (
							<StudentStudentRow
								student={ student }
								assignments={ sortedAssignments }
								cells={ data.cells || [] }
							/>
						) }
					</tbody>
				</table>
			</div>

			{ sortedAssignments.length === 0 && (
				<p>No visible assignments for this course.</p>
			) }

			{ detailsAssignment && (
				<AssignmentDetailsModal
					assignment={ detailsAssignment }
					onClose={ () => setDetailsAssignment( null ) }
				/>
			) }

			{ statsAssignment && (
				<AssignmentStatsModal
					assignment={ statsAssignment }
					onClose={ () => setStatsAssignment( null ) }
				/>
			) }

			{ showStudentStats && student && (
				<StudentStatsModal
					student={ student }
					gbid={ courseId }
					isStudentView={ true }
					onClose={ () => setShowStudentStats( false ) }
				/>
			) }
		</div>
	);
}
