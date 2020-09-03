import React from 'react';
// import PropTypes from 'prop-types';
// import { Link } from 'react-router-dom';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss';

const NoBooks = () => (
	<div className="libraries-wrapper">
		<img src="/images/nobooks.svg" alt="" />
	</div>
);

// NoBooks.propTypes = {
// 	preview: PropTypes.object.isRequired,
// };

export default CSSModules(NoBooks, styles, { allowMultiple: true });
