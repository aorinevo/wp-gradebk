import { useCallback } from '@wordpress/element';
import AssignmentDropdown from './AssignmentDropdown';

export default function AssignmentHeader( {
	assignment,
	hoveredAmid,
	onHover,
	onSort,
	onShift,
	onStats,
	onEdit,
	onDelete,
} ) {
	const isHovered = hoveredAmid === assignment.id;

	const handleMouseEnter = useCallback(
		() => onHover( assignment.id ),
		[ assignment.id, onHover ]
	);
	const handleMouseLeave = useCallback(
		() => onHover( null ),
		[ onHover ]
	);

	return (
		<th
			className={
				'an-gb-assign-header' +
				( isHovered ? ' an-gb-col-hover' : '' )
			}
			onMouseEnter={ handleMouseEnter }
			onMouseLeave={ handleMouseLeave }
		>
			<div className="an-gb-assign-header-inner">
				<AssignmentDropdown
					label={ assignment.assign_name }
					onSortAsc={ () => onSort( assignment.id, 'asc' ) }
					onSortDesc={ () => onSort( assignment.id, 'desc' ) }
					onShiftLeft={ () => onShift( assignment.id, -1 ) }
					onShiftRight={ () => onShift( assignment.id, 1 ) }
					onStats={ () => onStats( assignment ) }
					onEdit={ () => onEdit( assignment ) }
					onDelete={ () => onDelete( assignment ) }
				/>
			</div>
		</th>
	);
}
