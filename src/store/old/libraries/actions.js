import { UPDATE_LIBRARIES, UPDATE_LIBRARIES_RAW } from './types';

export const updateLibraries = (field, value) => ({ type: UPDATE_LIBRARIES, field, value });
export const updateLibrariesRaw = (fields_n_values) => ({ type: UPDATE_LIBRARIES_RAW, fields_n_values });
