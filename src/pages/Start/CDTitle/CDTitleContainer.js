import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as actions from '../../../actions/index';

/**
 * @render react
 * @name CDTitleContainer
 * @description Container para a url /create/doc
 * @example
 */

// Components
import CDHoc from '../CDHoc';
import RequestsWrapperFuture from '../../../hocs/RequestsWrapper/RequestsWrapperFuture';
import CDTitle from './CDTitle';

class CDTitleContainer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			title: '',
		};
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		return nextProps.docs.create_doc.title !== prevState.title
			? { title: nextProps.docs.create_doc.title }
			: {};
	}

	handleTitleEdition = (e) => {
		const { updateDocs } = this.props;
		const title = e.target.value.toString();
		this.setState({ title });
		updateDocs(['create_doc', 'title'], title);
	}

	// goToContacts = () => {
	// 	const { docs, history } = this.props;
	// }

	render() {
		return (
			<RequestsWrapperFuture
				{...this.props}>

				<CDTitle
					{...this.state}
					{...this.props}
					handleTitleEdition={this.handleTitleEdition} />

			</RequestsWrapperFuture>
		);
	}
}

CDTitleContainer.propTypes = {
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

const _CDTitleContainer = connect(mapStateToProps, mapDispatchToProps)(CDTitleContainer);
export default CDHoc(_CDTitleContainer);
