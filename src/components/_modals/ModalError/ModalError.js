import React from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss';

const ModalError = ({ updateModals, title, message }) => (
	<div className="modal-content" styleName="modal-content">
		<div className="modal-body" styleName="error-wrapper">
			<button
				type="button"
				className="close"
				styleName="close-button"
				data-dismiss="modal"
				aria-label="Close"
				onClick={() => updateModals('error', false)}>
				<span aria-hidden="true">&times;</span>
			</button>
			<i className="fa fa-exclamation-circle" aria-hidden="true" />
			<h3>{title}</h3>
			<p>{message}</p>
		</div>
	</div>
);

ModalError.propTypes = {
	updateModals: PropTypes.func,
	title: PropTypes.string,
	message: PropTypes.string,
};

ModalError.defaultProps = {
	updateModals: () => {},
	title: 'Desculpe, tivemos um problema!',
	message: 'Atualize a página apertando F5 para tentar novamente e/ou entre em contato com nossa equipe de suporte.',
};

export default CSSModules(ModalError, styles, { allowMultiple: true });
