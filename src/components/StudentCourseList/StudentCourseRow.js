export default function StudentCourseRow( {
	course,
	isSelected,
	onSelect,
} ) {
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
			<td>{ course.description }</td>
		</tr>
	);
}
