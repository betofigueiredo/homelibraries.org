import React from 'react';
import { useSelector, shallowEqual } from 'react-redux';

// CSS
import CSSModules from 'react-css-modules';
import styles from './style.module.sass';

// Components
import NoBooks from '../NoBooks';
import BookRow from '../BookRow';

function BooksList() {
	const all_ids = useSelector(
		store => store.books.all_ids, shallowEqual,
	);
	const by_id = useSelector(
		store => store.books.by_id, shallowEqual,
	);

	if (all_ids.length === 0) {
		return <NoBooks />;
	}

	return (
		<>
			{all_ids.map(book_id => (
				<BookRow
					key={book_id}
					book={by_id[book_id]}
					// updateBook={updateBook}
					// mybooks={mybooks}
					// updateMyBooksRaw={updateMyBooksRaw}
				/>
			))}
		</>
	);
}

export default CSSModules(BooksList, styles, { allowMultiple: true });
