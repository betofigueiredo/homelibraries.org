import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as actions from '../../../actions/index';

/**
 * @render react
 * @name CDContactsContainer
 * @description Container para a url /create/doc/contacts
 * @example
 */

// Components
import RequestsWrapperFuture from '../../../hocs/RequestsWrapper/RequestsWrapperFuture';
import CDContacts from './CDContacts';

// Functions
import { _get } from '../../../functions/_requests';
import { buildContacts } from '../../../functions/_buildResponses';

class CDContactsContainer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			request_contacts: 0,
		};
		this.selectContact = this.selectContact.bind(this);
	}

	componentDidMount() {
		this.getContacts();
	}

	getContacts() {
		this.setState({ request_contacts: 1 });
		const { updateContacts } = this.props;
		_get('/app/contacts.php').then(response => {
			const contacts_byid_and_allids = buildContacts(response.data);
			updateContacts(['contacts_by_id'], contacts_byid_and_allids[0]);
			updateContacts(['contacts_all_ids'], contacts_byid_and_allids[1]);
			this.setState({ request_contacts: 2 });
		}).catch(() => {
			this.setState({ request_contacts: 3 });
		});
	}

	selectContact(contact_id) {
		const { docs, updateDocs } = this.props;
		const already_selected = docs.create_doc.contacts
			.filter(x => x === contact_id).length > 0;
		const contacts = !already_selected
			? [...docs.create_doc.contacts, contact_id].filter((el, i, a) => i === a.indexOf(el))
			: [...docs.create_doc.contacts].filter(x => x !== contact_id);
		const create_doc = {
			...docs.create_doc,
			contacts,
		};
		updateDocs(['create_doc'], create_doc);
	}

	render() {
		return (
			<RequestsWrapperFuture
				{...this.props}>

				<CDContacts
					{...this.state}
					{...this.props}
					selectContact={this.selectContact} />

			</RequestsWrapperFuture>
		);
	}
}

CDContactsContainer.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(CDContactsContainer);
