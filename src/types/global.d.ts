interface AnGradebookSettings {
	restNonce: string;
	restUrl: string;
	userRole: 'instructor' | 'student';
}

interface Window {
	anGradebookSettings?: AnGradebookSettings;
}
