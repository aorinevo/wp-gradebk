import EditableCell from './EditableCell';

export default function StudentRow( {
	student,
	assignments,
	cells,
	hoveredAmid,
	onHoverCell,
	onCellSave,
	onEditStudent,
	onStatsStudent,
	onDeleteStudent,
} ) {
	const studentCells = cells.filter( ( c ) => c.uid === student.id );

	return (
		<tr>
			<td className="an-gb-student-name has-row-actions">
				<strong>{ student.lastname }</strong>
				<div className="row-actions">
					<span className="edit">
						<button type="button" className="button-link" onClick={ () => onEditStudent( student ) }>
							Edit
						</button>
						{ ' | ' }
					</span>
					<span className="stats">
						<button type="button" className="button-link" onClick={ () => onStatsStudent( student ) }>
							Stats
						</button>
						{ ' | ' }
					</span>
					<span className="trash">
						<button type="button" className="button-link-delete" onClick={ () => onDeleteStudent( student ) }>
							Delete
						</button>
					</span>
				</div>
			</td>
			<td className="an-gb-student-name">
				{ student.firstname }
			</td>
			{ assignments.map( ( assignment ) => {
				const cell = studentCells.find(
					( c ) => c.amid === assignment.id
				);
				const value = cell ? cell.assign_points_earned : 0;
				return (
					<EditableCell
						key={ `${ student.id }-${ assignment.id }` }
						value={ value }
						onSave={ ( newVal ) =>
							onCellSave( {
								uid: student.id,
								amid: assignment.id,
								assign_order: assignment.assign_order,
								assign_points_earned: newVal,
							} )
						}
					/>
				);
			} ) }
		</tr>
	);
}
