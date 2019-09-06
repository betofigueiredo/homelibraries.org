/* eslint-disable */
import React from 'react';
import Enzyme, { shallow, mount, render } from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
import MessagesList from './MessagesList';

Enzyme.configure({ adapter: new EnzymeAdapter() });
jest.mock('react-css-modules', () => MessagesList => MessagesList);

test('MessagesList render ok', () => {
	const wrapper = mount(<MessagesList />);
	// expect(
	// 	wrapper.find('[data-test="component-contactrossw"]').length
	// ).toBe(1);

	console.log(wrapper.find('Provider').debug({ verbose: true }));
	// console.log(wrapper.find('Provider').getDOMNode());
	// expect(wrapper).to.have.property('messages', 1);
});
