import type React from 'react';
import { useRef, useCallback } from '@wordpress/element';

interface EditableCellProps {
	value: number;
	onSave: ( val: number ) => void;
}

export default function EditableCell( { value, onSave }: EditableCellProps ) {
	const ref = useRef< HTMLTableCellElement >( null );

	const handleBlur = useCallback( () => {
		const newVal = parseFloat( ref.current!.textContent! );
		if ( ! isNaN( newVal ) && newVal !== value ) {
			onSave( newVal );
		} else if ( isNaN( newVal ) ) {
			ref.current!.textContent = String( value );
		}
	}, [ value, onSave ] );

	const handleKeyDown = useCallback(
		( e: React.KeyboardEvent< HTMLTableCellElement > ) => {
			if ( e.key === 'Enter' ) {
				e.preventDefault();
				ref.current!.blur();
			}
			if ( e.key === 'Escape' ) {
				ref.current!.textContent = String( value );
				ref.current!.blur();
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
