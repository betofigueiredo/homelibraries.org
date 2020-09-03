import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

const SignInErrors = () => {
	const logging_in = useSelector(
		store => store.user.logging_in, shallowEqual,
	);
	const error_message = useSelector(
		store => store.user.error_message, shallowEqual,
	);

	if (logging_in === 30) {
		return (
			<div>{error_message}</div>
		);
	}

	return null;
};

export default CSSModules(SignInErrors, styles, { allowMultiple: true });
