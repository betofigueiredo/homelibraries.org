/* eslint-disable */
import React from 'react';
import Enzyme, { shallow, mount, render } from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
import Conversation from './Conversation';

Enzyme.configure({ adapter: new EnzymeAdapter() });
jest.mock('react-css-modules', () => Conversation => Conversation);

test('Conversation render ok', () => {
	// const wrapper = shallow(<Conversation />);
	// expect(
	// 	wrapper.find('[data-test="component-conversation"]').length
	// ).toBe(1);
});
