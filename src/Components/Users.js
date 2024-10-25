import React, { useContext, useEffect, useState } from 'react';
import '../Styles/Users.css';
import '../Styles/Users.css';
import { context } from '../App';
import { DataTable } from 'primereact/datatable';
import { FilterMatchMode } from 'primereact/api';
import { IconField } from 'primereact/iconfield';
import { InputIcon } from 'primereact/inputicon';
import { InputText } from 'primereact/inputtext';
import { Dialog } from 'primereact/dialog';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Column } from 'primereact/column';
import { MultiSelect } from 'primereact/multiselect';
import { Tag } from 'primereact/tag';
import { Button } from 'primereact/button';
import { addSkill, refreshTokenFn, updateUser, verifyToken } from '../apiCalls';
import { toast } from 'react-toastify';
import { FloatLabel } from 'primereact/floatlabel';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';

export default function Users() {
    const {
        accessToken,
        setAccessToken,
        refreshToken,
        setIsLoggedIn,
        users,
        setUsers,
        skills,
        setSkills,
        locations,
        selectedLocation,
        setSelectedLocation} = useContext(context);
    const [seach, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState({text: "", visible: false});
    const [skillsOptions, setSkillsOptions] = useState();
    const [addSkillInput, setAddSkillInput] = useState("");
    const [showAddSkillDialog, setShowAddSkillDialog] = useState(false);
    const [isAddSkillLoading, setIsAddSkillLoading] = useState(false);
    const [filters, setFilters] = useState({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        location_id: { value: null, matchMode: FilterMatchMode.EQUALS }
    });

    function searchBar(){
        return (
            <div>
                <div className='search-add-skill-container'>
                    <IconField iconPosition="left">
                        <InputIcon className="pi pi-search" />
                        <InputText className='search-bar-input' value={seach} onChange={onSearchChange} placeholder="Search" />
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
                    <Button className='button' label="Skill" icon="pi pi-plus" size="small" onClick={()=>setShowAddSkillDialog(true)}/>
                </div>
            </div>
        );
    };

    function locationFilterChange(e){
        const value = e.target.value;
        let _filters = { ...filters };

        _filters['location_id'].value = value;

        setFilters(_filters);
        setSelectedLocation(value);
    }

    function onSearchChange(e){
        const value = e.target.value;
        let _filters = { ...filters };

        _filters['global'].value = value;

        setFilters(_filters);
        setSearch(value);
    };

    function checkboxEditor(options){
        return (
            <Checkbox
                onChange={(e) => options.editorCallback(e.target.checked)}
                checked={options.value}
            ></Checkbox>
        )
    }

    function multiselectEditor(options){
        return (
            <MultiSelect
                className='multiselect-input'
                value={options.value}
                onChange={(e) => options.editorCallback(e.target.value)}
                options={skillsOptions}
                placeholder="Select Skills"
            />
        )
    }

    const textEditor = (options) => {
        return <InputText className='text-input' type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
    };
    
    const skillsBodyTemplate = (users) => {
        return (
            <>
            {
                users.skills_str.length > 0
                ?
                    users.skills_str.map((skill, idx) => {
                        return <Tag className='skill' key={idx} value={skill}></Tag>
                    })
                :
                    <Tag value="none"></Tag>
            }
            </>
        )
    };

    function onAddClick(){
        let payload = {"name" : addSkillInput};
        setIsAddSkillLoading(true);

        function add(token){
            addSkill(token, payload, async (resp)=>{
                if(resp.ok){
                    const data = await resp.json();
                    setSkills([...skills, data]);
                    setAddSkillInput("");
                    setIsAddSkillLoading(false);
                    toast.success("Skill Added.");
                }
                else{
                    const {detail} = await resp.json();
                    toast.error("Failed to add");
                    console.log(detail, "while adding skill");
                    setIsAddSkillLoading(false);
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
                        setIsAddSkillLoading(false);
                        toast.error("Failed to add");
                        const {detail} = await resp.json();
                        console.log(detail, "while refreshing the token");
                        setIsLoggedIn({text: "", visible: false});
                    }
                })
            }
        });
    }

    function onRowEditComplete(e){
        let { newData } = e;

        setIsLoading({text: "Updating...", visible: true});

        function update(token){
            updateUser(newData.id, token, newData, async (resp)=>{
                if(resp.ok){
                    for(let i = 0; i < users.length; i++){
                        if(users[i].id === newData.id){
                            users[i] = newData;
                            break;
                        }
                    }
                    setUsers([...users]);
                    setIsLoading({text: "", visible: false});
                    toast.success("Updated.");
                }
                else{
                    const {detail} = await resp.json();
                    toast.error("Failed to update");
                    console.log(detail, "while updating user");
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
                        setIsLoggedIn({text: "", visible: false});
                    }
                })
            }
        });
    }

    useEffect(()=>{
        let temp = skills.map(skill => {
            return skill.name;
        });
        setSkillsOptions([...temp]);
    },[skills])

    return (
        <div className="users">
            <DataTable
                value={users}
                dataKey="id"
                onRowEditComplete={onRowEditComplete}
                filters={filters}
                globalFilterFields={['name', 'email', 'address', 'phone', 'is_active', 'skills_str']}
                header={()=>searchBar()}
                emptyMessage="No users found."
                showGridlines
                paginator
                columnResizeMode="expand"
                resizableColumns
                rows={10}
                rowsPerPageOptions={[10, 20, 40, 60]}
                removableSort
                editMode='row'>
                <Column field="name" sortable header="Name"></Column>
                <Column field="email" sortable header="Email"></Column>
                <Column field="address" editor={textEditor} sortable header="Address"></Column>
                <Column field="phone" sortable header="Phone"></Column>
                <Column field="is_active" editor={checkboxEditor} body={(options)=><p>{options.is_active ? "Yes" : "No"}</p>} sortable header="Active"></Column>
                <Column field="skills_str" header="Skills" editor={multiselectEditor} body={skillsBodyTemplate}></Column>
                <Column rowEditor header="Edit" bodyStyle={{ textAlign: 'center' }}></Column>
            </DataTable>

            <div>
                <Dialog className='loading-dialog' draggable={false} resizable={false} header={isLoading.text} visible={isLoading.visible} modal style={{ width: '20rem' }}>
                    <ProgressSpinner style={{display: 'block', width: '50px', height: '50px', margin: '0 auto'}} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
                </Dialog>
            </div>
            
            <div>
                <Dialog className='add-skill-container' draggable={false} resizable={false} visible={showAddSkillDialog} onHide={() => {if (!showAddSkillDialog) return; setShowAddSkillDialog(false); }} modal style={{ width: '25rem' }}>
                    <FloatLabel>
                        <InputText id="skill_input" value={addSkillInput} onChange={(e)=>setAddSkillInput(e.target.value)}/>
                        <label htmlFor="skill_input">Skill name</label>
                    </FloatLabel>
                    <Button loading={isAddSkillLoading} disabled={addSkillInput.length > 0 ? false : true} onClick={onAddClick} label='Add' />
                </Dialog>
            </div>
        </div>
    )
}