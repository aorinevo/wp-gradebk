import { createContext, useContext, useReducer } from '@wordpress/element';
import {
	SET_COURSES,
	ADD_COURSE,
	UPDATE_COURSE,
	REMOVE_COURSE,
	SELECT_COURSE,
	SET_GRADEBOOK,
	SET_LOADING,
	SET_ERROR,
	ADD_STUDENT,
	UPDATE_STUDENT,
	REMOVE_STUDENT,
	ADD_ASSIGNMENT,
	UPDATE_ASSIGNMENT,
	REMOVE_ASSIGNMENT,
	UPDATE_CELL,
} from './actions';

const GradebookContext = createContext();

const initialState = {
	courses: [],
	selectedCourseId: null,
	students: [],
	assignments: [],
	cells: [],
	userRole: window.anGradebookSettings?.userRole || 'student',
	loading: false,
	error: null,
};

function gradebookReducer( state, action ) {
	switch ( action.type ) {
		case SET_LOADING:
			return { ...state, loading: action.payload };

		case SET_ERROR:
			return { ...state, error: action.payload, loading: false };

		case SET_COURSES:
			return { ...state, courses: action.payload, loading: false };

		case ADD_COURSE:
			return { ...state, courses: [ ...state.courses, action.payload ] };

		case UPDATE_COURSE:
			return {
				...state,
				courses: state.courses.map( ( c ) =>
					c.id === action.payload.id ? action.payload : c
				),
			};

		case REMOVE_COURSE:
			return {
				...state,
				courses: state.courses.filter( ( c ) => c.id !== action.payload ),
				selectedCourseId:
					state.selectedCourseId === action.payload
						? null
						: state.selectedCourseId,
			};

		case SELECT_COURSE:
			return { ...state, selectedCourseId: action.payload };

		case SET_GRADEBOOK:
			return {
				...state,
				students: action.payload.students,
				assignments: action.payload.assignments,
				cells: action.payload.cells,
				loading: false,
			};

		case ADD_STUDENT:
			return {
				...state,
				students: [ ...state.students, action.payload.student ],
				cells: [ ...state.cells, ...( action.payload.cells || [] ) ],
			};

		case UPDATE_STUDENT:
			return {
				...state,
				students: state.students.map( ( s ) =>
					s.id === action.payload.id ? { ...s, ...action.payload } : s
				),
			};

		case REMOVE_STUDENT:
			return {
				...state,
				students: state.students.filter(
					( s ) => s.id !== action.payload
				),
				cells: state.cells.filter(
					( c ) => c.uid !== action.payload
				),
			};

		case ADD_ASSIGNMENT:
			return {
				...state,
				assignments: [
					...state.assignments,
					action.payload.assignmentDetails,
				],
				cells: [
					...state.cells,
					...( action.payload.assignmentStudents || [] ),
				],
			};

		case UPDATE_ASSIGNMENT:
			return {
				...state,
				assignments: state.assignments.map( ( a ) =>
					a.id === action.payload.id ? action.payload : a
				),
			};

		case REMOVE_ASSIGNMENT:
			return {
				...state,
				assignments: state.assignments.filter(
					( a ) => a.id !== action.payload
				),
				cells: state.cells.filter(
					( c ) => c.amid !== action.payload
				),
			};

		case UPDATE_CELL:
			return {
				...state,
				cells: state.cells.map( ( c ) =>
					c.uid === action.payload.uid &&
					c.amid === action.payload.amid
						? { ...c, ...action.payload }
						: c
				),
			};

		default:
			return state;
	}
}

export function GradebookProvider( { children } ) {
	const [ state, dispatch ] = useReducer( gradebookReducer, initialState );

	return (
		<GradebookContext.Provider value={ { state, dispatch } }>
			{ children }
		</GradebookContext.Provider>
	);
}

export function useGradebook() {
	const context = useContext( GradebookContext );
	if ( ! context ) {
		throw new Error(
			'useGradebook must be used within a GradebookProvider'
		);
	}
	return context;
}
