import { createRoot } from '@wordpress/element';
import App from './app';
import './styles/gradebook.css';

document.addEventListener( 'DOMContentLoaded', (): void => {
	const container: HTMLElement | null = document.getElementById(
		'an-gradebook-react-root'
	);
	if ( container ) {
		const root = createRoot( container );
		root.render( <App /> );
	}
} );
