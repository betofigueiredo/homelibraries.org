/* eslint-disable react/prop-types */
import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { buildMapStateToProps, buildmapDispatchToProps } from '../../store/reduxDispatchs';

class SignOut extends Component {
	static getDerivedStateFromProps(nextProps) {
		const { unsetAuth, history } = nextProps;
		unsetAuth();
		history.push('/sign/in');
	}

	render() {
		return <div />;
	}
}

// SignOut.propTypes = {
// 	history: PropTypes.object.isRequired,
// 	unsetAuth: PropTypes.func.isRequired,
// };

const mapStateToProps = props => buildMapStateToProps(props);
const mapDispatchToProps = dispatch => buildmapDispatchToProps(dispatch);
export default connect(mapStateToProps, mapDispatchToProps)(SignOut);
