import React from 'react';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss';

const LoadingButton = () => (
	<div styleName="loader">
		<svg styleName="circular" viewBox="25 25 50 50">
			<circle styleName="path" cx="50" cy="50" r="20" fill="none" strokeWidth="2" strokeMiterlimit="10" />
		</svg>
	</div>
);

export default CSSModules(LoadingButton, styles, { allowMultiple: true });
