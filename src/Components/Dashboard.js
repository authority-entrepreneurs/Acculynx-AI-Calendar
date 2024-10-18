import React, { useContext, useEffect } from 'react';
import '../Styles/Dashboard.css';
import { TabView, TabPanel } from 'primereact/tabview';
import Appointments from './Appointments';
import Users from './Users';
import { context } from '../App';
import { getAppointments, getSkills, getUsers, refreshTokenFn, verifyToken } from '../apiCalls';

export default function Dashboard() {
    const {
        accessToken,
        setAccessToken,
        refreshToken,
        setIsLoggedIn,
        setAppointments,
        setUsers,
        setSkills
    } = useContext(context);

    
    function getData(token){
        getAppointments(token, async (resp)=>{
            if(resp.ok){
                const data = await resp.json();
                setAppointments(data);
            }
            else{
                const {detail} = await resp.json();
                console.log(detail, "while getting appointments list");
            }
        });
        
        getUsers(token, async (resp)=>{
            if(resp.ok){
                const data = await resp.json();
                setUsers(data);
            }
            else{
                const {detail} = await resp.json();
                console.log(detail, "while getting users list");
            }
        });
        
        getSkills(token, async (resp)=>{
            if(resp.ok){
                const data = await resp.json();
                setSkills(data);
            }
            else{
                const {detail} = await resp.json();
                console.log(detail, "while getting skills list");
            }
        });
    }
    
    useEffect(()=>{
        verifyToken(accessToken, async (resp)=>{
            if(resp.ok){
                getData(accessToken);
            }
            else{
                refreshTokenFn(refreshToken, async (resp)=>{
                    if(resp.ok){
                        const {access} = await resp.json();
                        setAccessToken(access);
                        getData(access);
                    }
                    else{
                        const {detail} = await resp.json();
                        console.log(detail, "while refreshing the token");
                        setIsLoggedIn(false);
                    }
                })
            }
        });
    },[]);
    
    return (
        <div className="dashboard">
            <TabView className='tab-container'>
                <TabPanel header="Appointments">
                    <h2 className='tab-heading'>
                        Appointments
                        <i className="pi pi-calendar" style={{fontSize: 'inherit', color: '#00808E' }}></i>
                    </h2>
                    <Appointments />
                </TabPanel>
                <TabPanel header="Users">
                    <h2 className='tab-heading'>
                        Users
                        <i className="pi pi-users" style={{fontSize: 'inherit', color: '#00808E' }}></i>
                    </h2>
                    <Users />
                </TabPanel>
            </TabView>
        </div>
    )
}