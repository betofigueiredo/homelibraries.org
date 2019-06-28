import React, { Component } from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

class InputText extends Component {
	static getDerivedStateFromProps(nextProps, prevState) {
		const { default_value } = nextProps;
		if (prevState.value === '' || default_value !== '') {
			return { value: default_value };
		}
		return null;
	}

	state = {
		value: this.props.default_value,
	};

	// componentWillReceiveProps(nextProps) {
	// 	const { default_value } = nextProps;
	// 	if (default_value !== this.state.default_value) this.setState({ value: default_value });
	// }

	handleEdition = (e) => {
		const { updateFunc, field } = this.props;
		const typed = (e.target.value || '').toString();
		this.setState({ value: typed });
		updateFunc({ [field]: typed });
	}

	render() {
		const { value } = this.state;
		const { label } = this.props;

		return (
			<label styleName="label">
				{label}
				<input
					type="text"
					className="form-control"
					styleName="form-control"
					value={value}
					onChange={this.handleEdition} />
			</label>
		);
	}
}

InputText.propTypes = {
	label: PropTypes.string.isRequired,
	field: PropTypes.string.isRequired,
	default_value: PropTypes.string,
	updateFunc: PropTypes.func,
};

InputText.defaultProps = {
	default_value: '',
	updateFunc: () => {},
};

export default CSSModules(InputText, styles, { allowMultiple: true });
