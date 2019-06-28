import React from 'react';
import PropTypes from 'prop-types';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

// Components
import Book from '../Book/Book';

const BooksList = ({ mybooks, updateBook, updateMyBooksRaw }) => {
	const { by_id, all_ids } = mybooks;

	return (
		<>
			{all_ids.map(book_id => (
				<Book
					key={book_id}
					book={by_id[book_id]}
					updateBook={updateBook}
					mybooks={mybooks}
					updateMyBooksRaw={updateMyBooksRaw} />
			))}
		</>
	);
};

BooksList.propTypes = {
	mybooks: PropTypes.object.isRequired,
	updateBook: PropTypes.func.isRequired,
	updateMyBooksRaw: PropTypes.func.isRequired,
};

export default CSSModules(BooksList, styles, { allowMultiple: true });
