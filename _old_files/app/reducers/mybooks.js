import update from 'react-addons-update';
import { FETCH_MYBOOKS_REQUEST, FETCH_MYBOOKS_SUCCESS, FETCH_MYBOOKS_FAILURE, ADD_NEWBOOK_REQUEST, ADD_NEWBOOK_SUCCESS, ADD_NEWBOOK_FAILURE, ADD_FORM_CLASS, REMOVE_FORM_CLASS, DELETE_BOOK_REQUEST, DELETE_BOOK_SUCCESS, DELETE_BOOK_FAILURE, UNDO_DELETE_BOOK_REQUEST, UNDO_DELETE_BOOK_SUCCESS, UNDO_DELETE_BOOK_FAILURE } from '../actions/actionTypes';
import { TOOGLE_AVAILABLE_BOOK_REQUEST, TOOGLE_AVAILABLE_BOOK_SUCCESS, TOOGLE_AVAILABLE_BOOK_FAILURE } from '../actions/actionTypes';
import { EDIT_BOOK_REQUEST, EDIT_BOOK_SUCCESS, EDIT_BOOK_FAILURE } from '../actions/actionTypes';

function mybooks(state = [], action) {
    switch(action.type) {
        case FETCH_MYBOOKS_REQUEST:
            return update(state, { loading: {$set: 1}, data: {$set: []} });
            break;
        case FETCH_MYBOOKS_SUCCESS:
            return update(state, { loading: {$set: 2}, data: {$set: action.payload} });
            break;
        case FETCH_MYBOOKS_FAILURE:
            return { loading: 3, editing: 0, form: '', data: [] }
            break;
        case ADD_NEWBOOK_REQUEST:
            return update(state, { editing: {$set: 1} });
            break;
        case ADD_NEWBOOK_SUCCESS:
            return { editing: 2, data: [
                ...state.data,
                {
                    id: action.id,
                    title: action.title,
                    author: action.author,
                    link: action.link,
                    available: 1
                }
            ] };
            break;
        case ADD_NEWBOOK_FAILURE:
            return update(state, { editing: {$set: 3} });
            break;
        case ADD_FORM_CLASS:
            return update(state, { form: {$set: ' open'} });
            break;
        case REMOVE_FORM_CLASS:
            return update(state, { form: {$set: ''} });
            break;
        /*------------------------------------*\

            #DELETE BOOK

        \*------------------------------------*/
        case DELETE_BOOK_SUCCESS:
            return update(state, {
                data: {
                    [action.i]: { deleted: {$set: 1} }
                }
            });
            break;
        case UNDO_DELETE_BOOK_SUCCESS:
            return update(state, {
                data: {
                    [action.i]: { deleted: {$set: 0} }
                }
            });
            break;
        /*------------------------------------*\

            #TOOGLE AVAILABLE BOOK

        \*------------------------------------*/
        case TOOGLE_AVAILABLE_BOOK_SUCCESS:
            return update(state, {
                data: {
                    [action.i]: { available: {$set: action.available} }
                }
            });
            break;
        /*------------------------------------*\

            #EDIT BOOK

        \*------------------------------------*/
        case EDIT_BOOK_REQUEST:
            return update(state, { editing: {$set: 1} });
            break;
        case EDIT_BOOK_SUCCESS:
            return update(state, {
                editing: {$set: 2},
                data: {
                    [action.i]: { 
                        title: {$set: action.title},
                        author: {$set: action.author},
                        link: {$set: action.link}
                    }
                }
            });
            break;
        case EDIT_BOOK_FAILURE:
            return update(state, { editing: {$set: 3} });
            break;



        default:
            return state;
    }
    return state;
}

export default mybooks;
