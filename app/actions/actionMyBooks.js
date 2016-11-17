import axios from 'axios';
import qs from 'qs';

/*------------------------------------*\

    #FETCH MYBOOKS

\*------------------------------------*/
import { FETCH_MYBOOKS_REQUEST, FETCH_MYBOOKS_SUCCESS, FETCH_MYBOOKS_FAILURE } from './actionTypes';

export const getMyBooks = () => {
    return dispatch => {
        dispatch({ type: FETCH_MYBOOKS_REQUEST });
        axios.get('https://www.homelibraries.org/requests/mybooks/')
        // axios.get('/requests/mybooks.json')
            .then((response) => {
                dispatch({
                    type: FETCH_MYBOOKS_SUCCESS,
                    payload: response.data
                });
            })
            .catch((error) => {
                dispatch({
                    type: FETCH_MYBOOKS_FAILURE,
                    error: 'error'
                });
            });
    }
}


/*------------------------------------*\

    #ADD NEW BOOK

\*------------------------------------*/
import { ADD_NEWBOOK_REQUEST, ADD_NEWBOOK_SUCCESS, ADD_NEWBOOK_FAILURE } from './actionTypes';

export const addNewBook = (title, author, link) => {
    return dispatch => {
        dispatch({ type: ADD_NEWBOOK_REQUEST });
        axios.post('https://www.homelibraries.org/add/book/', qs.stringify(
                { title, author, link }
            ))
            .then(function (response) {
                if (response.data.error) {
                    // console.log('blank fields');
                } else {
                    dispatch({
                        type: ADD_NEWBOOK_SUCCESS,
                        id: response.data.id,
                        title: response.data.title,
                        author: response.data.author,
                        link: response.data.link,
				        available: response.data.available,
				        deleted: response.data.deleted
                    });
                    dispatch({ type: REMOVE_FORM_CLASS });
                }
            })
            .catch(function (error) {
                dispatch({ type: ADD_NEWBOOK_FAILURE });
            });
    }
}

import { ADD_FORM_CLASS, REMOVE_FORM_CLASS } from './actionTypes';

export const toogleNewBookForm = param => {
    if (param === true)
        return { type: ADD_FORM_CLASS }
    else
        return { type: REMOVE_FORM_CLASS }
}


/*------------------------------------*\

    #DELETE BOOK

\*------------------------------------*/
import { DELETE_BOOK_REQUEST, DELETE_BOOK_SUCCESS, DELETE_BOOK_FAILURE } from './actionTypes';

export const deleteBook = (id, i) => {
    return dispatch => {
        // dispatch({ type: DELETE_BOOK_REQUEST });
        axios.get(`https://www.homelibraries.org/delete/book/${id}/`)
            .then((response) => {
                dispatch({
                    type: DELETE_BOOK_SUCCESS,
                    i: i
                });
            })
            .catch((error) => {
                dispatch({ type: DELETE_BOOK_FAILURE });
            });
    }
}

/*------------------------------------*\

    #UNDO DELETE BOOK

\*------------------------------------*/
import { UNDO_DELETE_BOOK_REQUEST, UNDO_DELETE_BOOK_SUCCESS, UNDO_DELETE_BOOK_FAILURE } from './actionTypes';

export const undoDeleteBook = (id, i) => {
    return dispatch => {
        // dispatch({ type: UNDO_DELETE_BOOK_REQUEST });
        axios.get(`https://www.homelibraries.org/undo/book/${id}/`)
            .then((response) => {
                dispatch({
                    type: UNDO_DELETE_BOOK_SUCCESS,
                    i: i
                });
            })
            .catch((error) => {
                dispatch({ type: UNDO_DELETE_BOOK_FAILURE });
            });
    }
}

/*------------------------------------*\

    #TOOGLE AVAILABLE BOOK

\*------------------------------------*/
import { TOOGLE_AVAILABLE_BOOK_REQUEST, TOOGLE_AVAILABLE_BOOK_SUCCESS, TOOGLE_AVAILABLE_BOOK_FAILURE } from './actionTypes';

export const toogleAvailableBook = (id, i, available) => {
    return dispatch => {
        // dispatch({ type: TOOGLE_AVAILABLE_BOOK_REQUEST });
        axios.get(`https://www.homelibraries.org/toogle/book/${id}/${available}/`)
            .then((response) => {
                dispatch({
                    type: TOOGLE_AVAILABLE_BOOK_SUCCESS,
                    i: i,
                    available: response.data.available
                });
            })
            .catch((error) => {
                dispatch({ type: TOOGLE_AVAILABLE_BOOK_FAILURE });
            });
    }
}


/*------------------------------------*\

    #EDIT BOOK

\*------------------------------------*/
import { EDIT_BOOK_REQUEST, EDIT_BOOK_SUCCESS, EDIT_BOOK_FAILURE } from './actionTypes';

export const editBook = (id, i, title, author, link) => {
    return dispatch => {
        dispatch({ type: EDIT_BOOK_REQUEST });
        axios.post('https://www.homelibraries.org/edit/book/', qs.stringify(
                { id, title, author, link }
            ))
            .then((response) => {
                if (response.data.error) {
                    // console.log('blank fields');
                } else {
                    dispatch({
                        type: EDIT_BOOK_SUCCESS,
                        id: response.data.id,
                        i: i,
                        title: response.data.title,
                        author: response.data.author,
                        link: response.data.link
                    });
                }
            })
            .catch((error) => {
                dispatch({ type: EDIT_BOOK_FAILURE });
            });
    }
}
