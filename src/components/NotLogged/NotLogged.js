import React from 'react';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss';

// Components
import LayoutWrapper from '../LayoutWrapper';

function NotLogged() {
	return (
		<LayoutWrapper fetching={20}>
			<p>not logged</p>
		</LayoutWrapper>
	);
}

export default CSSModules(NotLogged, styles, { allowMultiple: true });
