import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as actions from '../../../actions/index';

/**
 * @render react
 * @name CDContentContainer
 * @description Container para a url /create/doc/content
 * @example
 */

// Components
import CDHoc from '../CDHoc';
import RequestsWrapperFuture from '../../../hocs/RequestsWrapper/RequestsWrapperFuture';
import CDContent from './CDContent';

class CDContentContainer extends Component {
	goToSaveDoc = () => {
		const { docs, validationAll, history } = this.props;
		const all_info_ok = validationAll(docs.create_doc);
		if (!all_info_ok) {
			alert('erro');
			return;
		}
		history.push('/create/doc/key');
	}

	render() {
		return (
			<RequestsWrapperFuture
				{...this.props}>

				<CDContent
					{...this.props}
					goToSaveDoc={this.goToSaveDoc} />

			</RequestsWrapperFuture>
		);
	}
}

CDContentContainer.propTypes = {
	// =========== hoc
	validationAll: PropTypes.func.isRequired,
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

const _CDContentContainer = connect(mapStateToProps, mapDispatchToProps)(CDContentContainer);
export default CDHoc(_CDContentContainer);
