import { useEffect, useState, useContext } from "react";
import { MyContext } from 'src/contexts/myContext';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';

const AllPaidTable = () => {
	const { mongodbUser, setMongodbUser } = useContext(MyContext);
   let [collectedArray, setCollectedArray] = useState([]);

   useEffect(() => {
      getData();
   }, [mongodbUser])

   const getData = async () => {
      let result = await mongodbUser.functions.getAllPaid({});
      let copyToSort = result;

      setCollectedArray(copyToSort);
   };

   return(
      <TableContainer component={Paper}>
			<Table sx={{ minWidth: 650 }} aria-label='simple table'>
				<TableHead>
					<TableRow>
						<TableCell>Student's Name</TableCell>
						<TableCell>Course</TableCell>
						<TableCell>Course Fees</TableCell>
						<TableCell>Installments</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{collectedArray.map((collectedObj, i) => {
						return (
							<TableRow key={i} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
								<TableCell component='th' scope='row'>
									{collectedObj.name}
								</TableCell>
								<TableCell>{collectedObj.course}</TableCell>
								<TableCell>{collectedObj.courseFees}</TableCell>
								<TableCell>
									<Chip
										label="All Paid"
										sx={{ backgroundColor: '#454545', color: '#ffffff' }}
									/>
								</TableCell>
							</TableRow>
						);
					})}
				</TableBody>
			</Table>
		</TableContainer>
   )
}

export default AllPaidTable;