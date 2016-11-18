import axios from 'axios';

/*------------------------------------*\

    #FETCH CHAT MESSAGES

\*------------------------------------*/
import { FETCH_CHAT_REQUEST, FETCH_CHAT_SUCCESS, FETCH_CHAT_FAILURE } from './actionTypes';

export const getChat = (id) => {
    return dispatch => {
        dispatch({ type: FETCH_CHAT_REQUEST });
        axios.get(`https://www.homelibraries.org/requests/chat/${id}`)
        // axios.get('/requests/chat.json')
            .then((response) => {
                dispatch({
                    type: FETCH_CHAT_SUCCESS,
                    payload: response.data
                });
            })
            .catch((error) => {
                console.log(error);
                dispatch({
                    type: FETCH_CHAT_FAILURE,
                    error: 'error'
                });
            });
    }
}


/*------------------------------------*\

    #UPDATE CHAT - SHOW NEW MESSAGE

\*------------------------------------*/
export const updateChat = (id) => {
    return dispatch => {
        axios.get(`https://www.homelibraries.org/requests/chat/${id}`)
            .then((response) => {
                dispatch({
                    type: FETCH_CHAT_SUCCESS,
                    payload: response.data
                });
            })
            .catch((error) => {
                console.log(error);
                dispatch({
                    type: FETCH_CHAT_FAILURE,
                    error: 'error'
                });
            });
    }
}


/*------------------------------------*\

    #ADD NEW MESSAGE

\*------------------------------------*/
import { ADD_NEWMESSAGE_REQUEST, ADD_NEWMESSAGE_SUCCESS, ADD_NEWMESSAGE_FAILURE } from './actionTypes';

export const addNewChatMessage = (message) => {
    return dispatch => {

        // dispatch({ type: ADD_NEWMESSAGE_REQUEST, message });

        dispatch({ type: ADD_NEWMESSAGE_REQUEST });
        axios.post('/action/add-message', {message})
            .then(function (response) {
                console.log(response.message);
                // dispatch({ type: ADD_NEWMESSAGE_SUCCESS, payload: response.data });
            })
            .catch(function (error) {
                dispatch({ type: ADD_NEWMESSAGE_FAILURE });
            });
    }
}



