import books from './store';
import reducerUtil from '../../../utils/redux/reducerUtil';

// Actions external logic
import booksReceived from './logic/booksReceived';
import booksRequested from './logic/booksRequested';
import booksRequestFailed from './logic/booksRequestFailed';
import removeBook from './logic/removeBook';
import updateBook from './logic/updateBook';

const funcs = {
	BOOKS_RECEIVED: booksReceived,
	BOOKS_REQUESTED: booksRequested,
	BOOKS_REQUEST_FAILED: booksRequestFailed,
	REMOVE_BOOK: removeBook,
	UPDATE_BOOK: updateBook,
};

const reducer = reducerUtil(books, funcs);
export default reducer;
