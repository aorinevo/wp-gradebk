import { useState, useMemo, useCallback } from '@wordpress/element';
import { useGradebook } from '../../context/GradebookContext';
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
import { createStudent, updateStudent, deleteStudent } from '../../api/students';
import {
	createAssignment,
	updateAssignment,
	deleteAssignment,
} from '../../api/assignments';
import { updateCell } from '../../api/cells';
import useGradebookData from '../../hooks/useGradebook';
import useSorting from '../../hooks/useSorting';
import GradebookToolbar from './GradebookToolbar';
import AssignmentHeader from './AssignmentHeader';
import StudentRow from './StudentRow';
import StudentFormModal from '../modals/StudentFormModal';
import AssignmentFormModal from '../modals/AssignmentFormModal';
import DeleteStudentModal from '../modals/DeleteStudentModal';
import ConfirmModal from '../modals/ConfirmModal';
import AssignmentStatsModal from '../modals/AssignmentStatsModal';
import StudentStatsModal from '../modals/StudentStatsModal';

export default function GradebookTable( { courseId } ) {
	const { state, dispatch } = useGradebook();
	const { students, assignments, cells, loading } = state;

	useGradebookData( courseId );

	const [ categoryFilter, setCategoryFilter ] = useState( '' );
	const [ hoveredAmid, setHoveredAmid ] = useState( null );

	// Modals
	const [ showStudentForm, setShowStudentForm ] = useState( false );
	const [ editingStudent, setEditingStudent ] = useState( null );
	const [ deletingStudent, setDeletingStudent ] = useState( null );
	const [ showAssignmentForm, setShowAssignmentForm ] = useState( false );
	const [ editingAssignment, setEditingAssignment ] = useState( null );
	const [ deletingAssignment, setDeletingAssignment ] = useState( null );
	const [ statsAssignment, setStatsAssignment ] = useState( null );
	const [ statsStudent, setStatsStudent ] = useState( null );

	// Sort + filter
	const filteredAssignments = useMemo( () => {
		const sorted = [ ...assignments ].sort(
			( a, b ) => a.assign_order - b.assign_order
		);
		if ( ! categoryFilter ) {
			return sorted;
		}
		return sorted.filter(
			( a ) => a.assign_category === categoryFilter
		);
	}, [ assignments, categoryFilter ] );

	const { sorted: sortedStudents, toggleSort } = useSorting(
		students,
		cells
	);

	// --- Handlers ---

	const handleCellSave = useCallback(
		async ( data ) => {
			try {
				await updateCell( data );
				dispatch( { type: UPDATE_CELL, payload: data } );
			} catch ( err ) {
				dispatch( { type: SET_ERROR, payload: err.message } );
			}
		},
		[ dispatch ]
	);

	async function handleCreateStudent( data ) {
		try {
			const result = await createStudent( {
				...data,
				gbid: courseId,
			} );
			dispatch( {
				type: ADD_STUDENT,
				payload: {
					student: result.student,
					cells: result.assignment || [],
				},
			} );
			setShowStudentForm( false );
		} catch ( err ) {
			dispatch( { type: SET_ERROR, payload: err.message } );
		}
	}

	async function handleUpdateStudent( data ) {
		try {
			const result = await updateStudent( editingStudent.id, data );
			dispatch( { type: UPDATE_STUDENT, payload: result.student } );
			setEditingStudent( null );
		} catch ( err ) {
			dispatch( { type: SET_ERROR, payload: err.message } );
		}
	}

	async function handleDeleteStudent( option ) {
		try {
			await deleteStudent( deletingStudent.id, courseId, option );
			dispatch( {
				type: REMOVE_STUDENT,
				payload: deletingStudent.id,
			} );
			setDeletingStudent( null );
		} catch ( err ) {
			dispatch( { type: SET_ERROR, payload: err.message } );
		}
	}

	async function handleCreateAssignment( data ) {
		try {
			const result = await createAssignment( {
				...data,
				gbid: courseId,
			} );
			dispatch( { type: ADD_ASSIGNMENT, payload: result } );
			setShowAssignmentForm( false );
		} catch ( err ) {
			dispatch( { type: SET_ERROR, payload: err.message } );
		}
	}

	async function handleUpdateAssignment( data ) {
		try {
			const result = await updateAssignment(
				editingAssignment.id,
				data
			);
			dispatch( { type: UPDATE_ASSIGNMENT, payload: result } );
			setEditingAssignment( null );
		} catch ( err ) {
			dispatch( { type: SET_ERROR, payload: err.message } );
		}
	}

	async function handleDeleteAssignment() {
		try {
			await deleteAssignment( deletingAssignment.id );
			dispatch( {
				type: REMOVE_ASSIGNMENT,
				payload: deletingAssignment.id,
			} );
			setDeletingAssignment( null );
		} catch ( err ) {
			dispatch( { type: SET_ERROR, payload: err.message } );
		}
	}

	async function handleShift( amid, direction ) {
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
					assign_visibility_options: current.assign_visibility,
				} ),
				updateAssignment( neighbor.id, {
					...neighbor,
					assign_order: current.assign_order,
					assign_visibility_options: neighbor.assign_visibility,
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
			dispatch( { type: SET_ERROR, payload: err.message } );
		}
	}

	function handleSort( amid, dir ) {
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
							<th scope="col" className="manage-column an-gb-student-col">Last Name</th>
							<th scope="col" className="manage-column an-gb-student-col">First Name</th>
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
								hoveredAmid={ hoveredAmid }
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
					No students or assignments yet. Use the buttons above to
					add them.
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
