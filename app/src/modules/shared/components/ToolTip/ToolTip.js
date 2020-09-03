import React, { Component } from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

class ToolTip extends Component {
	state = {
		tooltip: false,
	};

	handleMouseEnter = () => {
		window.clearTimeout(this.tooltip_timeout);
		this.tooltip_timeout = window.setTimeout(() => {
			this.setState({ tooltip: true });
		}, 400);
	}

	handleMouseLeave = () => {
		window.clearTimeout(this.tooltip_timeout);
		this.setState({ tooltip: false });
	}

	render() {
		const { tooltip } = this.state;
		const { text, render } = this.props;

		return (
			<>
				{render(this.handleMouseEnter, this.handleMouseLeave)}
				{tooltip && (
					<div
						className="tooltip left align-center"
						role="tooltip"
						aria-hidden="true"
						style={{ top: '12px', left: '50px' }}>
						{text}
					</div>
				)}
			</>
		);
	}
}

ToolTip.propTypes = {
	text: PropTypes.string.isRequired,
	render: PropTypes.func.isRequired,
};

export default CSSModules(ToolTip, styles, { allowMultiple: true });
