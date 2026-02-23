import { Assignment } from '../../types/models';
import CategoryFilter from './category-filter';

interface GradebookToolbarProps {
	assignments: Assignment[];
	selectedCategory: string;
	onCategoryChange: ( category: string ) => void;
	onAddStudent: () => void;
	onAddAssignment: () => void;
}

export default function GradebookToolbar( {
	assignments,
	selectedCategory,
	onCategoryChange,
	onAddStudent,
	onAddAssignment,
}: GradebookToolbarProps ) {
	return (
		<div className="an-gb-gradebook-toolbar">
			<h2 className="wp-heading-inline">Gradebook</h2>
			<button
				type="button"
				className="page-title-action"
				onClick={ onAddStudent }
			>
				Add Student
			</button>
			<button
				type="button"
				className="page-title-action"
				onClick={ onAddAssignment }
			>
				Add Assignment
			</button>
			<hr className="wp-header-end" />
			<CategoryFilter
				assignments={ assignments }
				selectedCategory={ selectedCategory }
				onChange={ onCategoryChange }
			/>
		</div>
	);
}
