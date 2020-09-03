import React from 'react';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

const TestComp = () => (
	<div className="grid-container full" data-test="mybooks-render">
		<div className="grid-x">
			<div className="medium-12 cell">
				<div styleName="top-bar">TestComp</div>
			</div>
		</div>
	</div>
);

export default CSSModules(TestComp, styles, { allowMultiple: true });
