/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useState } from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

// Interfaces
import bookInterface from '../../interfaces/bookInterface';

/* eslint-disable */
// Functions
// import { _post } from '../../functions/_requests';

const Switchery = ({ book, updateBook }) => {
	const [saving, setSaving] = useState(false);

	function handleSwitch() {
		if (saving) {
			return;
		}
		setSaving(true);
		const available = !book.available;
		const params = { available };
		// updateBook(book.id, params);
		// _post(`/book/${book.id}/available`, params).then(() => {
		// 	setSaving(false);
		// }).catch(() => {
		// 	setSaving(false);
		// });
	}

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
				onClick={handleSwitch}
			/>
			<button
				type="button"
				styleName={switchery_class}
			>
				<small styleName={small_class} />
			</button>
			<div styleName={text_class}>{text}</div>
		</div>
	);
};

Switchery.propTypes = {
	book: bookInterface.isRequired,
	updateBook: PropTypes.func.isRequired,
};

export default CSSModules(Switchery, styles, { allowMultiple: true });
