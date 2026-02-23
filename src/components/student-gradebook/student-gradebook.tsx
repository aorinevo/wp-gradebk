import { useState, useEffect, useMemo } from '@wordpress/element';
import { fetchStudentGradebook } from '../../api/student-view';
import { Assignment, GradebookData } from '../../types/models';
import StudentAssignmentHeader from './student-assignment-header';
import StudentStudentRow from './student-row';
import AssignmentDetailsModal from '../modals/assignment-details-modal';
import AssignmentStatsModal from '../modals/assignment-stats-modal';
import StudentStatsModal from '../modals/student-stats-modal';

interface StudentGradebookProps {
	courseId: number;
}

export default function StudentGradebook( {
	courseId,
}: StudentGradebookProps ) {
	const [ data, setData ] = useState< GradebookData | null >( null );
	const [ loading, setLoading ] = useState( true );
	const [ error, setError ] = useState< string | null >( null );
	const [ detailsAssignment, setDetailsAssignment ] =
		useState< Assignment | null >( null );
	const [ statsAssignment, setStatsAssignment ] =
		useState< Assignment | null >( null );
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
					setError(
						err instanceof Error
							? err.message
							: 'Failed to load gradebook'
					);
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
