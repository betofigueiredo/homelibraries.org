import React, { Component } from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss';

// Components
import LoadingButton from '../../_loadings/LoadingButton/LoadingButton';

class ModalConfirm extends Component {
	constructor(props) {
		super(props);
		this.state = {
			confirmando: props.confirmando,
		};
		this.confirmFuncLocal = this.confirmFuncLocal.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		this.setState({ confirmando: nextProps.confirmando });
	}

	confirmFuncLocal() {
		const { closeModal, confirmFunc } = this.props;
		/**
		 * Não existe função a ser executada
		 */
		if (confirmFunc === null) {
			closeModal();
			return;
		}
		confirmFunc();
	}

	render() {
		const {
			confirmando,
		} = this.state;
		const {
			closeModal,
			modal_width,
			title,
			message,
			cancelar_button,
			icon,
			button_type,
			button_text,
			cancel_button_text,
			error_message,
			tem_motivo,
			motivo,
			handleMotivo,
			motivo_alert,
		} = this.props;

		const modal_width_class = modal_width !== ''
			? `modal-content ${modal_width}`
			: 'modal-content';

		return (
			<div className="modal-content" styleName={modal_width_class}>
				<div className="modal-body" styleName="modal-body">
					{confirmando !== 1 && (
						<button
							type="button"
							className="close"
							styleName="close-button"
							data-dismiss="modal"
							aria-label="Close"
							onClick={closeModal}>
							<span aria-hidden="true">&times;</span>
						</button>
					)}
					{icon !== '' && (
						<div styleName="icon">
							<i className={`fa fa-${icon}`} aria-hidden="true" />
						</div>
					)}
					<div styleName="content">
						<h3>{title}</h3>
						{message}
						{tem_motivo && (
							<React.Fragment>
								<textarea
									className="form-control"
									rows="5"
									value={motivo}
									onChange={handleMotivo} />
								{motivo_alert && (
									<div className="tooltip bottom in" role="tooltip" style={{ marginTop: '2px' }}>
										<div className="tooltip-arrow" style={{ borderBottomColor: '#ee2622', left: '10%' }} />
										<div className="tooltip-inner" style={{ backgroundColor: '#ee2622', maxWidth: '320px' }}>O motivo é obrigatório</div>
									</div>
								)}
								<p><br /></p>
							</React.Fragment>
						)}
						{confirmando === 3 && (
							<div className="alert alert-danger" role="alert">
								<i className="fa fa-exclamation-triangle fa-fw" aria-hidden="true" /> {error_message}
							</div>
						)}
						{confirmando === 1 ? (
							<React.Fragment>
								{cancelar_button && (
									<button
										type="button"
										className="btn btn-clear-conaz round-border"
										style={{ opacity: '0.3', marginRight: '15px' }}>
										Cancelar
									</button>
								)}
								<button
									type="button"
									className={`btn btn-${button_type} round-border loading`}>
									<LoadingButton />{button_text}
								</button>
							</React.Fragment>
						) : (
							<React.Fragment>
								{cancelar_button && (
									<button
										type="button"
										className="btn btn-clear-conaz round-border"
										style={{ marginRight: '15px' }}
										onClick={closeModal}>
										{cancel_button_text}
									</button>
								)}
								<button
									type="button"
									className={`btn btn-${button_type} round-border`}
									onClick={this.confirmFuncLocal}>
									{button_text}
								</button>
							</React.Fragment>
						)}
					</div>
				</div>
			</div>
		);
	}
}

ModalConfirm.propTypes = {
	closeModal: PropTypes.func,
	modal_width: PropTypes.string,
	title: PropTypes.string.isRequired,
	message: PropTypes.object.isRequired,
	confirmando: PropTypes.number,
	confirmFunc: PropTypes.func,
	cancelar_button: PropTypes.bool,
	icon: PropTypes.string,
	button_type: PropTypes.string,
	button_text: PropTypes.string,
	cancel_button_text: PropTypes.string,
	error_message: PropTypes.string,
	tem_motivo: PropTypes.bool,
	motivo: PropTypes.string,
	motivo_alert: PropTypes.bool,
	handleMotivo: PropTypes.func,
};

ModalConfirm.defaultProps = {
	closeModal: () => {},
	modal_width: '',
	confirmando: 0,
	confirmFunc: null,
	cancelar_button: true,
	icon: '',
	button_type: 'danger', // secondary
	button_text: 'Confirmar',
	cancel_button_text: 'Cancelar',
	error_message: 'Desculpe, aconteceu algo errado. Tente novamente.',
	tem_motivo: false,
	motivo: '',
	motivo_alert: false,
	handleMotivo: () => {},
};

export default CSSModules(ModalConfirm, styles, { allowMultiple: true });
