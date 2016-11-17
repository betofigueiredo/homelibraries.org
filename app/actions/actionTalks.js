import axios from 'axios';

/*------------------------------------*\

    #FETCH TALKS MESSAGES

\*------------------------------------*/
import { FETCH_TALKS_REQUEST, FETCH_TALKS_SUCCESS, FETCH_TALKS_FAILURE } from './actionTypes';

export const getTalks = () => {
    return dispatch => {
        dispatch({ type: FETCH_TALKS_REQUEST });
        axios.get('https://www.homelibraries.org/requests/talks/')
            .then((response) => {
                dispatch({
                    type: FETCH_TALKS_SUCCESS,
                    payload: response.data
                });
            })
            .catch((error) => {
                console.log(error);
                dispatch({
                    type: FETCH_TALKS_FAILURE,
                    error: 'error'
                });
            });
    }
}
