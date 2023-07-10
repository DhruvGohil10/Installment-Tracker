import React, { createContext, useState, useEffect } from 'react';
import * as Realm from 'realm-web';

// Create a new context
export const MyContext = createContext();

// Create a provider for the context
export const MyProvider = ({ children }) => {
   const [mongodbUser, setMongodbUser] = useState(null);

   useEffect(() => {
		connectRelm();
	}, []);

	async function connectRelm () {
		const app = new Realm.App({ id: 'try_catch_manager-hpxeg' });

		const credentials = Realm.Credentials.anonymous();
		try {
			const user = await app.logIn(credentials);
			setMongodbUser(user)
			// const result = await user.functions.getAllStudents();

			// setStudents(result);
		} catch (err) {
			console.error(err);
		}
	}

	// const updatePaidFees = async (documentId ,inputValue) => {
		
	// 	let result = await mongodbUser.functions.updatePaidFees(documentId ,inputValue);
	// 	console.log(result);
	// }

   return (
      <MyContext.Provider value={{ mongodbUser, setMongodbUser }}>
         {children}
      </MyContext.Provider>
   );
};