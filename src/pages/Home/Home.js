import React from 'react';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

const Home = () => (
	<div className="container">
		<div className="row">
			<div className="col-xs-12">
				<p styleName="teste">Home</p>
			</div>
		</div>
	</div>
);

export default CSSModules(Home, styles, { allowMultiple: true });
