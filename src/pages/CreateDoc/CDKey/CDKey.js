import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// CSS
import CSSModules from 'react-css-modules';
import styles from '../style.module.scss';

const CDKey = ({
	// =========== state
	// =========== props
	docs,
	// =========== props funcs
	// =========== local funcs
}) => {
	const { create_doc } = docs;

	const user_key = create_doc.keys
		.map(k => k.key)
		.join('-');
	console.log(user_key);

	return (
		<div className="grid-container" styleName="doc-wrapper">
			<div className="grid-x">
				<div className="medium-12 cell">
					<label>
						Seu código de acesso
						<textarea
							defaultValue={user_key}
							rows={10}
							disabled />
					</label>
				</div>
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

CDKey.propTypes = {
	// =========== state
	// =========== props
	docs: PropTypes.object.isRequired,
	// =========== props funcs
	// =========== local funcs
};

export default CSSModules(CDKey, styles, { allowMultiple: true });
