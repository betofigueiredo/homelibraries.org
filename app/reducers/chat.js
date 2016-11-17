import update from 'react-addons-update';
import { FETCH_CHAT_REQUEST, FETCH_CHAT_SUCCESS, FETCH_CHAT_FAILURE } from '../actions/actionTypes';
import { ADD_NEWMESSAGE_REQUEST, ADD_NEWMESSAGE_SUCCESS, ADD_NEWMESSAGE_FAILURE } from '../actions/actionTypes';

function chat(state = [], action) {
    switch(action.type) {
        case FETCH_CHAT_REQUEST:
            return update(state, { loading: {$set: 1}, messages: {$set: []} });
            break;
        case FETCH_CHAT_SUCCESS:
            return update(state, { $set: action.payload });
            break;
        case FETCH_CHAT_FAILURE:
            return update(state, { loading: {$set: 3}, messages: {$set: []} });
            break;
        /*------------------------------------*\

            #ADD NEW MESSAGE

        \*------------------------------------*/
        case ADD_NEWMESSAGE_REQUEST:
            return update(state, { adding: {$set: 1} });
            break;
        case ADD_NEWMESSAGE_SUCCESS:
            return { adding: 2, messages: [
                ...state.messages,
                {
                    id: action.id,
                    position: 'r',
                    id_send: action.id_send,
                    id_received: action.id_received,
                    talk: action.talk,
                    id_book: action.id_book,
                    book_confirmed: action.book_confirmed,
                    message: action.message,
                    created: action.created
                }
            ] };
            break;
        default:
            return state;
    }
    return state;
}

export default chat;
