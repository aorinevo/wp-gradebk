import { Course } from '../../types/models';

interface StudentCourseRowProps {
	course: Course;
	isSelected: boolean;
	onSelect: ( id: number ) => void;
}

export default function StudentCourseRow( {
	course,
	isSelected,
	onSelect,
}: StudentCourseRowProps ) {
	return (
		<tr className={ isSelected ? 'an-gb-row-selected' : '' }>
			<td>
				<button
					type="button"
					className="button-link"
					onClick={ () => onSelect( course.id ) }
				>
					<strong>{ course.name }</strong>
				</button>
			</td>
			<td>{ course.school }</td>
			<td>{ course.semester }</td>
			<td>{ course.year }</td>
		</tr>
	);
}
