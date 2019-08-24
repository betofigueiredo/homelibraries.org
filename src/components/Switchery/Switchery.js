/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { Component } from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.scss';

// Functions
import { _post } from '../../functions/_requests';

class Switchery extends Component {
	state = {
		saving: false,
	};

	handleSwitch = () => {
		const { saving } = this.state;
		if (saving) {
			return;
		}
		this.setState({ saving: true });
		const { book, updateBook } = this.props;
		const available = !book.available;
		const params = { available };
		updateBook(book.id, params);
		_post(`/book/${book.id}/available`, params).then(() => {
			this.setState({ saving: false });
		}).catch(() => {
			this.setState({ saving: false });
		});
	}

	render() {
		const { book } = this.props;
		const { available } = book;

		const switchery_class = !available
			? 'switchery'
			: 'switchery active';
		const small_class = !available
			? ''
			: 'active';
		const text_class = !available
			? 'text-switchery'
			: 'text-switchery active';
		const text = !available
			? 'Indisponível'
			: 'Disponível';

		return (
			<div styleName="switcherys">
				<button
					type="button"
					styleName="changing-switchery"
					onClick={this.handleSwitch} />
				<button
					type="button"
					styleName={switchery_class}>
					<small styleName={small_class} />
				</button>
				<div styleName={text_class}>{text}</div>
			</div>
		);
	}
}

Switchery.propTypes = {
	book: PropTypes.shape({
		id: PropTypes.number.isRequired,
		title: PropTypes.string.isRequired,
		author: PropTypes.string.isRequired,
		link: PropTypes.string.isRequired,
		available: PropTypes.bool.isRequired,
	}).isRequired,
	updateBook: PropTypes.func.isRequired,
};

export default CSSModules(Switchery, styles, { allowMultiple: true });
