import React, { useContext, useEffect, useRef, useState } from 'react';
import '../Styles/Appointments.css';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FilterMatchMode } from 'primereact/api';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { OverlayPanel } from 'primereact/overlaypanel';
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { deleteAppointment, getOptimumUsers, refreshTokenFn, updateAppointment, verifyToken } from '../apiCalls';
import { context } from '../App';
import { toast } from 'react-toastify';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';

export default function Appointments() {
    const optimumUsersRef = useRef(null);
    const {accessToken, setAccessToken, refreshToken, setIsLoggedIn, appointments, setAppointments, users, logout} = useContext(context);
    const [seach, setSearch] = useState("");
    const [userNames, setUserNames] = useState([]);
    const [isLoading, setIsLoading] = useState({text: "", visible: false});
    const [optimumUsers, setOptimumUsers] = useState();
    const [isOptimumLoading, setIsOptimumLoading] = useState(false);

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS }
    });

    function showOptimumUsers(e, rowData){
        setIsOptimumLoading(true);
        const payload = {
            "locationId": rowData.locationId,
            "contactId": rowData.contact_id,
            "startTime": rowData.start_time,
            "endTime": rowData.end_time
        }

        function getUsers(token, payload){
            getOptimumUsers(token, payload, async (resp) => {
                if(resp.ok){
                    const {users} = await resp.json();
                    setOptimumUsers(users);
                    setIsOptimumLoading(false);
                    optimumUsersRef.current.toggle(e);
                }
                else{
                    const {detail} = await resp.json();
                    toast.error("Failed to show optimum users");
                    console.log(detail, "while updating appointment");
                    setIsOptimumLoading(false);
                }
            })
        }

        verifyToken(accessToken, async (resp)=>{
            if(resp.ok){
                getUsers(accessToken, payload);
            }
            else{
                refreshTokenFn(refreshToken, async (resp)=>{
                    if(resp.ok){
                        const {access} = await resp.json();
                        setAccessToken(access);
                        getUsers(accessToken, payload);
                    }
                    else{
                        setIsOptimumLoading(false);
                        toast.error("Failed to show optimum users");
                        const {detail} = await resp.json();
                        console.log(detail, "while refreshing the token");
                        setIsLoggedIn(false);
                    }
                })
            }
        });
    }

    function onRowEditComplete(e) {
        let { newData } = e;

        setIsLoading({text: "Updating...", visible: true});

        for(let user of users){
            if(user.name === newData.assigned_user_name){
                newData.assigned_user_id = user.ghl_id;
                break;
            }
        }
        
        function update(token){
            updateAppointment(newData.id, token, newData, async (resp)=>{
                if(resp.ok){
                    for(let i = 0; i < appointments.length; i++){
                        if(appointments[i].id === newData.id){
                            appointments[i] = newData;
                            break;
                        }
                    }
                    setAppointments([...appointments]);
                    setIsLoading({text: "", visible: false});
                    toast.success("Updated.");
                }
                else{
                    const {detail} = await resp.json();
                    toast.error("Failed to update");
                    console.log(detail, "while updating appointment");
                    setIsLoading({text: "", visible: false});
                }
            })
        }

        verifyToken(accessToken, async (resp)=>{
            if(resp.ok){
                update(accessToken);
            }
            else{
                refreshTokenFn(refreshToken, async (resp)=>{
                    if(resp.ok){
                        const {access} = await resp.json();
                        setAccessToken(access);
                        update(access);
                    }
                    else{
                        setIsLoading({text: "", visible: false});
                        toast.error("Failed to update");
                        const {detail} = await resp.json();
                        console.log(detail, "while refreshing the token");
                        setIsLoggedIn(false);
                    }
                })
            }
        });
    };

    function onDeleteClick(id){
        setIsLoading({text: "Deleting...", visible: true});

        function deleteRow(token, id){
            deleteAppointment(id, token, async (resp)=>{
                if(resp.ok){
                    let filtered = appointments.filter(appointment => {
                        return appointment.id !== id
                    });
                    setAppointments([...filtered]);
                    setIsLoading({text: "", visible: false});
                    toast.success("Deleted.");
                }
                else{
                    setIsLoading({text: "", visible: false});
                    toast.success("Failed to delete");
                    const {detail} = await resp.json();
                    console.log(detail, "while updating appointment");
                }
            })
        }
        
        verifyToken(accessToken, async (resp)=>{
            if(resp.ok){
                deleteRow(accessToken, id);
            }
            else{
                refreshTokenFn(refreshToken, async (resp)=>{
                    if(resp.ok){
                        const {access} = await resp.json();
                        setAccessToken(access);
                        deleteRow(access, id);
                    }
                    else{
                        setIsLoading({text: "", visible: false});
                        toast.success("Failed to delete");
                        const {detail} = await resp.json();
                        console.log(detail, "while refreshing the token");
                        setIsLoggedIn(false);
                    }
                })
            }
        });
    }

    const searchBar = () => {
        return (
            <div className='search-add-skill-container'>
                <IconField iconPosition="left">
                    <InputIcon className="pi pi-search" />
                    <InputText className='search-bar-input' value={seach} onChange={onSearchChange} placeholder="Search" />
                </IconField>

                <Button className='button' label="Log out" icon="pi pi-sign-out" size="small" onClick={logout}/>
            </div>
        );
    };

    const onSearchChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters['global'].value = value;

        setFilters(_filters);
        setSearch(value);
    };

    const textEditor = (options) => {
        return <InputText className='text-input' type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
    };

    const dropdownEditor = (options) => {
        return (
            <div className='assigned-optimum-users-container'>
                <Dropdown
                    className='dropdown-input'
                    value={options.value}
                    options={userNames}
                    filter
                    onChange={(e) => options.editorCallback(e.target.value)}
                    placeholder="Select an user"
                />

                <div>
                    <Button type="button" className='button' icon="pi pi-users" size="small" loading={isOptimumLoading} label="Optimum Users" onClick={(e)=>showOptimumUsers(e, options.rowData)} />
                    <OverlayPanel className='optimum-users-container' ref={optimumUsersRef}>
                        {
                            (optimumUsers && optimumUsers.length > 0)
                            &&
                            optimumUsers.map((user, idx)=>(
                                <div key={idx} className="optimum-user">
                                    <p className="optimum-user-name">{user.name}</p>
                                    <p className="optimum-user-distance">{user.distance} m away</p>
                                    <p className="optimum-user-skills-match">Skills match : {user.skills_match ? "Yes" : "No"}</p>
                                </div>
                            ))
                        }
                    </OverlayPanel>
                </div>
            </div>
        );
    };

    const confirm = (event, id) => {
        confirmPopup({
            target: event.currentTarget,
            message: 'Do you want to delete this record?',
            icon: 'pi pi-info-circle',
            defaultFocus: 'reject',
            acceptClassName: 'p-button-danger',
            accept: () => onDeleteClick(id)
        });
    };
    
    const deleteButton = (data) => (
        <>
            <ConfirmPopup />
            <i
              label="Action"
              className="pi pi-trash"
              style={{display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'}}
              onClick={(event)=>confirm(event, data.id)}
              ></i>
        </>
    );
    
    useEffect(()=>{
        let temp = users.map(user => {
            return user.name;
        });
        setUserNames([...temp]);
    },[users]);

    return (
        <div className='appointments'>
            <DataTable
                value={appointments}
                dataKey="id"
                onRowEditComplete={onRowEditComplete}
                filters={filters}
                globalFilterFields={['start_time', 'end_time', 'title', 'address', 'appointment_status', 'notes', 'source', 'assigned_user_name']}
                header={()=>searchBar()}
                emptyMessage="No appointments found."
                showGridlines
                paginator
                columnResizeMode="expand"
                resizableColumns
                rows={10}
                rowsPerPageOptions={[10, 20, 40, 60]}
                removableSort
                editMode='row'>
                <Column field="start_time" sortable header="Start Time"></Column>
                <Column field="end_time" sortable header="End Time"></Column>
                <Column field="title" sortable header="Name" editor={(options) => textEditor(options)}></Column>
                <Column field="address" header="Address"></Column>
                <Column field="appointment_status" header="Status"></Column>
                <Column field="notes" header="Notes" editor={(options) => textEditor(options)}></Column>
                <Column field="source" header="Source"></Column>
                <Column field="assigned_user_name" header="Assigned User" editor={(options) => dropdownEditor(options)}></Column>
                <Column rowEditor header="Edit" bodyStyle={{ textAlign: 'center' }}></Column>
                <Column
                    field='id'
                    header="Delete"
                    body={deleteButton}></Column>
            </DataTable>

            <div>
                <Dialog className='loading-dialog' draggable={false} resizable={false} header={isLoading.text} visible={isLoading.visible} modal style={{ width: '20rem' }}>
                    <ProgressSpinner style={{display: 'block', width: '50px', height: '50px', margin: '0 auto'}} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
                </Dialog>
            </div>
        </div>
    )
}