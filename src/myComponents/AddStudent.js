import * as React from 'react';
import { useState, useContext, useEffect } from 'react';
import { Stack, TextField, Container, Typography, Button } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Alert from '@mui/material/Alert';

import InputAdornment from '@mui/material/InputAdornment';
import { MyContext } from 'src/contexts/myContext';

const AddStudent = () => {
	const { mongodbUser, setMongodbUser } = useContext(MyContext);
	
	let [ inputs, setInputs ] = useState({
		name: '',
		course: '',
		courseFees: 0,
		installmentMonths: 0,
		firstPayment: 0,
		firstInstallmentDate: null
	});

	let [ monthValues, setMonthValues ] = useState(
		Array.from({ length: inputs.installmentMonths }, () => 0)
	);

	let [ success, setSuccess ] = useState(false);

	useEffect(
		() => {
			let timeoutId;

			if (success) {
				timeoutId = setTimeout(() => {
					setSuccess(false); // Hide the modal after 3 seconds
				}, 2300);
			}

			return () => clearTimeout(timeoutId);
		},
		[ success ]
	);

	const handleInstallmentMonthsChange = (event) => {
		const newCount = parseInt(event.target.value);
		setInputs({ ...inputs, installmentMonths: newCount });

		// Resize inputValues array and fill with 0 values
		setMonthValues((prevInputValues) => {
			const resizedInputValues = [ ...prevInputValues ];
			resizedInputValues.length = newCount;
			for (let i = prevInputValues.length; i < newCount; i++) {
				resizedInputValues[i] = 0;
			}
			return resizedInputValues;
		});
	};

	const handleMonthValuesChange = (index, event) => {
		const copyMonthValues = [ ...monthValues ];
		const inputValue = event.target.value;

		// If the input is empty, set it to 0; otherwise, parse the input value
		copyMonthValues[index] = inputValue === '' ? 0 : parseInt(inputValue);

		// Update the inputValues state with the modified array
		setMonthValues(copyMonthValues);
	};

	const handleAddStudent = async () => {
		let studentData = {
			name: inputs.name,
			course: inputs.course,
			withoutFirstPayment: inputs.courseFees,
			courseFees: inputs.courseFees - inputs.firstPayment,
			totalMonths: inputs.installmentMonths,
			installmentMonths: inputs.installmentMonths,
			firstInstallmentDate: inputs.firstInstallmentDate,
			installmentMonths: makeInstallmentMonthsArray(),
			allPaid: false
		};

		// let result = await mongodbUser.functions.addStudent(studentData);

		try {
			let result = await mongodbUser.functions.addStudent(studentData);

			setTimeout(() => {
				setSuccess(true); // Show the modal after successful API request
			}, 2000);
		} catch (error) {
			console.log('Error inserting document:', error);
		}
	};

	const makeInstallmentMonthsArray = () => {
		// const inputDate = new Date('2023-04-27');
		const inputDate = inputs.firstInstallmentDate;
		const array = [];

		for (let i = 0; i < inputs.installmentMonths; i++) {
			const installmentDate = new Date(inputDate);
			// installmentDate.setMonth(inputDate.getMonth() + i + 1);
			installmentDate.setMonth(inputDate.getMonth() + i);

			array.push({
				installmentValue: monthValues[i],
				installmentDate: installmentDate,
				installmentMonthNo: i + 1,
				installmentPaid: false
			});
		}

		return array;
	};

	const h1s = Array.from({ length: inputs.installmentMonths }, (_, index) => (
		<Stack key={index} direction='row' spacing={2}>
			<TextField
				label='Value'
				value={monthValues[index] || ''}
				onChange={(event) => handleMonthValuesChange(index, event)}
				type='number'
				sx={{ width: '180px' }}
				InputProps={{
					startAdornment: <InputAdornment position='start'>₹</InputAdornment>
				}}
			/>
			<Typography variant='subtitle1' gutterBottom>
				{`Month One ${index + 1}`}
			</Typography>
		</Stack>
	));

	return (
		<Container>
			<Typography variant='h2' gutterBottom>
				Add a new student
			</Typography>
			<Stack direction='row' spacing={2}>
				<TextField
					label='Student Name'
					value={inputs.name}
					onChange={(e) => setInputs({ ...inputs, name: e.target.value })}
					sx={{
						width: '330px'
					}}
				/>
				<TextField
					label='Course Name'
					value={inputs.course}
					onChange={(e) => setInputs({ ...inputs, course: e.target.value })}
				/>
			</Stack>
			<Stack direction='row' spacing={2} sx={{ marginTop: '1rem' }}>
				<TextField
					label='Course fees'
					value={inputs.courseFees}
					type='number'
					onChange={(e) => setInputs({ ...inputs, courseFees: Number(e.target.value) })}
					InputProps={{
						startAdornment: <InputAdornment position='start'>₹</InputAdornment>
					}}
				/>
				<TextField
					label='Installment months'
					value={inputs.installmentMonths}
					type='number'
					// onChange={(e) => setInputs({ ...inputs, installmentMonths: Number(e.target.value) })}
					onChange={handleInstallmentMonthsChange}
				/>
			</Stack>
			<Stack direction='row' spacing={2} sx={{ marginTop: '1rem' }}>
				<TextField
					label='First Payment'
					value={inputs.firstPayment}
					type='number'
					onChange={(e) => setInputs({ ...inputs, firstPayment: Number(e.target.value) })}
					InputProps={{
						startAdornment: <InputAdornment position='start'>₹</InputAdornment>
					}}
				/>
				<LocalizationProvider dateAdapter={AdapterDateFns}>
					<DatePicker
						value={inputs.firstInstallmentDate}
						label='First Installment Date'
						onChange={(dateValue) =>
							setInputs({ ...inputs, firstInstallmentDate: dateValue })}
					/>
				</LocalizationProvider>
			</Stack>
			<Stack direction='column' spacing={2} sx={{ marginTop: '1rem' }}>
				<Typography variant='h5' gutterBottom>
					Installments values
				</Typography>
				{h1s}
			</Stack>
			<Button
				sx={{ marginTop: '1rem' }}
				onClick={handleAddStudent}
				disabled={
					inputs.name === '' ||
					inputs.course === '' ||
					inputs.courseFees === undefined ||
					inputs.installmentMonths === undefined ||
					inputs.firstInstallmentDate === null
				}
				variant='contained'
			>
				Add Student
			</Button>
			<Alert sx={{ marginTop: '15px' }} severity='success'>
				This is a success alert — check it out!
			</Alert>
		</Container>
	);
};

export default AddStudent;
