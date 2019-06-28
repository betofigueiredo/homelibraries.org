import React, { Component } from 'react';
import PropTypes from 'prop-types';

class InputTextWithIcon extends Component {
	state = {
		value: this.props.default_value,
	};

	handleEdition = (e) => {
		const { updateFunc, field } = this.props;
		const typed = e.target.value || '';
		this.setState({ value: typed });
		updateFunc(field, typed);
	}

	render() {
		const { value } = this.state;
		const { label, icon } = this.props;

		return (
			<label>
				{label}
				<div className="input-group">
					<span className="input-group-label">{icon}</span>
					<input
						type="text"
						className="input-group-field"
						value={value}
						onChange={this.handleEdition} />
				</div>
			</label>
		);
	}
}

InputTextWithIcon.propTypes = {
	label: PropTypes.string.isRequired,
	icon: PropTypes.string.isRequired,
	field: PropTypes.string.isRequired,
	default_value: PropTypes.string,
	updateFunc: PropTypes.func,
};

InputTextWithIcon.defaultProps = {
	default_value: '',
	updateFunc: () => {},
};

export default InputTextWithIcon;
