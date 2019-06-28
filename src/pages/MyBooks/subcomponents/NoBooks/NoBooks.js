import React from 'react';
import PropTypes from 'prop-types';
// import { Link } from 'react-router-dom';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss';

/* eslint-disable */
const NoBooks = ({
	// =========== state
	preview,
	// =========== props
	libraries,
	// =========== local funcs
	_backToMyLocation,
	// =========== props funcs
}) => (
	<div className="libraries-wrapper">
		<img src="/images/nobooks.svg" />
	</div>
);

NoBooks.propTypes = {
	// =========== state
	preview: PropTypes.object.isRequired,
	// =========== props
	libraries: PropTypes.object.isRequired,
	// =========== local funcs
	_backToMyLocation: PropTypes.func.isRequired,
	// =========== props funcs
};

export default CSSModules(NoBooks, styles, { allowMultiple: true });
