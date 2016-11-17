import axios from 'axios';

/*------------------------------------*\

    #FETCH LIBRARIES

\*------------------------------------*/
import { FETCH_LIBRARIES_REQUEST, FETCH_LIBRARIES_SUCCESS, FETCH_LIBRARIES_FAILURE } from './actionTypes';

export const getLibraries = (lat, lng, radius, bookauthor, libraries, lfl) => {
    return dispatch => {
        dispatch({ type: FETCH_LIBRARIES_REQUEST });
        axios.get('https://www.homelibraries.org/requests/libraries/', {
                params: {
                    lat: lat,
                    lng: lng,
                    radius: radius,
                    bookauthor: bookauthor,
                    libraries: libraries,
                    lfl: lfl
                }
            })
            .then((response) => {
                dispatch({
                    type: FETCH_LIBRARIES_SUCCESS,
                    payload: response.data,
                    lat: lat,
                    lng: lng
                });
            })
            .catch((error) => {
                console.log(error);
                dispatch({
                    type: FETCH_LIBRARIES_FAILURE,
                    error: 'error'
                });
            });
    }
}

import { SEARCH_LIBRARIES } from './actionTypes';

export const searchLibraries = (sAdrress, sRadius, sBookAuthor, sLibrary, sLfl) => {
    return { type: SEARCH_LIBRARIES, sAdrress, sRadius, sBookAuthor, sLibrary, sLfl }
}
