/* eslint-disable */
import React from 'react';
import Enzyme, { shallow, mount, render } from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
import ContactRow from './ContactRow';

Enzyme.configure({ adapter: new EnzymeAdapter() });
jest.mock('react-css-modules', () => ContactRow => ContactRow);

test('ContactRow render ok', () => {
	const wrapper = shallow(<ContactRow />);
	expect(
		wrapper.find('[data-test="component-contactrow2222"]').length
	).toBe(1);
});
