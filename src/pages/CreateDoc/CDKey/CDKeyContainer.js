import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as actions from '../../../actions/index';

/**
 * @render react
 * @name CDKeyContainer
 * @description Container para a url /create/doc/key
 * @example
 */

// Components
import CDHoc from '../CDHoc';
import RequestsWrapperFuture from '../../../hocs/RequestsWrapper/RequestsWrapperFuture';
import CDKey from './CDKey';

// Functions
import { _post } from '../../../functions/_requests';

class CDKeyContainer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			saving: 0,
		};
	}

	/* eslint-disable */
	static getDerivedStateFromProps(nextProps) {
		// const { docs, validationAll, history } = nextProps;
		// const all_info_ok = validationAll(docs.create_doc);
		// if (!all_info_ok) {
		// 	history.replace('/create/doc');
		// 	return {};
		// }
		return { saving: 1 };
	}

	componentDidMount() {
		const { saving } = this.state;
		if (saving === 1) {
			this.saveDoc();
		}
	}

	saveDoc = () => {
		const { docs, updateDocs } = this.props;


		const keys = [
			{
				email: 'me',
				id: 0,
				key: '001def0000073fe7b78d093c5dc9034c7896f43b5e98c8a21cf278fd9e1a2b92821f3d940b46e6a787ba8fa7adaab98a942f68d1c08b95984111635c3b5fe1c9351e331a57b.6320455',
				name: 'me',
			},
			{
				email: 'eloisa.mh@hotmail.com',
				id: 6,
				key: '001def00000f2bb602be2138977a8d6f8cb45ca3b4df9cefadf3454a4c6016dee50e3211e35bf4ebb23b86fbeff616ddd171098afb319c3f2d6632eb8be299e1f614bfe406d.f3d9bb3069b4d7fa05d72421413',
				name: 'Eloisa Figueiredo',
			},
		];
		updateDocs(['create_doc', 'keys'], keys);


		return;
		const { title, contacts, security_time, content } = docs.create_doc;
		const params = {
			title,
			contacts,
			security_time,
			content,
		};
		_post('/app/actions/encrypting.php', params).then(response => {
			this.setState({ saving: 2 });
			const keys = response.data.keys || [];
			updateDocs(['create_doc', 'keys'], keys);
		}).catch(() => {
			this.setState({ saving: 3 });
			// this.props.updateCotacao(['request_state_populares'], 3);
			// this.props.updateModals('error', true);
			// handleRequestErrors(error, this.props.routes[1].path, this.props.reportErrors);
		});
	}

	render() {
		return (
			<RequestsWrapperFuture
				{...this.props}>

				<CDKey
					{...this.state}
					{...this.props} />

			</RequestsWrapperFuture>
		);
	}
}

CDKeyContainer.propTypes = {
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

const _CDKeyContainer = connect(mapStateToProps, mapDispatchToProps)(CDKeyContainer);
export default CDHoc(_CDKeyContainer);
