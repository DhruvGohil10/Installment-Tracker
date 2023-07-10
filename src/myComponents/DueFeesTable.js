import { useState, useContext, useEffect } from 'react';
import { MyContext } from 'src/contexts/myContext';
import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';

const DueFeesTable = () => {
	const { mongodbUser, setMongodbUser } = useContext(MyContext);
	let [ studentsArray, setStudentsArray ] = useState([]);
	// let [ currentInstallmentMonth, setCurrentInstallmentMonth ] = useState({});

	useEffect(
		() => {
			getAllStudents();
		},
		[ mongodbUser ]
	);

	const getAllStudents = async () => {
		let result = await mongodbUser.functions.getAllStudents({});
		// let copyToSort = result;

		// copyToSort.sort(function (a, b) {
		// 	// Turn your strings into dates, and then subtract them
		// 	// to get a value that is either negative, positive, or zero.
		// 	return (
		// 		new Date(
		// 			b.installmentMonths.find((obj) => obj.installmentPaid === false).installmentDate
		// 		) -
		// 		new Date(
		// 			a.installmentMonths.find((obj) => obj.installmentPaid === false).installmentDate
		// 		)
		// 	);
		// });
		// copyToSort.reverse();

		setStudentsArray(result);
	};

	const handleMoveToAllPaid = async (studentObj) => {
		let objToSend = Object.assign({}, studentObj);
		delete objToSend._id;
		//add student object to all_paid collection
		let result = await mongodbUser.functions.addToAllPaid(objToSend, studentObj._id.toString());
		//delete student object from students collection
		let result2 = await mongodbUser.functions.deleteStudent(studentObj._id.toString());
		getAllStudents();
	}

	const addToCollected = async (studentObj) => {
		const date = new Date();
		let collectedObj = Object.assign({}, studentObj);
		delete collectedObj._id;
		collectedObj.collectedDate = date;
		let result = await mongodbUser.functions.addToCollected(collectedObj);
		// console.log(result);
	};

	const handlePaid = async (studentObj, currInstallmentMonthObj) => {
		addToCollected(studentObj);
		let arrayToUpdate = studentObj.installmentMonths;
		let index = arrayToUpdate.findIndex(
			(arrItem) => arrItem.installmentMonthNo === currInstallmentMonthObj.installmentMonthNo
		);
		let updatedObject = arrayToUpdate[index];
		updatedObject['installmentPaid'] = true;
		arrayToUpdate[index] = updatedObject;
		// data['installmentMonths'] = arrayToUpdate;
		let result = await mongodbUser.functions.updatePaidFees(
			studentObj._id.toString(),
			arrayToUpdate
		);
		getAllStudents();
	};

	return (
		<TableContainer component={Paper}>
			<Table sx={{ minWidth: 650 }} aria-label='simple table'>
				<TableHead>
					<TableRow>
						<TableCell>Student's Name</TableCell>
						<TableCell>Course</TableCell>
						<TableCell>Course Fees</TableCell>
						<TableCell>Installment</TableCell>
						<TableCell>Payment Date</TableCell>
						<TableCell>Installment value</TableCell>
						<TableCell>Add installment</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{studentsArray.map((studentObj, i) => {
						let allInstallmentsDone = false;

						let currInstallmentMonthObj = studentObj.installmentMonths.find(
							(obj) => obj.installmentPaid === false
						);

						if (currInstallmentMonthObj === undefined) {
							allInstallmentsDone = true;
						}

						let dateString = '-'
						if (allInstallmentsDone === false) {
							// make small date string from date object
							let month = currInstallmentMonthObj.installmentDate.getUTCMonth() + 1; //months from 1-12
							let day = currInstallmentMonthObj.installmentDate.getUTCDate();
							let year = currInstallmentMonthObj.installmentDate.getUTCFullYear();

							dateString = day + ' / ' + month + ' / ' + year;
						}

						// check if today's date is from before or after
						const today = new Date();
						let chipColor;
						let chipText;

						if(allInstallmentsDone === true){
							chipColor = '#454545';
							chipText = 'All Paid';
						}
						else if (currInstallmentMonthObj.installmentDate.getTime() < today.getTime()) {
							// console.log('The given date is before today.');
							chipColor = '#ff4fca';
							chipText = 'Due fees';
						}
						else if (currInstallmentMonthObj.installmentDate.getTime() > today.getTime()) {
							// console.log('The given date is after today.');
							chipColor = '#9f7cff';
							chipText = 'Upcoming';
						}
						else {
							// console.log('The given date is today.');
							chipColor = '#ff4fca';
							chipText = 'Due fees';
						}

						return (
							<TableRow key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
								<TableCell component='th' scope='row'>
									{studentObj.name}
								</TableCell>
								<TableCell>{studentObj.course}</TableCell>
								<TableCell>{studentObj.courseFees}</TableCell>
								<TableCell>
									<Chip
										label={chipText}
										sx={{ backgroundColor: chipColor, color: '#ffffff' }}
									/>
								</TableCell>
								<TableCell>{dateString}</TableCell>
								<TableCell>{allInstallmentsDone === false ? currInstallmentMonthObj.installmentValue : "-"}</TableCell>
								<TableCell>
									{allInstallmentsDone === true ? (
										<Button
											variant='outlined'
											endIcon={<DriveFileMoveIcon />}
											onClick={() => handleMoveToAllPaid(studentObj)}
										>
										Move To All Paid
									</Button>
									) : (
										<Button
											variant='outlined'
											endIcon={<AddIcon />}
											onClick={() => handlePaid(studentObj, currInstallmentMonthObj)}
											disabled={allInstallmentsDone === true ? true : false}
										>
										Paid
									</Button>
									)}
									
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default DueFeesTable;
