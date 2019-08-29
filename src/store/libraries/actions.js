export const updateLibraries = (field, value) => ({ type: 'UPDATE_LIBRARIES', field, value });
export const updateLibrariesRaw = (fields_n_values) => ({ type: 'UPDATE_LIBRARIES_RAW', fields_n_values });
export const getLibraries = (params = {}) => ({ type: 'LIBRARIES_REQUESTED', params });
