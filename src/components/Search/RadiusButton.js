import React, { Component } from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

class RadiusButton extends Component {
	handleEdition = () => {
		const { radius, updateFunc } = this.props;
		updateFunc({ radius });
	}

	render() {
		const { radius, selected } = this.props;
		const button_class = selected
			? 'group-button selected'
			: 'group-button';

		return (
			<button
				type="button"
				styleName={button_class}
				onClick={this.handleEdition}>
				{radius}
			</button>
		);
	}
}

RadiusButton.propTypes = {
	radius: PropTypes.number.isRequired,
	selected: PropTypes.bool.isRequired,
	updateFunc: PropTypes.func.isRequired,
};

export default CSSModules(RadiusButton, styles, { allowMultiple: true });
