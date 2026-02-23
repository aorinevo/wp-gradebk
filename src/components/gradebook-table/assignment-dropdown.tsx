import { useState, useRef, useEffect, createPortal } from '@wordpress/element';

interface AssignmentDropdownProps {
	label: string;
	onSortAsc: () => void;
	onSortDesc: () => void;
	onShiftLeft: () => void;
	onShiftRight: () => void;
	onStats: () => void;
	onEdit: () => void;
	onDelete: () => void;
}

interface MenuPosition {
	top?: number;
	left?: number;
}

export default function AssignmentDropdown( {
	label,
	onSortAsc,
	onSortDesc,
	onShiftLeft,
	onShiftRight,
	onStats,
	onEdit,
	onDelete,
}: AssignmentDropdownProps ) {
	const [ open, setOpen ] = useState< boolean >( false );
	const [ menuPos, setMenuPos ] = useState< MenuPosition >( {} );
	const buttonRef = useRef< HTMLButtonElement >( null );
	const menuRef = useRef< HTMLUListElement >( null );

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
		function handleClickOutside( e: MouseEvent ) {
			if (
				buttonRef.current &&
				! buttonRef.current.contains( e.target as Node ) &&
				menuRef.current &&
				! menuRef.current.contains( e.target as Node )
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

	function close( fn: () => void ) {
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
							<button
								type="button"
								onClick={ close( onSortAsc ) }
							>
								Sort Ascending
							</button>
						</li>
						<li>
							<button
								type="button"
								onClick={ close( onSortDesc ) }
							>
								Sort Descending
							</button>
						</li>
						<li className="an-gb-col-menu-sep" />
						<li>
							<button
								type="button"
								onClick={ close( onShiftLeft ) }
							>
								Move Left
							</button>
						</li>
						<li>
							<button
								type="button"
								onClick={ close( onShiftRight ) }
							>
								Move Right
							</button>
						</li>
						<li className="an-gb-col-menu-sep" />
						<li>
							<button type="button" onClick={ close( onStats ) }>
								Stats
							</button>
						</li>
						<li>
							<button type="button" onClick={ close( onEdit ) }>
								Edit
							</button>
						</li>
						<li>
							<button
								type="button"
								className="an-gb-col-menu-danger"
								onClick={ close( onDelete ) }
							>
								Delete
							</button>
						</li>
					</ul>,
					document.body
				) }
		</>
	);
}
