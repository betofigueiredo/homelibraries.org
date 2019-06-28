import React from 'react';
import PropTypes from 'prop-types';
// import { Link } from 'react-router-dom';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss';

/**
 * @render react
 * @name StatusBar
 * @description ...
 * @example
 */

const StatusBar = ({ steps, active_step }) => {
	const dots = Array.from({ length: steps.length - 1 }, (_, i) => i);

	return (
		<div styleName="status-bar">
			{steps.map(step => {
				const step_active_class = step.order <= active_step ? ' active' : '';
				const step_class = `step${step_active_class} s${step.order}-${steps.length}`;

				return (
					<div key={step.order} styleName={step_class}>{step.order}</div>
				);
			})}
			{dots.map(i => {
				const dots_active_class = i + 1 < active_step ? ' active' : '';
				const back_dots_class = `back-dots${dots_active_class} d${i + 1}-${dots.length}`;

				return (
					<div key={i} styleName={back_dots_class}>
						<div styleName="dots-padding">
							<div styleName="dot-1" />
							<div styleName="dot-2" />
							<div styleName="dot-3" />
							<div styleName="dot-4" />
							<div styleName="dot-5" />
						</div>
					</div>
				);
			})}
		</div>
	);
};

StatusBar.propTypes = {
	steps: PropTypes.array.isRequired,
	active_step: PropTypes.number.isRequired,
};

// StatusBar.defaultProps = {
// 	route_path: '',
// };

export default CSSModules(StatusBar, styles, { allowMultiple: true });
