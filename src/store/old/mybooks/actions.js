import { UPDATE_MYBOOKS, UPDATE_MYBOOKS_RAW, UPDATE_BOOK } from './types';

export const updateMyBooks = (field, value) => ({ type: UPDATE_MYBOOKS, field, value });
export const updateMyBooksRaw = (fields_n_values) => ({ type: UPDATE_MYBOOKS_RAW, fields_n_values });
export const updateBook = (book_id, fields_n_values) => ({ type: UPDATE_BOOK, book_id, fields_n_values });
