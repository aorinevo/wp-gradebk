import { useState, useRef, useEffect, createPortal } from '@wordpress/element';

export default function AssignmentDropdown( {
	label,
	onSortAsc,
	onSortDesc,
	onShiftLeft,
	onShiftRight,
	onStats,
	onEdit,
	onDelete,
} ) {
	const [ open, setOpen ] = useState( false );
	const [ menuPos, setMenuPos ] = useState( {} );
	const buttonRef = useRef();
	const menuRef = useRef();

	useEffect( () => {
		if ( open && buttonRef.current ) {
			const rect = buttonRef.current.getBoundingClientRect();
			setMenuPos( {
				top: rect.bottom,
				left: rect.left,
			} );
		}
	}, [ open ] );

	useEffect( () => {
		function handleClickOutside( e ) {
			if (
				buttonRef.current &&
				! buttonRef.current.contains( e.target ) &&
				menuRef.current &&
				! menuRef.current.contains( e.target )
			) {
				setOpen( false );
			}
		}
		if ( open ) {
			document.addEventListener( 'mousedown', handleClickOutside );
		}
		return () =>
			document.removeEventListener( 'mousedown', handleClickOutside );
	}, [ open ] );

	function close( fn ) {
		return () => {
			setOpen( false );
			fn();
		};
	}

	return (
		<>
			<button
				ref={ buttonRef }
				type="button"
				className="button an-gb-btn-sm"
				onClick={ () => setOpen( ! open ) }
			>
				{ label } &#9662;
			</button>
			{ open &&
				createPortal(
					<ul
						ref={ menuRef }
						className="an-gb-col-menu"
						style={ { top: menuPos.top, left: menuPos.left } }
					>
						<li>
							<button type="button" onClick={ close( onSortAsc ) }>Sort Ascending</button>
						</li>
						<li>
							<button type="button" onClick={ close( onSortDesc ) }>Sort Descending</button>
						</li>
						<li className="an-gb-col-menu-sep" />
						<li>
							<button type="button" onClick={ close( onShiftLeft ) }>Move Left</button>
						</li>
						<li>
							<button type="button" onClick={ close( onShiftRight ) }>Move Right</button>
						</li>
						<li className="an-gb-col-menu-sep" />
						<li>
							<button type="button" onClick={ close( onStats ) }>Stats</button>
						</li>
						<li>
							<button type="button" onClick={ close( onEdit ) }>Edit</button>
						</li>
						<li>
							<button type="button" className="an-gb-col-menu-danger" onClick={ close( onDelete ) }>Delete</button>
						</li>
					</ul>,
					document.body
				) }
		</>
	);
}
