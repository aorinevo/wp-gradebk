import { Assignment, Student, Cell } from '../../types/models';
import ReadOnlyCell from './read-only-cell';

interface StudentStudentRowProps {
	student: Student;
	assignments: Assignment[];
	cells: Cell[];
}

export default function StudentStudentRow( {
	student,
	assignments,
	cells,
}: StudentStudentRowProps ) {
	const studentCells = cells.filter( ( c ) => c.uid === student.id );

	return (
		<tr>
			<td className="an-gb-student-name">
				{ student.lastname }, { student.firstname }
			</td>
			{ assignments.map( ( assignment ) => {
				const cell = studentCells.find(
					( c ) => c.amid === assignment.id
				);
				const value = cell ? cell.assign_points_earned : 0;
				return (
					<ReadOnlyCell
						key={ `${ student.id }-${ assignment.id }` }
						value={ value }
					/>
				);
			} ) }
		</tr>
	);
}
