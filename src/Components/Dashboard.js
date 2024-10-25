import React, { useContext, useEffect, useState } from 'react';
import '../Styles/Dashboard.css';
import { TabView, TabPanel } from 'primereact/tabview';
import Appointments from './Appointments';
import Users from './Users';
import { context } from '../App';
import { getAppointments, getCalendars, getLocations, getSkills, getUsers, refreshTokenFn, verifyToken } from '../apiCalls';
import Calendars from './Calendars';
import { Button } from 'primereact/button';

export default function Dashboard() {
    const {
        accessToken,
        setAccessToken,
        refreshToken,
        setIsLoggedIn,
        setAppointments,
        setUsers,
        setSkills,
        setCalendars,
        setLocations,
        logout
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
        
        getLocations(token, async (resp)=>{
            if(resp.ok){
                const data = await resp.json();
                setLocations(data);
            }
            else{
                const {detail} = await resp.json();
                console.log(detail, "while getting locations list");
            }
        })
        
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

        getCalendars(token, async (resp)=>{
            if(resp.ok){
                const data = await resp.json();
                setCalendars(data);
            }
            else{
                const {detail} = await resp.json();
                console.log(detail, "while getting calendars list");
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
                    <div>
                        <h2 className='tab-heading'>
                            Appointments
                            <i className="pi pi-calendar" style={{fontSize: 'inherit', color: '#00808E' }}></i>
                        </h2>
                    </div>
                    <Appointments />
                </TabPanel>
                <TabPanel header="Users">
                    <div>
                        <h2 className='tab-heading'>
                            Users
                            <i className="pi pi-users" style={{fontSize: 'inherit', color: '#00808E' }}></i>
                        </h2>
                    </div>
                    <Users />
                </TabPanel>
                <TabPanel header="Calendars">
                    <div>
                        <h2 className='tab-heading'>
                            Calendars
                            <i className="pi pi-calendar" style={{fontSize: 'inherit', color: '#00808E' }}></i>
                        </h2>
                    </div>
                    <Calendars />
                </TabPanel>
                <TabPanel className='log-out-container' headerTemplate={<Button className='button' label="Log out" icon="pi pi-sign-out" size="small" onClick={logout}/>}></TabPanel>
            </TabView>
        </div>
    )
}