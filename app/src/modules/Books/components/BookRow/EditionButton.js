import React from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

const EditionButton = ({
	handleMouseEnter,
	handleMouseLeave,
	handleBookEdition,
}) => (
	<button
		type="button"
		styleName="edit-button"
		onMouseEnter={handleMouseEnter}
		onMouseLeave={handleMouseLeave}
		onClick={handleBookEdition}
	>
		<i className="fa fa-ellipsis-v" aria-hidden="true" />
	</button>
);

EditionButton.propTypes = {
	handleMouseEnter: PropTypes.func.isRequired,
	handleMouseLeave: PropTypes.func.isRequired,
	handleBookEdition: PropTypes.func.isRequired,
};

export default CSSModules(EditionButton, styles, { allowMultiple: true });
