import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

// CSS
import CSSModules from 'react-css-modules';
import styles from '../style.module.scss';

// Components
import StatusBar from '../../../components/StatusBar/StatusBar';

const CreateDoc = ({
	// =========== state
	title,
	// =========== props
	ui,
	// =========== props funcs
	// =========== local funcs
	handleTitleEdition,
}) => {
	const { steps_create_doc } = ui;

	return (
		<div className="grid-container" styleName="doc-wrapper">
			<div className="grid-x">
				<div className="medium-12 cell" style={{ textAlign: 'center' }}>
					<StatusBar
						steps={steps_create_doc}
						active_step={1} />
				</div>
			</div>
			<div className="grid-x">
				<div className="medium-12 cell">
					<h4>Defina um título para o seu documento</h4>
					<input
						type="text"
						className="form-control"
						styleName="title-doc-field"
						value={title}
						onChange={handleTitleEdition} />
				</div>
			</div>

			<div className="grid-x">
				<div className="medium-12 cell">
					<Link
						to="/create/doc/contacts"
						className="button">
						Selecionar contatos <i className="fa fa-angle-right" aria-hidden="true" style={{ marginLeft: '4px' }} />
					</Link>
				</div>
			</div>

			<div className="grid-x">
				<div className="small-12 cell"><p><br /></p></div>
			</div>
		</div>
	);
};

CreateDoc.propTypes = {
	// =========== state
	title: PropTypes.string.isRequired,
	// =========== props
	ui: PropTypes.object.isRequired,
	// =========== props funcs
	// =========== local funcs
	handleTitleEdition: PropTypes.func.isRequired,
};

export default CSSModules(CreateDoc, styles, { allowMultiple: true });
