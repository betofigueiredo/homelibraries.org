import {
	BOOKS_REQUESTED,
	REMOVE_BOOK,
} from './types';

export const updateMyBooks = (field, value) => ({ type: 'UPDATE_MYBOOKS', field, value });
export const updateMyBooksRaw = (fields_n_values) => ({ type: 'UPDATE_MYBOOKS_RAW', fields_n_values });
export const updateBook = (book_id, fields_n_values) => ({ type: 'UPDATE_BOOK', book_id, fields_n_values });

export const removeBook = (book_id) => ({ type: REMOVE_BOOK, book_id });
export const getBooks = () => ({ type: BOOKS_REQUESTED });
