import { useCallback } from '@wordpress/element';
import { Assignment } from '../../types/models';
import AssignmentDropdown from './assignment-dropdown';

interface AssignmentHeaderProps {
	assignment: Assignment;
	hoveredAmid: number | null;
	onHover: ( amid: number | null ) => void;
	onSort: ( amid: number ) => void;
	onShift: ( amid: number, direction: number ) => void;
	onStats: ( assignment: Assignment ) => void;
	onEdit: ( assignment: Assignment ) => void;
	onDelete: ( assignment: Assignment ) => void;
}

export default function AssignmentHeader( {
	assignment,
	hoveredAmid,
	onHover,
	onSort,
	onShift,
	onStats,
	onEdit,
	onDelete,
}: AssignmentHeaderProps ) {
	const isHovered = hoveredAmid === assignment.id;

	const handleMouseEnter = useCallback(
		() => onHover( assignment.id ),
		[ assignment.id, onHover ]
	);
	const handleMouseLeave = useCallback( () => onHover( null ), [ onHover ] );

	return (
		<th
			className={
				'an-gb-assign-header' + ( isHovered ? ' an-gb-col-hover' : '' )
			}
			onMouseEnter={ handleMouseEnter }
			onMouseLeave={ handleMouseLeave }
		>
			<div className="an-gb-assign-header-inner">
				<AssignmentDropdown
					label={ assignment.assign_name }
					onSortAsc={ () => onSort( assignment.id ) }
					onSortDesc={ () => onSort( assignment.id ) }
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
