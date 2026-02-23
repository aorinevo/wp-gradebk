import { useRef, useCallback } from '@wordpress/element';

export default function EditableCell( { value, onSave } ) {
	const ref = useRef();

	const handleBlur = useCallback( () => {
		const newVal = parseFloat( ref.current.textContent );
		if ( ! isNaN( newVal ) && newVal !== value ) {
			onSave( newVal );
		} else if ( isNaN( newVal ) ) {
			ref.current.textContent = value;
		}
	}, [ value, onSave ] );

	const handleKeyDown = useCallback(
		( e ) => {
			if ( e.key === 'Enter' ) {
				e.preventDefault();
				ref.current.blur();
			}
			if ( e.key === 'Escape' ) {
				ref.current.textContent = value;
				ref.current.blur();
			}
		},
		[ value ]
	);

	return (
		<td
			ref={ ref }
			className="an-gb-cell"
			contentEditable
			suppressContentEditableWarning
			onBlur={ handleBlur }
			onKeyDown={ handleKeyDown }
		>
			{ value }
		</td>
	);
}
