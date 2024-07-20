// import React, { useEffect, useState } from 'react';
// import { useLocation, useHistory } from 'react-router-dom';

// const RoleSelection = () => {
//   const location = useLocation();
//   const history = useHistory();
//   const [userData, setUserData] = useState({});

//   useEffect(() => {
//     const queryParams = new URLSearchParams(location.search);
//     const data = {};
//     queryParams.forEach((value, key) => {
//       data[key] = value;
//     });
//     setUserData(data);
//   }, [location.search]);

//   const selectRole = (role) => {
//     fetch('http://localhost:8080/forbad/auth/assign-role', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ ...userData, role }),
//     })
//       .then((response) => response.json())
//       .then((authData) => {
//         if (authData.accessToken) {
//           localStorage.setItem('jwtToken', authData.accessToken);
//           localStorage.setItem('tokenExpiration', authData.expirationTime);
//           history.push('/home'); // Chuyển hướng tới trang bảo mật
//         } else {
//           alert('Failed to assign role!');
//         }
//       })
//       .catch((error) => {
//         alert(error.message);
//         console.error(error);
//       });
//   };

//   return (
//     <div>
//       <h1>Select Your Role</h1>
//       <pre>{JSON.stringify(userData, null, 2)}</pre>
//       <button onClick={() => selectRole('admin')}>Select Admin Role</button>
//       <button onClick={() => selectRole('user')}>Select User Role</button>
//     </div>
//   );
// };

// export default RoleSelection;
