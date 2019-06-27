import update from 'react-addons-update';
import { SIGNIN_EMAIL_REQUEST, SIGNIN_EMAIL_SUCCESS, SIGNIN_EMAIL_FAILURE } from '../actions/actionTypes';
import { SIGNIN_REQUEST, SIGNIN_SUCCESS, SIGNIN_ERROR, SIGNIN_FAILURE } from '../actions/actionTypes';
import { AUTH_REQUEST, AUTH_SUCCESS, AUTH_FAILURE } from '../actions/actionTypes';
import { EDIT_ACCOUNT_REQUEST, EDIT_ACCOUNT_SUCCESS, EDIT_ACCOUNT_FAILURE, EDIT_ACCOUNT_CLEAN } from '../actions/actionTypes';
import { SIGNUP_REQUEST, SIGNUP_SUCCESS, SIGNUP_ERROR, SIGNUP_FAILURE } from '../actions/actionTypes';
import { SIGNOFF_REQUEST, SIGNOFF_SUCCESS, SIGNOFF_FAILURE } from '../actions/actionTypes';

function user(state = [], action) {
    switch(action.type) {
        /*------------------------------------*\

            #SIGN IN

        \*------------------------------------*/
        // case SIGNIN_EMAIL_REQUEST:
        //     return update(state, { loading: {$set: 1} });
        //     break;
        // case SIGNIN_EMAIL_SUCCESS:
        //     return update(state, { loading: {$set: 2} });
        //     break;
        // case SIGNIN_EMAIL_FAILURE:
        //     return update(state, { loading: {$set: 3} });
        //     break;
        case SIGNIN_REQUEST:
            return update(state, {loading: {$set: 4} });
            break;
        case SIGNIN_SUCCESS:
            return update(state, {
                loading: {$set: action.data.loading},
                error: {$set: action.data.error},
                logged: {$set: action.data.logged},
                id: {$set: action.data.id},
                url: {$set: action.data.url},
                color: {$set: action.data.color},
                picture: {$set: action.data.picture},
                name: {$set: action.data.name},
                address: {
                    details: {$set: action.data.address.details},
                    lat: {$set: action.data.address.lat},
                    lng: {$set: action.data.address.lng},
                },
                lfl: {
                    number: {$set: action.data.lfl.number},
                    confirmed: {$set: action.data.lfl.confirmed}
                },
                language: {$set: action.data.language}
            });
            break;
        case SIGNIN_ERROR:
            return update(state, {
                loading: {$set: 5},
                error: {$set: action.error},
                logged: {$set: false},
                id: {$set: 0},
                url: {$set: ''},
                color: {$set: ''},
                picture: {$set: ''},
                name: {$set: ''},
                address: {
                    details: {$set: ''},
                    lat: {$set: 0},
                    lng: {$set: 0},
                },
                lfl: {
                    number: {$set: 0},
                    confirmed: {$set: false}
                }
            });
            break;
        case SIGNIN_FAILURE:
            return update(state, {loading: {$set: 6} });
            break;
        /*------------------------------------*\

            #AUTH

        \*------------------------------------*/
        case AUTH_REQUEST:
        	return update(state, { loading: {$set: 1} });
            break;
        case AUTH_SUCCESS:
            return update(state, {
                loading: {$set: action.data.loading},
                error: {$set: action.data.error},
                logged: {$set: action.data.logged},
                id: {$set: action.data.id},
                url: {$set: action.data.url},
                color: {$set: action.data.color},
                picture: {$set: action.data.picture},
                name: {$set: action.data.name},
                address: {
                    details: {$set: action.data.address.details},
                    lat: {$set: action.data.address.lat},
                    lng: {$set: action.data.address.lng}
                },
                lfl: {
                    number: {$set: action.data.lfl.number},
                    confirmed: {$set: action.data.lfl.confirmed}
                },
                language: {$set: action.data.language}
            });
            break;
        case AUTH_FAILURE:
        	return update(state, { loading: {$set: 3}, id: {$set: 0} });
            break;
        /*------------------------------------*\

            #SIGN UP

        \*------------------------------------*/
        case SIGNUP_REQUEST:
            return update(state, {loading: {$set: 4} });
            break;
        case SIGNUP_SUCCESS:
            return update(state, {
                loading: {$set: action.data.loading},
                error: {$set: action.data.error},
                logged: {$set: action.data.logged},
                id: {$set: action.data.id},
                url: {$set: action.data.url},
                color: {$set: action.data.color},
                picture: {$set: action.data.picture},
                name: {$set: action.data.name},
                address: {
                    details: {$set: action.data.address.details},
                    lat: {$set: action.data.address.lat},
                    lng: {$set: action.data.address.lng},
                },
                lfl: {
                    number: {$set: action.data.lfl.number},
                    confirmed: {$set: action.data.lfl.confirmed}
                },
                language: {$set: action.data.language}
            });
            break;
        case SIGNUP_ERROR:
            return update(state, {
                loading: {$set: 5},
                error: {$set: action.error},
                logged: {$set: false}
            });
            break;
        case SIGNUP_FAILURE:
            return update(state, {loading: {$set: 6} });
            break;
        /*------------------------------------*\

            #EDIT PROFILE

        \*------------------------------------*/
        case EDIT_ACCOUNT_REQUEST:
            return update(state, { editing: { status: {$set: 1} } });
            break;
        case EDIT_ACCOUNT_SUCCESS:
            switch(action.data.field) {
                case 'name':
                    return update(state, { 
                        editing: { status: {$set: 2}, error: {$set: ''} },
                        name: {$set: action.data.name}
                    });
                    break;
                case 'url':
                    if (action.data.error == 'already_exist') {
                        return update(state, { editing: { status: {$set: 2}, error: {$set: action.data.error} } });
                    } else {
                        return update(state, { editing: { status: {$set: 2}, error: {$set: ''} }, url: {$set: action.data.url} });
                    }
                    break;
                case 'address':
                    return update(state, {
                        editing: { status: {$set: 2}, error: {$set: ''} },
                        address: { details: {$set: action.data.address} }
                    });
                    break;
                case 'map':
                    return update(state, {
                        editing: { status: {$set: 2}, error: {$set: ''} },
                        address: { lat: {$set: action.data.lat}, lng: {$set: action.data.lng} }
                    });
                    break;
                case 'lfl':
                    return update(state, {
                        editing: { status: {$set: 2}, error: {$set: ''} },
                        lfl: { number: {$set: action.data.lfl}, confirmed: {$set: false} }
                    });
                    break;
                case 'email':
                    break;
                case 'language':
                    return update(state, {
                        editing: { status: {$set: 2}, error: {$set: ''} },
                        language: {$set: action.data.language}
                    });
                    break;
            }
            break;
        case EDIT_ACCOUNT_FAILURE:
            return update(state, { editing: { status: {$set: 3} }});
            break;
        case EDIT_ACCOUNT_CLEAN:
            return update(state, { editing: { status: {$set: 0}, error: {$set: ''} } });
            break;
        /*------------------------------------*\

            #SIGN OFF

        \*------------------------------------*/
        case SIGNOFF_SUCCESS:
            return update(state, {
                loading: {$set: 5},
                error: {$set: action.error},
                logged: {$set: false},
                id: {$set: 0},
                url: {$set: ''},
                color: {$set: ''},
                picture: {$set: ''},
                name: {$set: ''},
                address: {
                    details: {$set: ''},
                    lat: {$set: 0},
                    lng: {$set: 0},
                },
                lfl: {
                    number: {$set: 0},
                    confirmed: {$set: false}
                }
            });
            break;
        case SIGNOFF_FAILURE:
            return state;
            break;

        default:
            return state;
    }
    return state;
};

export default user;
