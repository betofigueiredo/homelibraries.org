import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss';

const NavButton = ({ label, icon, link, match, url_matches }) => {
	const a_class = url_matches
		.filter(x => x === match.path).length > 0
		? 'active'
		: '';

	return (
		<li>
			<Link to={link} styleName={a_class}>
				<div styleName="icon-wrapper">
					<i className={icon} styleName={icon} aria-hidden="true" />
					{label}
				</div>
			</Link>
		</li>
	);
};

NavButton.propTypes = {
	label: PropTypes.string.isRequired,
	icon: PropTypes.string.isRequired,
	link: PropTypes.string.isRequired,
	match: PropTypes.object.isRequired,
	url_matches: PropTypes.array.isRequired,
};

export default withRouter(CSSModules(NavButton, styles, { allowMultiple: true }));
