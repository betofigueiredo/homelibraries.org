import React from 'react';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

const Messages = () => (
	<div className="container">
		<div className="row">
			<div className="col-xs-12">
				<p styleName="teste">Messages</p>
			</div>
		</div>
	</div>
);

export default CSSModules(Messages, styles, { allowMultiple: true });
