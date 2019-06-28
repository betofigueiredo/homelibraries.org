import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss';

/**
 * @render react
 * @name AccLinkRow
 * @description
 * @example
       <AccLinkRow
           url="/account"
           menu="Minha conta" />
 */

const AccLinkRow = ({ url, menu, value }) => (
	<Link to={url}>
		<div styleName="cell">
			<i className="fa fa-angle-right" aria-hidden="true" />
			{menu} {value !== '' && <span> - {value}</span>}
		</div>
	</Link>
);

AccLinkRow.propTypes = {
	url: PropTypes.string.isRequired,
	menu: PropTypes.string.isRequired,
	value: PropTypes.string,
};

AccLinkRow.defaultProps = {
	value: '',
};

export default CSSModules(AccLinkRow, styles, { allowMultiple: true });
