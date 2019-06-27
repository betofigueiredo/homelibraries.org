import update from 'react-addons-update';
import { FETCH_TALKS_REQUEST, FETCH_TALKS_SUCCESS, FETCH_TALKS_FAILURE } from '../actions/actionTypes';

function talks(state = [], action) {
    switch(action.type) {
        case FETCH_TALKS_REQUEST:
            return update(state, { loading: {$set: 1}, data: {$set: []} });
            break;
        case FETCH_TALKS_SUCCESS:
            return update(state, { loading: {$set: 2}, data: {$set: action.payload} });
            break;
        case FETCH_TALKS_FAILURE:
            return update(state, { loading: {$set: 3}, data: {$set: []} });
            break;
        default:
            return state;
    }
    return state;
}

export default talks;
