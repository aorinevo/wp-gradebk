import { Assignment } from '../../types/models';

interface StudentAssignmentHeaderProps {
	assignment: Assignment;
	onDetails: ( assignment: Assignment ) => void;
	onStats: ( assignment: Assignment ) => void;
}

export default function StudentAssignmentHeader( {
	assignment,
	onDetails,
	onStats,
}: StudentAssignmentHeaderProps ) {
	return (
		<th className="an-gb-assign-header">
			<div className="an-gb-assign-header-inner">
				<span
					className="an-gb-assign-name"
					title={ assignment.assign_name }
				>
					{ assignment.assign_name }
				</span>
				<div className="an-gb-header-buttons">
					<button
						type="button"
						className="button an-gb-btn-sm"
						onClick={ () => onStats( assignment ) }
					>
						Stats
					</button>
					<button
						type="button"
						className="button an-gb-btn-sm"
						onClick={ () => onDetails( assignment ) }
					>
						Details
					</button>
				</div>
			</div>
		</th>
	);
}
