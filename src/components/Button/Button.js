import React from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss';

const Button = ({
	className,
	onClick,
	loading,
	text,
}) => {
	const loader = (
		<div styleName="loader">
			<svg styleName="circular" viewBox="25 25 50 50">
				<circle styleName="path" cx="50" cy="50" r="20" fill="none" strokeWidth="2" strokeMiterlimit="10" />
			</svg>
		</div>
	);

	return (
		<button
			type="button"
			className={className}
			styleName="button"
			onClick={onClick}>
			{(loading === 10 || loading === true) ? (
				loader
			) : (
				<>{text}</>
			)}
		</button>
	);
};

Button.propTypes = {
	className: PropTypes.string,
	onClick: PropTypes.func,
	loading: PropTypes.oneOfType([
		PropTypes.string,
		PropTypes.number,
	]),
	text: PropTypes.string.isRequired,
};

Button.defaultProps = {
	className: 'button',
	onClick: () => {},
	loading: 0,
};

export default CSSModules(Button, styles, { allowMultiple: true });
