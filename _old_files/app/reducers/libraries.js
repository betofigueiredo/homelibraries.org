import update from 'react-addons-update';
import { FETCH_LIBRARIES_REQUEST, FETCH_LIBRARIES_SUCCESS, FETCH_LIBRARIES_FAILURE, SEARCH_LIBRARIES } from '../actions/actionTypes';

function libraries(state = [], action) {
    /*
    Loading status:
        0: not created
        1: loading
        2: loaded ok
        3: error
        4: previous loaded, data ok but page or search was changed and need reload
    */
    switch(action.type) {
        case FETCH_LIBRARIES_REQUEST:
            return update(state, { loading: {$set: 1}, data: {$set: []} });
            break;
        case FETCH_LIBRARIES_SUCCESS:
            return update(state, { loading: {$set: 2}, data: {$set: action.payload}, search: {lat: {$set: action.lat}, lng: {$set: action.lng}} });
            break;
        case FETCH_LIBRARIES_FAILURE:
            return update(state, { loading: {$set: 3}, data: {$set: []} });
            break;
        case SEARCH_LIBRARIES:
            return update(state, {
                loading: {$set: 4},
                search: {
                    address: {$set: action.sAdrress},
                    radius: {$set: action.sRadius},
                    book_author: {$set: action.sBookAuthor},
                    library: {$set: action.sLibrary},
                    lfl: {$set: action.sLfl}
                }
            });
            break;
        default:
            return state;
    }
    return state;
}

export default libraries;
