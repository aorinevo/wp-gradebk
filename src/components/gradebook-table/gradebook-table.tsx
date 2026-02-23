import { useState, useMemo, useCallback } from '@wordpress/element';
import { useGradebook } from '../../context/gradebook-context';
import {
	ADD_STUDENT,
	UPDATE_STUDENT,
	REMOVE_STUDENT,
	ADD_ASSIGNMENT,
	UPDATE_ASSIGNMENT,
	REMOVE_ASSIGNMENT,
	UPDATE_CELL,
	SET_ERROR,
} from '../../context/actions';
import {
	createStudent,
	updateStudent,
	deleteStudent,
} from '../../api/students';
import {
	createAssignment,
	updateAssignment,
	deleteAssignment,
} from '../../api/assignments';
import { updateCell } from '../../api/cells';
import { Assignment, Cell, Student } from '../../types/models';
import useGradebookData from '../../hooks/use-gradebook';
import useSorting from '../../hooks/use-sorting';
import GradebookToolbar from './gradebook-toolbar';
import AssignmentHeader from './assignment-header';
import StudentRow from './student-row';
import StudentFormModal from '../modals/student-form-modal';
import AssignmentFormModal from '../modals/assignment-form-modal';
import DeleteStudentModal from '../modals/delete-student-modal';
import ConfirmModal from '../modals/confirm-modal';
import AssignmentStatsModal from '../modals/assignment-stats-modal';
import StudentStatsModal from '../modals/student-stats-modal';

interface GradebookTableProps {
	courseId: number;
}

export default function GradebookTable( { courseId }: GradebookTableProps ) {
	const { state, dispatch } = useGradebook();
	const { students, assignments, cells, loading } = state;

	useGradebookData( courseId );

	const [ categoryFilter, setCategoryFilter ] = useState( '' );
	const [ hoveredAmid, setHoveredAmid ] = useState< number | null >( null );

	// Modals
	const [ showStudentForm, setShowStudentForm ] = useState( false );
	const [ editingStudent, setEditingStudent ] = useState< Student | null >(
		null
	);
	const [ deletingStudent, setDeletingStudent ] = useState< Student | null >(
		null
	);
	const [ showAssignmentForm, setShowAssignmentForm ] = useState( false );
	const [ editingAssignment, setEditingAssignment ] =
		useState< Assignment | null >( null );
	const [ deletingAssignment, setDeletingAssignment ] =
		useState< Assignment | null >( null );
	const [ statsAssignment, setStatsAssignment ] =
		useState< Assignment | null >( null );
	const [ statsStudent, setStatsStudent ] = useState< Student | null >(
		null
	);

	// Sort + filter
	const filteredAssignments = useMemo( () => {
		const sorted = [ ...assignments ].sort(
			( a, b ) => a.assign_order - b.assign_order
		);
		if ( ! categoryFilter ) {
			return sorted;
		}
		return sorted.filter( ( a ) => a.assign_category === categoryFilter );
	}, [ assignments, categoryFilter ] );

	const { sorted: sortedStudents, toggleSort } = useSorting(
		students,
		cells
	);

	// --- Handlers ---

	const handleCellSave = useCallback(
		async ( data: {
			uid: number;
			amid: number;
			assign_order: number;
			assign_points_earned: number;
		} ) => {
			try {
				const cellData = { ...data, gbid: courseId };
				await updateCell( cellData );
				dispatch( { type: UPDATE_CELL, payload: cellData as Cell } );
			} catch ( err ) {
				dispatch( {
					type: SET_ERROR,
					payload:
						err instanceof Error
							? err.message
							: 'An error occurred',
				} );
			}
		},
		[ courseId, dispatch ]
	);

	async function handleCreateStudent(
		data:
			| { firstname: string; lastname: string }
			| { existing_user_login: string }
	) {
		try {
			const result = await createStudent( {
				...( data as Omit< Student, 'id' > ),
				gbid: courseId,
			} );
			dispatch( {
				type: ADD_STUDENT,
				payload: {
					student: result.student,
					cells: result.cells || [],
				},
			} );
			setShowStudentForm( false );
		} catch ( err ) {
			dispatch( {
				type: SET_ERROR,
				payload:
					err instanceof Error ? err.message : 'An error occurred',
			} );
		}
	}

	async function handleUpdateStudent(
		data:
			| { firstname: string; lastname: string }
			| { existing_user_login: string }
	) {
		if ( ! editingStudent ) {
			return;
		}
		try {
			const result = await updateStudent(
				editingStudent.id,
				data as Partial< Student >
			);
			dispatch( { type: UPDATE_STUDENT, payload: result } );
			setEditingStudent( null );
		} catch ( err ) {
			dispatch( {
				type: SET_ERROR,
				payload:
					err instanceof Error ? err.message : 'An error occurred',
			} );
		}
	}

	async function handleDeleteStudent( option: string ) {
		if ( ! deletingStudent ) {
			return;
		}
		try {
			await deleteStudent( deletingStudent.id, courseId, option );
			dispatch( {
				type: REMOVE_STUDENT,
				payload: deletingStudent.id,
			} );
			setDeletingStudent( null );
		} catch ( err ) {
			dispatch( {
				type: SET_ERROR,
				payload:
					err instanceof Error ? err.message : 'An error occurred',
			} );
		}
	}

	async function handleCreateAssignment( data: {
		assign_name: string;
		assign_date: string;
		assign_due: string;
		assign_category: string;
		assignVisibilityOptions: string;
		assign_order?: number;
	} ) {
		try {
			const { assignVisibilityOptions, ...rest } = data;
			const result = await createAssignment( {
				...rest,
				assign_visibility: assignVisibilityOptions,
				assign_order: data.assign_order ?? 0,
				gbid: courseId,
			} );
			dispatch( { type: ADD_ASSIGNMENT, payload: result } );
			setShowAssignmentForm( false );
		} catch ( err ) {
			dispatch( {
				type: SET_ERROR,
				payload:
					err instanceof Error ? err.message : 'An error occurred',
			} );
		}
	}

	async function handleUpdateAssignment( data: {
		assign_name: string;
		assign_date: string;
		assign_due: string;
		assign_category: string;
		assignVisibilityOptions: string;
		assign_order?: number;
	} ) {
		if ( ! editingAssignment ) {
			return;
		}
		try {
			const { assignVisibilityOptions, ...rest } = data;
			const result = await updateAssignment( editingAssignment.id, {
				...rest,
				assign_visibility: assignVisibilityOptions,
			} );
			dispatch( { type: UPDATE_ASSIGNMENT, payload: result } );
			setEditingAssignment( null );
		} catch ( err ) {
			dispatch( {
				type: SET_ERROR,
				payload:
					err instanceof Error ? err.message : 'An error occurred',
			} );
		}
	}

	async function handleDeleteAssignment() {
		if ( ! deletingAssignment ) {
			return;
		}
		try {
			await deleteAssignment( deletingAssignment.id );
			dispatch( {
				type: REMOVE_ASSIGNMENT,
				payload: deletingAssignment.id,
			} );
			setDeletingAssignment( null );
		} catch ( err ) {
			dispatch( {
				type: SET_ERROR,
				payload:
					err instanceof Error ? err.message : 'An error occurred',
			} );
		}
	}

	async function handleShift( amid: number, direction: number ) {
		const sorted = [ ...assignments ].sort(
			( a, b ) => a.assign_order - b.assign_order
		);
		const idx = sorted.findIndex( ( a ) => a.id === amid );
		const swapIdx = idx + direction;
		if ( swapIdx < 0 || swapIdx >= sorted.length ) {
			return;
		}

		const current = sorted[ idx ];
		const neighbor = sorted[ swapIdx ];

		try {
			const [ updatedCurrent, updatedNeighbor ] = await Promise.all( [
				updateAssignment( current.id, {
					...current,
					assign_order: neighbor.assign_order,
				} ),
				updateAssignment( neighbor.id, {
					...neighbor,
					assign_order: current.assign_order,
				} ),
			] );
			dispatch( {
				type: UPDATE_ASSIGNMENT,
				payload: updatedCurrent,
			} );
			dispatch( {
				type: UPDATE_ASSIGNMENT,
				payload: updatedNeighbor,
			} );
		} catch ( err ) {
			dispatch( {
				type: SET_ERROR,
				payload:
					err instanceof Error ? err.message : 'An error occurred',
			} );
		}
	}

	function handleSort( amid: number ) {
		toggleSort( String( amid ) );
	}

	if ( loading ) {
		return <p>Loading gradebook&hellip;</p>;
	}

	return (
		<div className="an-gb-gradebook">
			<GradebookToolbar
				assignments={ assignments }
				selectedCategory={ categoryFilter }
				onCategoryChange={ setCategoryFilter }
				onAddStudent={ () => setShowStudentForm( true ) }
				onAddAssignment={ () => setShowAssignmentForm( true ) }
			/>

			<div className="an-gb-table-wrap">
				<table className="widefat striped an-gb-table">
					<thead>
						<tr>
							<th
								scope="col"
								className="manage-column an-gb-student-col"
							>
								Last Name
							</th>
							<th
								scope="col"
								className="manage-column an-gb-student-col"
							>
								First Name
							</th>
							{ filteredAssignments.map( ( a ) => (
								<AssignmentHeader
									key={ a.id }
									assignment={ a }
									hoveredAmid={ hoveredAmid }
									onHover={ setHoveredAmid }
									onSort={ handleSort }
									onShift={ handleShift }
									onStats={ setStatsAssignment }
									onEdit={ setEditingAssignment }
									onDelete={ setDeletingAssignment }
								/>
							) ) }
						</tr>
					</thead>
					<tbody>
						{ sortedStudents.map( ( student ) => (
							<StudentRow
								key={ student.id }
								student={ student }
								assignments={ filteredAssignments }
								cells={ cells }
								onCellSave={ handleCellSave }
								onEditStudent={ setEditingStudent }
								onStatsStudent={ setStatsStudent }
								onDeleteStudent={ setDeletingStudent }
							/>
						) ) }
					</tbody>
				</table>
			</div>

			{ students.length === 0 && assignments.length === 0 && (
				<p>
					No students or assignments yet. Use the buttons above to add
					them.
				</p>
			) }

			{ /* Modals */ }
			{ showStudentForm && (
				<StudentFormModal
					onSave={ handleCreateStudent }
					onClose={ () => setShowStudentForm( false ) }
				/>
			) }

			{ editingStudent && (
				<StudentFormModal
					student={ editingStudent }
					onSave={ handleUpdateStudent }
					onClose={ () => setEditingStudent( null ) }
				/>
			) }

			{ deletingStudent && (
				<DeleteStudentModal
					student={ deletingStudent }
					onConfirm={ handleDeleteStudent }
					onClose={ () => setDeletingStudent( null ) }
				/>
			) }

			{ showAssignmentForm && (
				<AssignmentFormModal
					onSave={ handleCreateAssignment }
					onClose={ () => setShowAssignmentForm( false ) }
				/>
			) }

			{ editingAssignment && (
				<AssignmentFormModal
					assignment={ editingAssignment }
					onSave={ handleUpdateAssignment }
					onClose={ () => setEditingAssignment( null ) }
				/>
			) }

			{ deletingAssignment && (
				<ConfirmModal
					title="Delete Assignment"
					message={ `Are you sure you want to delete "${ deletingAssignment.assign_name }"? All grades for this assignment will be removed.` }
					onConfirm={ handleDeleteAssignment }
					onClose={ () => setDeletingAssignment( null ) }
				/>
			) }

			{ statsAssignment && (
				<AssignmentStatsModal
					assignment={ statsAssignment }
					onClose={ () => setStatsAssignment( null ) }
				/>
			) }

			{ statsStudent && (
				<StudentStatsModal
					student={ statsStudent }
					gbid={ courseId }
					isStudentView={ false }
					onClose={ () => setStatsStudent( null ) }
				/>
			) }
		</div>
	);
}
