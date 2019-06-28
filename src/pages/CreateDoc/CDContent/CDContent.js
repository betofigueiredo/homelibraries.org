import React from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from '../style.module.scss';

// Components
import StatusBar from '../../../components/StatusBar/StatusBar';
import InputTextarea from '../../../components/_inputs/InputTextarea/InputTextarea';
// import LoadingButton from '../../../components/_loadings/LoadingButton/LoadingButton';

const CDContent = ({
	// =========== state
	// =========== props
	ui,
	docs,
	// =========== props funcs
	updateDocs,
	// =========== local funcs
	goToSaveDoc,
}) => {
	const { create_doc } = docs;
	const { steps_create_doc } = ui;

	return (
		<div className="grid-container" styleName="doc-wrapper">
			<div className="grid-x">
				<div className="medium-12 cell" style={{ textAlign: 'center' }}>
					<StatusBar
						steps={steps_create_doc}
						active_step={4} />
				</div>
			</div>
			<div className="grid-x">
				<div className="medium-12 cell">
					<label>
						Conteúdo
						<InputTextarea
							field={['create_doc', 'content']}
							default_value={create_doc.content}
							updateFunc={updateDocs}
							rows="6" />
					</label>
				</div>
			</div>

			<div className="grid-x">
				<div className="medium-12 cell">
					<button
						type="button"
						className="button"
						onClick={goToSaveDoc}>
						Codificar e salvar
					</button>
				</div>
			</div>

			<div className="grid-x">
				<div className="small-12 cell"><p><br /></p></div>
			</div>
		</div>
	);
};

CDContent.propTypes = {
	// =========== state
	// =========== props
	ui: PropTypes.object.isRequired,
	docs: PropTypes.object.isRequired,
	// =========== props funcs
	updateDocs: PropTypes.func.isRequired,
	// =========== local funcs
	goToSaveDoc: PropTypes.func.isRequired,
};

export default CSSModules(CDContent, styles, { allowMultiple: true });
