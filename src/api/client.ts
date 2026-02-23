import apiFetch from '@wordpress/api-fetch';

apiFetch.use(
	apiFetch.createNonceMiddleware(
		window.anGradebookSettings?.restNonce ?? ''
	)
);

export default apiFetch;
