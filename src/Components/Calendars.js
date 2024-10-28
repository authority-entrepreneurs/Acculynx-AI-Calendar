import React, { useContext, useEffect, useState } from 'react';
import '../Styles/Calendars.css';
import { DataTable } from 'primereact/datatable';
import { FilterMatchMode } from 'primereact/api';
import { context } from '../App';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Column } from 'primereact/column';
import { confirmPopup, ConfirmPopup } from 'primereact/confirmpopup';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { addCalendar, deleteCalendar, refreshTokenFn, updateCalendar, verifyToken } from '../apiCalls';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { toast } from 'react-toastify';

export default function Calendars() {
    const {
        accessToken,
        setAccessToken,
        refreshToken,
        setIsLoggedIn,
        calendars,
        setCalendars,
        locations,
        selectedLocation,
        setSelectedLocation} = useContext(context);

    const [isLoading, setIsLoading] = useState({text: "", visible: false});
    const [search, setSearch] = useState("");
    const [showAddCalendarDialog, setShowAddCalendarDialog] = useState(false);
    const [addCalendarData, setAddCalendarData] = useState({
        calendar_id: "",
        location_id: "",
        name: "",
        calendar_type: "",
        is_active: false,
        isLoading: false
    });

    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        location_id: { value: null, matchMode: FilterMatchMode.EQUALS }
    });

    function onRowEditComplete(e) {
        const {id, ...payload} = e.newData;

        setIsLoading({text: "Updating...", visible: true});
        
        function update(token){
            updateCalendar(id, token, payload, async (resp)=>{
                if(resp.ok){
                    for(let i = 0; i < calendars.length; i++){
                        if(calendars[i].id === id){
                            calendars[i] = {id, ...payload};
                            break;
                        }
                    }
                    setCalendars([...calendars]);
                    setIsLoading({text: "", visible: false});
                    toast.success("Updated.");
                }
                else{
                    const {detail} = await resp.json();
                    toast.error("Failed to update");
                    console.log(detail, "while updating calendar");
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

        function deleteCal(token, id){
            deleteCalendar(id, token, async (resp)=>{
                if(resp.ok){
                    let filtered = calendars.filter(calendar => {
                        return calendar.id !== id
                    });
                    setCalendars([...filtered]);
                    setIsLoading({text: "", visible: false});
                    toast.success("Deleted.");
                }
                else{
                    setIsLoading({text: "", visible: false});
                    toast.success("Failed to delete");
                    const {detail} = await resp.json();
                    console.log(detail, "while updating calendar");
                }
            })
        }
        
        verifyToken(accessToken, async (resp)=>{
            if(resp.ok){
                deleteCal(accessToken, id);
            }
            else{
                refreshTokenFn(refreshToken, async (resp)=>{
                    if(resp.ok){
                        const {access} = await resp.json();
                        setAccessToken(access);
                        deleteCal(access, id);
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

    function addCalendarFn(){
        if(addCalendarData.calendar_id && addCalendarData.location_id && addCalendarData.name && addCalendarData.calendar_type && addCalendarData.is_active){
            const {isLoading, ...payload} = addCalendarData;
            setAddCalendarData({...addCalendarData, "isLoading": true});
            
            function add(token){
                addCalendar(token, payload, async (resp)=>{
                    if(resp.ok){
                        setCalendars([...calendars, payload]);
                        setAddCalendarData({
                            calendar_id: "",
                            location_id: "",
                            name: "",
                            calendar_type: "",
                            is_active: false,
                            isLoading: false
                        });
                        toast.success("Added.");
                    }
                    else{
                        const {detail} = await resp.json();
                        toast.error("Failed to add");
                        console.log(detail, "while Adding calendar");
                        setAddCalendarData({...addCalendarData, "isLoading": false});
                    }
                })
            }
            
            verifyToken(accessToken, async (resp)=>{
                if(resp.ok){
                    add(accessToken);
                }
                else{
                    refreshTokenFn(refreshToken, async (resp)=>{
                        if(resp.ok){
                            const {access} = await resp.json();
                            setAccessToken(access);
                            add(access);
                        }
                        else{
                            setAddCalendarData({...addCalendarData, "isLoading": false});
                            toast.error("Failed to add");
                            const {detail} = await resp.json();
                            console.log(detail, "while refreshing the token");
                            setIsLoggedIn(false);
                        }
                    })
                }
            });
        }
        else{
            toast.error("Please fill all the fields");
        }
    }

    function locationFilterChange(e){
        const value = e.target.value;
        let _filters = { ...filters };

        _filters['location_id'].value = value;

        setFilters(_filters);
        setSelectedLocation(value);
    }

    const onSearchChange = (e) => {
        const value = e.target.value;
        let _filters = { ...filters };

        _filters['global'].value = value;

        setFilters(_filters);
        setSearch(value);
    };

    function searchBar(){
        return (
            <div>
                <div className='search-add-skill-container'>
                    <IconField iconPosition="left">
                        <InputIcon className="pi pi-search" />
                        <InputText className='search-bar-input' value={search} onChange={onSearchChange} placeholder="Search" />
                    </IconField>
                    
                    <Dropdown
                        value={selectedLocation}
                        optionLabel="location_name"
                        optionValue="locationId"
                        options={locations}
                        onChange={locationFilterChange}
                        placeholder="Filter by location"
                        className='dropdown-input'
                        showClear/>
                </div>

                <div className='add-skill-button-container'>
                    <Button className='button' label="Calendar" icon="pi pi-plus" size="small" onClick={()=>setShowAddCalendarDialog(true)}/>
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

    const textEditor = (options) => {
        return <InputText className='text-input' type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
    };

    const dropdownEditor = (options) => {
        return (
            <div className='assigned-optimum-users-container'>
                <Dropdown
                    className='dropdown-input'
                    value={options.value}
                    options={["round_robin", "event", "class_booking", "collective", "service_booking"]}
                    filter
                    onChange={(e) => options.editorCallback(e.target.value)}
                    placeholder="Select an user"
                />
            </div>
        );
    };

    function checkboxEditor(options){
        return (
            <Checkbox
                onChange={(e) => options.editorCallback(e.target.checked)}
                checked={options.value}
            ></Checkbox>
        )
    }
    
    return (
        <div className="calendars">
            <DataTable
                value={calendars}
                dataKey="id"
                onRowEditComplete={onRowEditComplete}
                filters={filters}
                globalFilterFields={['calendar_id', 'name', 'calendar_type', 'is_active']}
                header={searchBar}
                emptyMessage="No Calendars found."
                showGridlines
                paginator
                columnResizeMode="expand"
                resizableColumns
                rows={10}
                rowsPerPageOptions={[10, 20, 40, 60]}
                removableSort
                editMode='row'>
                <Column field="calendar_id" sortable header="Calendar ID" editor={textEditor}></Column>
                <Column field="name" sortable header="Name" editor={textEditor}></Column>
                <Column field="calendar_type" sortable header="Type" editor={dropdownEditor}></Column>
                <Column field="is_active" header="Active" editor={checkboxEditor} body={(options)=><p>{options.is_active ? "Yes" : "No"}</p>} ></Column>
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

            <div>
                <Dialog className='add-skill-container' draggable={false} resizable={false} visible={showAddCalendarDialog} onHide={() => setShowAddCalendarDialog(false)} modal style={{ width: '25rem' }}>
                    <InputText placeholder='Calendar ID' value={addCalendarData.calendar_id} onChange={(e)=>setAddCalendarData({...addCalendarData, "calendar_id" : e.target.value})}/>
                    <InputText placeholder='Location ID' value={addCalendarData.location_id} onChange={(e)=>setAddCalendarData({...addCalendarData, "location_id" : e.target.value})}/>
                    <InputText placeholder='Name' value={addCalendarData.name} onChange={(e)=>setAddCalendarData({...addCalendarData, "name" : e.target.value})}/>
                    <Dropdown
                        value={addCalendarData.calendar_type}
                        onChange={(e)=>setAddCalendarData({...addCalendarData, "calendar_type" : e.target.value})}
                        options={["round_robin", "event", "class_booking", "collective", "service_booking"]}
                        placeholder="Calendar Type"
                        className='dropdown-input'
                    />

                    <div>
                        <label htmlFor="is_active">Is Active </label>
                        <Checkbox id='is_active' onChange={(e)=>setAddCalendarData({...addCalendarData, "is_active" : e.target.checked})} checked={addCalendarData.is_active}></Checkbox>
                    </div>

                    <Button loading={addCalendarData.isLoading} onClick={addCalendarFn} label='Add' />
                </Dialog>
            </div>
        </div>
    )
}