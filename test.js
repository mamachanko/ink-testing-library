/* eslint-disable react/prop-types */
import React, {useState, useEffect, useContext} from 'react';
import test from 'ava';
import {Text, StdinContext} from 'ink';
import {render} from '.';

test('render a single frame', t => {
	const Test = () => <Text>Hello World</Text>;
	const {frames, lastFrame} = render(<Test/>);

	t.is(lastFrame(), 'Hello World');
	t.deepEqual(frames, ['Hello World']);
});

test('render multiple frames', t => {
	const Counter = ({count}) => <Text>Count: {count}</Text>;
	const {frames, lastFrame, rerender} = render(<Counter count={0}/>);

	t.is(lastFrame(), 'Count: 0');
	t.deepEqual(frames, ['Count: 0']);

	rerender(<Counter count={1}/>);

	t.is(lastFrame(), 'Count: 1');
	t.deepEqual(frames, ['Count: 0', 'Count: 1']);
});

test('unmount', t => {
	let didMount = false;
	let didUnmount = false;

	const Test = () => {
		didMount = true;

		useEffect(() => {
			return () => {
				didUnmount = true;
			};
		}, []);

		return <Text>Hello World</Text>;
	};

	const {lastFrame, unmount} = render(<Test/>);

	t.is(lastFrame(), 'Hello World');
	t.true(didMount);
	t.false(didUnmount);

	unmount();

	t.true(didUnmount);
});

test('write to stdin', t => {
	const Test = () => {
		const [input, setInput] = useState('');
		const {stdin, setRawMode} = useContext(StdinContext);

		useEffect(() => {
			setRawMode(true);
			stdin.on('data', setInput);

			return () => {
				stdin.removeListener('data', setInput);
				setRawMode(false);
			};
		}, [stdin, setInput, setRawMode]);

		return <Text>{input}</Text>;
	};

	const {stdin, lastFrame} = render(<Test/>);

	t.is(lastFrame(), '');

	stdin.write('Hello World');

	t.is(lastFrame(), 'Hello World');
});
