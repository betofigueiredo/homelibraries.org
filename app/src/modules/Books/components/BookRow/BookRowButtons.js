import React, { useState } from 'react';
// import { useDispatch } from 'react-redux';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

// Interfaces
import bookInterface from '../../interfaces/bookInterface';

// Actions
// import { removeBook } from '../../store/actions';

// Components
import Switchery from '../Switchery';
import ToolTip from '../../../shared/components/ToolTip';
import EditionButton from './EditionButton';
import DeleteButton from './DeleteButton';

// Functions
// import { _post } from '../../../../functions/_requests';

const BookRowButtons = ({ book }) => {
	const [delete_confirm, setDeleteConfirm] = useState(false);
	const [deleting, setDeleting] = useState(0);

	// const dispatch = useDispatch();

	function handleBookEdition() {
		console.log('handleBookEdition');
	}

	function handleBookDeleteConfirm() {
		setDeleteConfirm(!delete_confirm);
	}

	function deleteBook() {
		setDeleting(1);
		// _post(`/book/${book.id}/delete`, {}).then(() => {
		// 	dispatch(removeBook(book.id));
		// 	setDeleteConfirm(false);
		// 	setDeleting(2);
		// }).catch(() => {
		// 	setDeleting(3);
		// });
	}

	if (delete_confirm) {
		return (
			<div styleName="delete-confirm">
				<div styleName="delete-text">Apagar este livro?</div>
				{deleting === 1 ? (
					<button
						type="button"
						className="alert button small"
					>
						Apagando
					</button>
				) : (
					<button
						type="button"
						className="alert button small"
						onClick={deleteBook}
					>
						Apagar
					</button>
				)}
				<button
					type="button"
					className="clear button small"
					onClick={handleBookDeleteConfirm}
				>
					Não
				</button>
			</div>
		);
	}

	return (
		<div styleName="buttons">
			<Switchery book={book} />
			<ToolTip
				text="Editar livro"
				render={(handleMouseEnter, handleMouseLeave) => (
					<EditionButton
						handleMouseEnter={handleMouseEnter}
						handleMouseLeave={handleMouseLeave}
						handleBookEdition={handleBookEdition}
					/>
				)} />
			<ToolTip
				text="Apagar livro"
				render={(handleMouseEnter, handleMouseLeave) => (
					<DeleteButton
						handleMouseEnter={handleMouseEnter}
						handleMouseLeave={handleMouseLeave}
						handleBookDeleteConfirm={handleBookDeleteConfirm}
					/>
				)} />
		</div>
	);
};

BookRowButtons.propTypes = {
	book: bookInterface.isRequired,
};

export default CSSModules(BookRowButtons, styles, { allowMultiple: true });
