import axios from 'axios';
import qs from 'qs';

/*------------------------------------*\

    #SIGN IN

\*------------------------------------*/
import { SIGNIN_EMAIL_REQUEST, SIGNIN_EMAIL_SUCCESS, SIGNIN_EMAIL_FAILURE } from './actionTypes';

export const signInSendEmail = (email) => {
    return dispatch => {
        dispatch({ type: SIGNIN_EMAIL_REQUEST });
        axios.post('https://www.homelibraries.org/me/emailing', qs.stringify(
                { email }
            ))
            .then(function (response) {
                if (response.data.error) {
                    // console.log('blank fields');
                } else {
                    dispatch({ type: SIGNIN_EMAIL_SUCCESS });
                }
            })
            .catch(function (error) {
                dispatch({ type: SIGNIN_EMAIL_FAILURE });
            });
    }
}

import { SIGNIN_REQUEST, SIGNIN_SUCCESS, SIGNIN_ERROR, SIGNIN_FAILURE } from './actionTypes';

export const signInSendPassword = (email, password) => {
    return dispatch => {
        dispatch({ type: SIGNIN_REQUEST });
        axios.post('https://www.homelibraries.org/me/signing', qs.stringify(
                { email, password }
            ))
            .then((response) => {
                if (response.data.error) {
                    switch(response.data.error) {
                        case 'blank_fields':
                            dispatch({ type: SIGNIN_ERROR, error: 1 });
                            break;
                        case 'wrong_email':
                            dispatch({ type: SIGNIN_ERROR, error: 2 });
                            break;
                        case 'wrong_password':
                            dispatch({ type: SIGNIN_ERROR, error: 3 });
                            break;
                        case 'expired':
                            dispatch({ type: SIGNIN_ERROR, error: 4 });
                            break;
                    }
                } else {
                    dispatch({ type: SIGNIN_SUCCESS, data: response.data });
                }
            })
            .catch((error) => {
                dispatch({ type: SIGNIN_FAILURE });
            });
    }
}


/*------------------------------------*\

    #SIGN UP

\*------------------------------------*/
import { SIGNUP_REQUEST, SIGNUP_SUCCESS, SIGNUP_ERROR, SIGNUP_FAILURE } from './actionTypes';

export const signUp = (name, email) => {
    return dispatch => {
        dispatch({ type: SIGNUP_REQUEST });
        axios.post('https://www.homelibraries.org/me/create', qs.stringify(
                { name, email }
            ))
            .then((response) => {
                if (response.data.error) {
                    switch(response.data.error) {
                        case 'blank_fields':
                            dispatch({ type: SIGNUP_ERROR, error: 1 });
                            break;
                        case 'already_exist':
                            dispatch({ type: SIGNUP_ERROR, error: 2 });
                            break;
                    }
                } else {
                    dispatch({ type: SIGNUP_SUCCESS, data: response.data });
                }
            })
            .catch((error) => {
                dispatch({ type: SIGNUP_FAILURE });
            });
    }
}


/*------------------------------------*\

    #AUTH CHECK

\*------------------------------------*/
import { AUTH_REQUEST, AUTH_SUCCESS, AUTH_FAILURE } from './actionTypes';

export const checkAuth = () => {
    return dispatch => {
        dispatch({ type: AUTH_REQUEST });
        axios.get('https://www.homelibraries.org/auth/check')
            .then((response) => {
                dispatch({ type: AUTH_SUCCESS, data: response.data });
            })
            .catch((error) => {
                dispatch({ type: AUTH_FAILURE });
            });
    }
}


/*------------------------------------*\

    #EDIT PROFILE

\*------------------------------------*/
import { EDIT_ACCOUNT_REQUEST, EDIT_ACCOUNT_SUCCESS, EDIT_ACCOUNT_FAILURE, EDIT_ACCOUNT_CLEAN } from './actionTypes';

export const editAccount = (field, values) => {
    return dispatch => {
        axios.post('https://www.homelibraries.org/me/editing', qs.stringify(
                { field, values }
            ))
            .then((response) => {
                dispatch({ type: EDIT_ACCOUNT_SUCCESS, data: response.data });
            })
            .catch((error) => {
                dispatch({ type: EDIT_ACCOUNT_FAILURE });
            });
    }
}

export const cleanEditionState = () => {
	return { type: EDIT_ACCOUNT_CLEAN }
}


/*------------------------------------*\

    #SIGN OFF

\*------------------------------------*/
import { SIGNOFF_REQUEST, SIGNOFF_SUCCESS, SIGNOFF_FAILURE } from './actionTypes';

export const signOff = () => {
    return dispatch => {
        axios.get('https://www.homelibraries.org/me/signoff')
            .then((response) => {
                dispatch({ type: SIGNOFF_SUCCESS });
            })
            .catch((error) => {
                dispatch({ type: SIGNOFF_FAILURE });
            });
    }
}
