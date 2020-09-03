import React from 'react';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

const LoadingBooksList = () => (
	<div className="grid-x grid-padding-x">
		<div className="small-12 cell">
			loading books
		</div>
	</div>
);

export default CSSModules(LoadingBooksList, styles, { allowMultiple: true });
