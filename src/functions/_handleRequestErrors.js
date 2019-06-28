// import { getLocalstorageData } from './_getLocalstorageData';
// import { _post } from './_requests';

// function reportErrors(error, full_error, test) {
// 	const full_url = window.location.href;
// 	const email = getLocalstorageData('user', 'email');
// 	const error_text = `*Request:* ${error}
// *Url:* ${full_url}
// *E-mail do cliente:* ${email}
// *Print do erro:* ${full_error}
// ----`;
// 	const channel = test ? '#erros-dev' : '#erros';
// 	_post('/send_slack', {
// 		channel,
// 		username: 'Clientes',
// 		text: error_text,
// 		icon_emoji: ':triangular_flag_on_post:',
// 	});
// }

export const handleRequestErrors = error => {
	if (error.response) {
		console.log((error.response || {}).data); // eslint-disable-line no-console
		console.log((error.response || {}).headers); // eslint-disable-line no-console
		const _status = ((error || {}).response || {}).status;
		if (_status === 403) {
			window.location.replace('https://easefuture.com');
		}
	} else if (error.request) {
		console.log(error.request); // eslint-disable-line no-console
	} else {
		console.log('Error', error.message); // eslint-disable-line no-console
	}

	// const is_test = (window.location.href.indexOf('portal.conazweb.com.br') === -1);
	// const error_url = (error.config !== undefined && error.config.url !== undefined) ? error.config.url : 'no-url';
	// const error_method = (error.config !== undefined && error.config.method !== undefined) ? error.config.method : 'no-method';
	// reportErrors(`${error_url} (${error_method})`, error.message, is_test);
};
