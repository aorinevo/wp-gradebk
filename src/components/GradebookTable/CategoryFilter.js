import { useMemo } from '@wordpress/element';

export default function CategoryFilter( {
	assignments,
	selectedCategory,
	onChange,
} ) {
	const categories = useMemo( () => {
		const set = new Set(
			assignments.map( ( a ) => a.assign_category ).filter( Boolean )
		);
		return Array.from( set ).sort();
	}, [ assignments ] );

	if ( categories.length === 0 ) {
		return null;
	}

	return (
		<select
			className="an-gb-category-filter"
			value={ selectedCategory }
			onChange={ ( e ) => onChange( e.target.value ) }
		>
			<option value="">All Categories</option>
			{ categories.map( ( cat ) => (
				<option key={ cat } value={ cat }>
					{ cat }
				</option>
			) ) }
		</select>
	);
}
