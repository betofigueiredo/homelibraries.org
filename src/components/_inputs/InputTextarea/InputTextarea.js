import React, { Component } from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss';

class InputTextarea extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: props.default_value,
		};
		this.handleEdition = this.handleEdition.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		const { default_value } = nextProps;
		const { default_value: _default_value } = this.state;
		if (default_value !== _default_value) {
			this.setState({ value: default_value });
		}
	}

	handleEdition(e) {
		const { updateFunc, field } = this.props;
		const typed = e.target.value.toString();
		this.setState({ value: typed });
		updateFunc(field, typed);
	}

	render() {
		const { value } = this.state;
		const { rows } = this.props;

		return (
			<textarea
				value={value}
				onChange={this.handleEdition}
				rows={rows} />
		);
	}
}

InputTextarea.propTypes = {
	field: PropTypes.array.isRequired,
	default_value: PropTypes.string,
	updateFunc: PropTypes.func,
	rows: PropTypes.string,
};

InputTextarea.defaultProps = {
	default_value: '',
	updateFunc: () => {},
	rows: '6',
};

export default CSSModules(InputTextarea, styles, { allowMultiple: true });
