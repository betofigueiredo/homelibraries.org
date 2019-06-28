import { UPDATE_USER, UPDATE_USER_RAW, SET_AUTH, UNSET_AUTH } from './types';

export const updateUser = (field, value) => ({ type: UPDATE_USER, field, value });
export const updateUserRaw = (fields_n_values) => ({ type: UPDATE_USER_RAW, fields_n_values });
export const setAuth = (token, user, tem_express) => ({ type: SET_AUTH, token, user, tem_express });
export const unsetAuth = () => ({ type: UNSET_AUTH });
