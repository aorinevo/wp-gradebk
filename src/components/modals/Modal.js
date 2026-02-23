import { useEffect, useRef } from '@wordpress/element';
import { createPortal } from '@wordpress/element';

export default function Modal( { title, children, onClose } ) {
	const overlayRef = useRef();

	useEffect( () => {
		function handleKey( e ) {
			if ( e.key === 'Escape' ) {
				onClose();
			}
		}
		document.addEventListener( 'keydown', handleKey );
		return () => document.removeEventListener( 'keydown', handleKey );
	}, [ onClose ] );

	function handleOverlayClick( e ) {
		if ( e.target === overlayRef.current ) {
			onClose();
		}
	}

	return createPortal(
		<div
			className="an-gb-modal-overlay"
			ref={ overlayRef }
			onClick={ handleOverlayClick }
		>
			<div className="an-gb-modal">
				<div className="an-gb-modal-header">
					<h2>{ title }</h2>
					<button
						type="button"
						className="an-gb-modal-close"
						onClick={ onClose }
					>
						&times;
					</button>
				</div>
				<div className="an-gb-modal-body">{ children }</div>
			</div>
		</div>,
		document.body
	);
}
