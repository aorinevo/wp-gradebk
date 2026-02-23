export interface Course {
	id: number;
	name: string;
	school: string;
	semester: string;
	year: number;
}

export interface Assignment {
	id: number;
	gbid: number;
	assign_order: number;
	assign_name: string;
	assign_category: string;
	assign_visibility: string;
	assign_date: string;
	assign_due: string;
}

export interface Student {
	id: number;
	gbid: number;
	firstname: string;
	lastname: string;
	user_login: string;
}

export interface Cell {
	id: number;
	uid: number;
	gbid: number;
	amid: number;
	assign_order: number;
	assign_points_earned: number;
}

export interface GradebookData {
	assignments: Assignment[];
	cells: Cell[];
	students: Student[] | Student;
}

export interface GradebookState {
	courses: Course[];
	selectedCourseId: number | null;
	students: Student[];
	assignments: Assignment[];
	cells: Cell[];
	userRole: string;
	loading: boolean;
	error: string | null;
}

export type GradebookAction =
	| { type: 'SET_LOADING'; payload: boolean }
	| { type: 'SET_ERROR'; payload: string }
	| { type: 'SET_COURSES'; payload: Course[] }
	| { type: 'ADD_COURSE'; payload: Course }
	| { type: 'UPDATE_COURSE'; payload: Course }
	| { type: 'REMOVE_COURSE'; payload: number }
	| { type: 'SELECT_COURSE'; payload: number | null }
	| { type: 'SET_GRADEBOOK'; payload: GradebookData }
	| { type: 'ADD_STUDENT'; payload: { student: Student; cells: Cell[] } }
	| { type: 'UPDATE_STUDENT'; payload: Student }
	| { type: 'REMOVE_STUDENT'; payload: number }
	| {
			type: 'ADD_ASSIGNMENT';
			payload: {
				assignmentDetails: Assignment;
				assignmentStudents: Cell[];
			};
	  }
	| { type: 'UPDATE_ASSIGNMENT'; payload: Assignment }
	| { type: 'REMOVE_ASSIGNMENT'; payload: number }
	| { type: 'UPDATE_CELL'; payload: Cell };

export interface GradebookContextValue {
	state: GradebookState;
	dispatch: React.Dispatch< GradebookAction >;
}
