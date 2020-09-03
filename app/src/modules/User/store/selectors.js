import { createSelector } from 'reselect';

export const userLoggedSelector = createSelector(
	store => store.user.token,
	token => token !== '',
);
