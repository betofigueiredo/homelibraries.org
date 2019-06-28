import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// CSS
import CSSModules from 'react-css-modules';
import styles from '../style.module.scss';


// Components
import ContactEmailRow from '../../../components/ContactEmailRow/ContactEmailRow';

const CDEmails = ({
	// =========== state
	// =========== props
	docs,
	// =========== props funcs
	// =========== local funcs
}) => {
	const { create_doc } = docs;

	const keys_to_list = create_doc.keys
		.filter(k => k.id !== 0);

	return (
		<div className="grid-container" styleName="doc-wrapper">
			<div className="grid-x">
				{keys_to_list.map(data => (
					<ContactEmailRow
						key={data.id}
						data={data} />
				))}
			</div>
			<div className="grid-x">
				<div className="medium-12 cell">
					<Link
						to="/create/doc/emails"
						className="button">
						Enviar e-mails <i className="fa fa-angle-right" aria-hidden="true" style={{ marginLeft: '4px' }} />
					</Link>
				</div>
			</div>
			<div className="grid-x">
				<div className="small-12 cell"><p><br /></p></div>
			</div>
		</div>
	);
};

CDEmails.propTypes = {
	// =========== state
	// =========== props
	docs: PropTypes.object.isRequired,
	// =========== props funcs
	// =========== local funcs
};

export default CSSModules(CDEmails, styles, { allowMultiple: true });
