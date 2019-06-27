import { FETCH_PROFILE_REQUEST, FETCH_PROFILE_SUCCESS, FETCH_PROFILE_FAILURE } from '../actions/actionTypes';

function profiles(state = [], action) {
    switch(action.type) {
        case FETCH_PROFILE_REQUEST:
            return { loading: 1, data: [] };
            break;
        case FETCH_PROFILE_SUCCESS:
            return { loading: 2, data: action.payload };
            break;
        case FETCH_PROFILE_FAILURE:
            return { loading: 3, data: [] };
            break;
        default:
            return state;
    }
    return state;
}

export default profiles;
