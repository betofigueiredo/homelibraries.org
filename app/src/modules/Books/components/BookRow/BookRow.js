import React from 'react';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

// Interfaces
import bookInterface from '../../interfaces/bookInterface';

// Components
import BookSVG from '../../../shared/components/BookSVG';
import BookRowButtons from './BookRowButtons';

// Functions
import { setClasses } from '../../../shared/functions/setClasses';

const BookRow = ({ book }) => {
	const book_wrapper_classes = {
		edited: book.edited,
		added: book.added,
		unavailable: !book.available,
	};
	const book_wrapper_class = setClasses('book-wrapper', book_wrapper_classes);

	const icon_fill = !book.available
		? '#dbe1e6'
		: '#a8dee6';

	return (
		<div className="grid-x grid-padding-x">
			<div className="small-12 cell" styleName="cell">
				<div styleName={book_wrapper_class}>
					<div styleName="icon">
						<BookSVG fill={icon_fill} />
					</div>
					<div styleName="info">
						<p styleName="title">{book.title}</p>
						<p styleName="author">{book.author}</p>
						{book.link !== '' ? (
							<p styleName="link">
								<a href={book.link} target="_blank" rel="noopener noreferrer" data-account-menu>{book.link}</a>
							</p>
						) : (
							<p styleName="link"><em>Sem link de descrição</em></p>
						)}
					</div>
					<BookRowButtons book={book} />
					{book.edited && (
						<div styleName="edited">Livro editado com sucesso!</div>
					)}
					{book.added && (
						<div styleName="added">Livro cadastrado com sucesso!</div>
					)}
				</div>
			</div>
		</div>
	);
};

BookRow.propTypes = {
	book: bookInterface.isRequired,
};

export default CSSModules(BookRow, styles, { allowMultiple: true });
