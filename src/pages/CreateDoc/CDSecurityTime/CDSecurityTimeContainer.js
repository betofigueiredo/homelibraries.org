import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as actions from '../../../actions/index';

/**
 * @render react
 * @name CDSecurityTimeContainer
 * @description Container para a url /create/doc/security
 * @example
 */

// Components
import RequestsWrapperFuture from '../../../hocs/RequestsWrapper/RequestsWrapperFuture';
import CDSecurityTime from './CDSecurityTime';

class CDSecurityTimeContainer extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		return (
			<RequestsWrapperFuture
				{...this.props}>

				<CDSecurityTime
					{...this.state}
					{...this.props} />

			</RequestsWrapperFuture>
		);
	}
}

CDSecurityTimeContainer.propTypes = {
	// =========== store
	docs: PropTypes.object.isRequired,
	contacts: PropTypes.object.isRequired,
	ui: PropTypes.object.isRequired,
	user: PropTypes.object.isRequired,
	// =========== funcs
	updateContacts: PropTypes.func.isRequired,
	updateDocs: PropTypes.func.isRequired,
	updateUi: PropTypes.func.isRequired,
	updateUser: PropTypes.func.isRequired,
	updateModals: PropTypes.func.isRequired,
	unsetAuth: PropTypes.func.isRequired,
	// =========== router
	match: PropTypes.object.isRequired,
	history: PropTypes.object.isRequired,
};

const mapStateToProps = props => ({
	docs: props.docs,
	contacts: props.contacts,
	ui: props.ui,
	user: props.user,
});

const mapDispatchToProps = dispatch => ({
	updateContacts: (field, value) => dispatch(actions.updateContacts(field, value)),
	updateDocs: (field, value) => dispatch(actions.updateDocs(field, value)),
	updateUi: (field, value) => dispatch(actions.updateUi(field, value)),
	updateUser: (field, value) => dispatch(actions.updateUser(field, value)),
	updateModals: (modal, value) => dispatch(actions.updateModals(modal, value)),
	unsetAuth: () => dispatch(actions.unsetAuth()),
});

export default connect(mapStateToProps, mapDispatchToProps)(CDSecurityTimeContainer);
