import axios from 'axios';

/*------------------------------------*\

    #FETCH LIBRARIES

\*------------------------------------*/
import { FETCH_PROFILE_REQUEST, FETCH_PROFILE_SUCCESS, FETCH_PROFILE_FAILURE } from './actionTypes';

export const getProfiles = (username) => {
    return dispatch => {
        dispatch({ type: FETCH_PROFILE_REQUEST });
        axios.get(`https://www.homelibraries.org/requests/profile/${username}/`)
            .then((response) => {
                dispatch({
                    type: FETCH_PROFILE_SUCCESS,
                    payload: response.data
                });
            })
            .catch((error) => {
                dispatch({
                    type: FETCH_PROFILE_FAILURE,
                    error: 'error'
                });
            });
    }
}
