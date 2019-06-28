import React from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

const DeleteButton = ({ handleMouseEnter, handleMouseLeave, handleBookDeleteConfirm }) => (
	<button
		type="button"
		styleName="delete-button"
		onMouseEnter={handleMouseEnter}
		onMouseLeave={handleMouseLeave}
		onClick={handleBookDeleteConfirm}>
		<i className="fa fa-trash" aria-hidden="true" />
	</button>
);

DeleteButton.propTypes = {
	handleMouseEnter: PropTypes.func.isRequired,
	handleMouseLeave: PropTypes.func.isRequired,
	handleBookDeleteConfirm: PropTypes.func.isRequired,
};

export default CSSModules(DeleteButton, styles, { allowMultiple: true });
