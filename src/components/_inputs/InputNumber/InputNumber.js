import React, { Component } from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss';

// Functions
import { toNumber } from '../../../functions/_toNumber';

class InputNumber extends Component {
	constructor(props) {
		super(props);
		this.state = {
			value: toNumber(props.default_value),
		};
		this.handleEdition = this.handleEdition.bind(this);
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (nextProps.default_value !== prevState.default_value) {
			return { value: nextProps.default_value };
		}
		return null;
	}

	// componentWillReceiveProps(nextProps) {
	// 	const { default_value } = nextProps;
	// 	if (default_value !== this.state.default_value) this.setState({ value: default_value });
	// }

	handleEdition(e) {
		const typed = toNumber(e.target.value.toString());
		this.setState({ value: typed });
		this.props.updateFunc(this.props.field, typed);
	}

	render() {
		return (
			<input
				type="text"
				className="form-control"
				value={this.state.value}
				onChange={this.handleEdition} />
		);
	}
}

InputNumber.propTypes = {
	field: PropTypes.array.isRequired,
	default_value: PropTypes.number,
	updateFunc: PropTypes.func,
};

InputNumber.defaultProps = {
	default_value: 0,
	updateFunc: () => {},
};

export default CSSModules(InputNumber, styles, { allowMultiple: true });
