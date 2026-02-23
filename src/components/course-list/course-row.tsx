import { Course } from '../../types/models';

interface CourseRowProps {
	course: Course;
	isSelected: boolean;
	onSelect: ( id: number ) => void;
	onEdit: () => void;
	onExport: () => void;
	onDelete: () => void;
}

export default function CourseRow( {
	course,
	isSelected,
	onSelect,
	onEdit,
	onExport,
	onDelete,
}: CourseRowProps ) {
	return (
		<tr className={ isSelected ? 'an-gb-row-selected' : '' }>
			<td
				className="title column-title has-row-actions column-primary"
				data-colname="Course"
			>
				<strong>
					<button
						type="button"
						className="button-link"
						onClick={ () => onSelect( course.id ) }
					>
						{ course.name }
					</button>
				</strong>
				<div className="row-actions">
					<span className="edit">
						<button
							type="button"
							className="button-link"
							onClick={ onEdit }
						>
							Edit
						</button>
						{ ' | ' }
					</span>
					<span className="export">
						<button
							type="button"
							className="button-link"
							onClick={ onExport }
						>
							Export CSV
						</button>
						{ ' | ' }
					</span>
					<span className="trash">
						<button
							type="button"
							className="button-link-delete"
							onClick={ onDelete }
						>
							Delete
						</button>
					</span>
				</div>
			</td>
			<td className="id column-id" data-colname="ID">
				{ course.id }
			</td>
			<td className="school column-school" data-colname="School">
				{ course.school }
			</td>
			<td className="semester column-semester" data-colname="Semester">
				{ course.semester }
			</td>
			<td className="year column-year" data-colname="Year">
				{ course.year }
			</td>
		</tr>
	);
}
