import { createContext, useEffect, useState } from 'react';
import './App.css';
import Login from './Components/Login';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primereact/resources/primereact.min.css";
import 'primeicons/primeicons.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import secureLocalStorage from 'react-secure-storage';
import Logo from './Assets/logo.svg'
import { getToken } from './apiCalls';
import Dashboard from './Components/Dashboard';

export const context = createContext();

function App() {
  const [accessToken, setAccessToken] = useState();
  const [refreshToken, setRefreshToken] = useState();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [autoLogging, setAutoLogging] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [users, setUsers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [calendars, setCalendars] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");

  function logout(){
    secureLocalStorage.removeItem('email');
    secureLocalStorage.removeItem('password');
    window.location.reload();
  }

  useEffect(()=>{
    const email = secureLocalStorage.getItem("email");
    const password = secureLocalStorage.getItem("password");

    if(email && password){
      setAutoLogging(true);
      getToken(email, password, async (resp)=>{
        if(resp.ok){
          const {refresh, access} = await resp.json();
          secureLocalStorage.setItem('email', email.toLowerCase());
          secureLocalStorage.setItem('password', password);
          setRefreshToken(refresh);
          setAccessToken(access);
          setIsLoggedIn(true);
          setAutoLogging(false);
        }
        else{
          setAutoLogging(false);
        }
      })
    }
  },[])

  return (
    <context.Provider value={{
      accessToken,
      setAccessToken,
      refreshToken,
      setRefreshToken,
      setIsLoggedIn,
      appointments,
      setAppointments,
      users,
      setUsers,
      skills,
      setSkills,
      calendars,
      setCalendars,
      locations,
      setLocations,
      selectedLocation,
      setSelectedLocation,
      logout
    }}>
      <div className="App">
        {
          autoLogging
          ?
            <img className='splash' src={Logo} alt="logo" />
          :
            isLoggedIn
            ?
              <Dashboard />
            :
              <Login />
        }
      </div>
      <ToastContainer />
    </context.Provider>
  );
}

export default App;
