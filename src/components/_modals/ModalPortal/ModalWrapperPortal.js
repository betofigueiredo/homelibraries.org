import React, { Component } from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss';

// Functions
import { lockBody } from '../../../functions/_lockBody';

class ModalWrapperPortal extends Component {
	// state = {
	// 	show: false,
	// };

	componentDidMount() {
		setTimeout(() => {
			window.addEventListener('keyup', this.escClose);
			lockBody(true);
			// this.setState({ show: true });
		}, 80);
	}

	componentWillUnmount() {
		lockBody(false);
		window.removeEventListener('keyup', this.escClose);
	}

	escClose = (e) => {
		if (e.keyCode === 27) {
			this.props.closeModal();
		}
	}

	render() {
		return (
			<div className="reveal-overlay" style={{ display: 'block' }}>
				<div className="reveal" style={{ display: 'block', top: '36px' }}>
					{React.cloneElement(this.props.children, { closeModal: this.props.closeModal })}
				</div>
			</div>
		);
	}
}

ModalWrapperPortal.propTypes = {
	closeModal: PropTypes.func.isRequired,
	children: PropTypes.object.isRequired,
};

export default CSSModules(ModalWrapperPortal, styles, { allowMultiple: true });
