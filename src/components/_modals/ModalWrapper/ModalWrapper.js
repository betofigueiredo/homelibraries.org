import React, { Component } from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss';

class ModalWrapper extends Component {
	constructor() {
		super();
		this.state = { show: false };
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.visible) {
			setTimeout(() => this.setState({ show: true }), 60);
		} else {
			this.setState({ show: false });
		}
	}

	render() {
		const { visible, pdf } = this.props;
		const { show } = this.state;
		const modal_class = show ? 'modal fade in' : 'modal fade';
		const dialog_class = pdf ? 'modal-dialog pdf' : 'modal-dialog';

		if (visible) {
			return (
				<div className={modal_class} styleName={modal_class} tabIndex="-1" role="dialog">
					<div className="modal-dialog" role="document" styleName={dialog_class}>
						{React.cloneElement(this.props.children, { updateModals: this.props.updateModals })}
					</div>
				</div>
			);
		}
		return null;
	}
}

ModalWrapper.propTypes = {
	visible: PropTypes.bool,
	updateModals: PropTypes.func.isRequired,
	pdf: PropTypes.bool,
	children: PropTypes.object.isRequired,
};

ModalWrapper.defaultProps = {
	visible: false,
	pdf: false,
};

export default CSSModules(ModalWrapper, styles, { allowMultiple: true });
