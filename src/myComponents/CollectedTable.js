import { useEffect, useState, useContext } from 'react';
import { MyContext } from 'src/contexts/myContext';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const CollectedTable = () => {
	const { mongodbUser, setMongodbUser } = useContext(MyContext);
	let [ collectedArray, setCollectedArray ] = useState([]);

	useEffect(
		() => {
			getAllCollected();
		},
		[ mongodbUser ]
	);

	const getAllCollected = async () => {
		let result = await mongodbUser.functions.getAllCollected({});
		let copyToSort = result;

		copyToSort.sort(function (a, b) {
			// Turn your strings into dates, and then subtract them
			// to get a value that is either negative, positive, or zero.
			return new Date(a.collectedDate) - new Date(b.collectedDate);
		});
		// copyToSort.reverse();

		setCollectedArray(copyToSort);
	};

	return (
		<TableContainer component={Paper}>
			<Table sx={{ minWidth: 650 }} aria-label='simple table'>
				<TableHead>
					<TableRow>
						<TableCell>Student's Name</TableCell>
						<TableCell>Course</TableCell>
						<TableCell>Course Fees</TableCell>
						<TableCell>Payment Date</TableCell>
						<TableCell>Installment value</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{collectedArray.map((collectedObj, i) => {
						let currInstallmentMonthObj = collectedObj.installmentMonths.find(
							(obj) => obj.installmentPaid === false
						);
						if (currInstallmentMonthObj === undefined) {
							currInstallmentMonthObj =
								collectedObj.installmentMonths[collectedObj.installmentMonths.length - 1];
						}

						// make small date string from date object
						let month = collectedObj.collectedDate.getUTCMonth() + 1; //months from 1-12
						let day = collectedObj.collectedDate.getUTCDate();
						let year = collectedObj.collectedDate.getUTCFullYear();

						let dateString = day + ' / ' + month + ' / ' + year;

						return (
							<TableRow key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
								<TableCell component='th' scope='row'>
									{collectedObj.name}
								</TableCell>
								<TableCell>{collectedObj.course}</TableCell>
								<TableCell>{collectedObj.courseFees}</TableCell>
								<TableCell>{dateString}</TableCell>
								<TableCell>{currInstallmentMonthObj.installmentValue}</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default CollectedTable;
