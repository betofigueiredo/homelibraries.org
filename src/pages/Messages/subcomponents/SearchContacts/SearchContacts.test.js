/* eslint-disable */
import React from 'react';
import Enzyme, { shallow, mount, render } from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
import SearchContacts from './SearchContacts';

Enzyme.configure({ adapter: new EnzymeAdapter() });
jest.mock('react-css-modules', () => SearchContacts => SearchContacts);

test('SearchContacts render ok', () => {
	const wrapper = shallow(<SearchContacts />);
	expect(
		wrapper.find('[data-test="component-searchcontacts"]').length
	).toBe(1);
});
