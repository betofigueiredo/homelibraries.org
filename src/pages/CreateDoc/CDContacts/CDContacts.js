import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// CSS
import CSSModules from 'react-css-modules';
import styles from '../style.module.scss';

// Components
import ContactCard from '../../../components/ContactCard/ContactCard';
import StatusBar from '../../../components/StatusBar/StatusBar';

const CDContacts = ({
	// =========== state
	// =========== props
	docs,
	contacts,
	ui,
	// =========== props funcs
	// =========== local funcs
	selectContact,
}) => {
	const { contacts_by_id, contacts_all_ids } = contacts;
	const { create_doc } = docs;
	const { steps_create_doc } = ui;

	return (
		<div className="grid-container" styleName="doc-wrapper">
			<div className="grid-x">
				<div className="medium-12 cell" style={{ textAlign: 'center' }}>
					<StatusBar
						steps={steps_create_doc}
						active_step={2} />
				</div>
			</div>
			<div className="grid-x">
				<div className="medium-12 cell">
					<h4 styleName="contacts-title">Selecione quem terá acesso a este documento</h4>
				</div>
			</div>

			<div className="grid-x grid-padding-x">
				{contacts_all_ids.map(id => (
					<ContactCard
						key={id}
						contact={contacts_by_id[id]}
						selected_contacts_ids={create_doc.contacts}
						selectContact={selectContact} />
				))}
			</div>

			<div className="grid-x">
				<div className="medium-12 cell">
					<Link
						to="/create/doc"
						className="button secondary">
						<i className="fa fa-angle-left" aria-hidden="true" style={{ marginRight: '4px' }} /> Voltar
					</Link>
					<Link
						to="/create/doc/security"
						className="button">
						Definir tempo de segurança <i className="fa fa-angle-right" aria-hidden="true" style={{ marginLeft: '4px' }} />
					</Link>
				</div>
			</div>

			<div className="grid-x">
				<div className="small-12 cell"><p><br /></p></div>
			</div>
		</div>
	);
};

CDContacts.propTypes = {
	// =========== state
	// =========== props
	docs: PropTypes.object.isRequired,
	contacts: PropTypes.object.isRequired,
	ui: PropTypes.object.isRequired,
	// =========== props func
	// =========== local funcs
	selectContact: PropTypes.func.isRequired,
};

export default CSSModules(CDContacts, styles, { allowMultiple: true });
