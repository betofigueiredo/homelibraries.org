import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { buildMapStateToProps, buildmapDispatchToProps } from '../../store/reduxDispatchs';

// Redux HOC
import withStore from '../../store/withStore';

// Components
import LayoutWrapper from '../../components/LayoutWrapper';
import Messages from './Messages';

class MessagesContainer extends Component {
	state = {};

	render() {
		const { user, match } = this.props;

		return (
			<LayoutWrapper
				fetching={20}
				user={user}
				match={match}>

				<Messages
					{...this.state}
					{...this.props} />

			</LayoutWrapper>
		);
	}
}

MessagesContainer.propTypes = {
	// =========== store
	user: PropTypes.object.isRequired,
	// =========== funcs
	// =========== router
	match: PropTypes.object.isRequired,
};

const mapStateToProps = (props) => buildMapStateToProps(props);
const mapDispatchToProps = (dispatch) => buildmapDispatchToProps(dispatch);
export default withStore(connect(mapStateToProps, mapDispatchToProps)(MessagesContainer));
