import { useState, useEffect, useCallback } from '@wordpress/element';
import { useGradebook } from '../../context/GradebookContext';
import {
	SET_COURSES,
	ADD_COURSE,
	UPDATE_COURSE,
	REMOVE_COURSE,
	SELECT_COURSE,
	SET_LOADING,
	SET_ERROR,
} from '../../context/actions';
import {
	fetchCourses,
	createCourse,
	updateCourse,
	deleteCourse,
	exportCSV,
} from '../../api/courses';
import CourseRow from './CourseRow';
import CourseFormModal from '../modals/CourseFormModal';
import ConfirmModal from '../modals/ConfirmModal';

export default function CourseList() {
	const { state, dispatch } = useGradebook();
	const { courses, selectedCourseId, loading } = state;

	const [ showForm, setShowForm ] = useState( false );
	const [ editingCourse, setEditingCourse ] = useState( null );
	const [ deletingCourse, setDeletingCourse ] = useState( null );

	const loadCourses = useCallback( async () => {
		dispatch( { type: SET_LOADING, payload: true } );
		try {
			const data = await fetchCourses();
			dispatch( { type: SET_COURSES, payload: data } );
		} catch ( err ) {
			dispatch( { type: SET_ERROR, payload: err.message } );
		}
	}, [ dispatch ] );

	useEffect( () => {
		loadCourses();
	}, [ loadCourses ] );

	async function handleCreate( data ) {
		try {
			const created = await createCourse( data );
			dispatch( { type: ADD_COURSE, payload: created } );
			setShowForm( false );
		} catch ( err ) {
			dispatch( { type: SET_ERROR, payload: err.message } );
		}
	}

	async function handleUpdate( data ) {
		try {
			const updated = await updateCourse( editingCourse.id, data );
			dispatch( { type: UPDATE_COURSE, payload: updated } );
			setEditingCourse( null );
		} catch ( err ) {
			dispatch( { type: SET_ERROR, payload: err.message } );
		}
	}

	async function handleDelete() {
		try {
			await deleteCourse( deletingCourse.id );
			dispatch( { type: REMOVE_COURSE, payload: deletingCourse.id } );
			setDeletingCourse( null );
		} catch ( err ) {
			dispatch( { type: SET_ERROR, payload: err.message } );
		}
	}

	function handleSelect( id ) {
		dispatch( {
			type: SELECT_COURSE,
			payload: selectedCourseId === id ? null : id,
		} );
	}

	if ( loading && courses.length === 0 ) {
		return <p>Loading courses&hellip;</p>;
	}

	return (
		<div className="an-gb-course-list">
			<h1 className="wp-heading-inline">GradeBooks</h1>
			<button
				type="button"
				className="page-title-action"
				onClick={ () => setShowForm( true ) }
			>
				Add Course
			</button>
			<hr className="wp-header-end" />

			{ state.error && (
				<div className="notice notice-error">
					<p>{ state.error }</p>
				</div>
			) }

			{ courses.length === 0 ? (
				<p>No courses yet. Create one to get started.</p>
			) : (
				<table className="wp-list-table widefat fixed striped table-view-list">
					<thead>
						<tr>
							<th scope="col" className="manage-column column-title column-primary">Course</th>
							<th scope="col" className="manage-column column-id">ID</th>
							<th scope="col" className="manage-column column-school">School</th>
							<th scope="col" className="manage-column column-semester">Semester</th>
							<th scope="col" className="manage-column column-year">Year</th>
						</tr>
					</thead>
					<tbody>
						{ courses.map( ( course ) => (
							<CourseRow
								key={ course.id }
								course={ course }
								isSelected={
									selectedCourseId === course.id
								}
								onSelect={ handleSelect }
								onEdit={ () => setEditingCourse( course ) }
								onExport={ () => exportCSV( course.id ) }
								onDelete={ () =>
									setDeletingCourse( course )
								}
							/>
						) ) }
					</tbody>
				</table>
			) }

			{ showForm && (
				<CourseFormModal
					onSave={ handleCreate }
					onClose={ () => setShowForm( false ) }
				/>
			) }

			{ editingCourse && (
				<CourseFormModal
					course={ editingCourse }
					onSave={ handleUpdate }
					onClose={ () => setEditingCourse( null ) }
				/>
			) }

			{ deletingCourse && (
				<ConfirmModal
					title="Delete Course"
					message={ `Are you sure you want to delete "${ deletingCourse.name }"? This will remove all students, assignments, and grades for this course.` }
					onConfirm={ handleDelete }
					onClose={ () => setDeletingCourse( null ) }
				/>
			) }
		</div>
	);
}
