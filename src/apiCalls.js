import { toast } from 'react-toastify';

const apiUrl = "https://aidispatch.newrevmachine.com";

async function sendRequest(endpoint , method, body, header){
    let fetchObj = {
        method: method,
        headers: {
            'Accept': 'application/json, text/plain', 
            'Content-Type': 'application/json;charset=UTF-8'
        }
    };
    
    if(header){
        fetchObj.headers = {...fetchObj.headers, ...header};
    }
    if(body){
        fetchObj.body = JSON.stringify(body);
    }

    try {
        const resp = await fetch(apiUrl + endpoint, fetchObj);
        return resp;
    } catch (err) {
        return err;
    }
}

async function getToken(email, password, callbackFn){
    try{
        const resp = await sendRequest("/api/token/", "POST", {email, password});
        callbackFn(resp);
    } catch(err){
        console.log(err);
        toast.error("Something went wrong! Please try after some time");
    }
}

async function refreshTokenFn(refreshToken, callbackFn){
    try{
        const resp = await sendRequest("/api/token/refresh/", "POST", {"refresh" : refreshToken});
        callbackFn(resp);
    } catch(err){
        console.log(err);
        toast.error("Something went wrong! Please try after some time");
    }
}

async function verifyToken(token, callbackFn){
    try{
        const resp = await sendRequest("/api/token/verify/", "POST", {token});
        callbackFn(resp);
    } catch(err){
        console.log(err);
        toast.error("Something went wrong! Please try after some time");
    }
}

async function getAppointments(accessToken, callbackFn){
    try{
        const resp = await sendRequest("/api/app/appointments", "GET", null, {'Authorization' : 'Bearer ' + accessToken});
        callbackFn(resp);
    } catch(err){
        console.log(err);
        toast.error("Something went wrong! Please try after some time");
    }
}

async function updateAppointment(id, accessToken, payload, callbackFn){
    try{
        const resp = await sendRequest(`/api/app/appointments/${id}/`, "PUT", payload, {'Authorization' : 'Bearer ' + accessToken});
        callbackFn(resp);
    } catch(err){
        console.log(err);
        toast.error("Something went wrong! Please try after some time");
    }
}

async function deleteAppointment(id, accessToken, callbackFn){
    try{
        const resp = await sendRequest(`/api/app/appointments/${id}/`, "DELETE", null, {'Authorization' : 'Bearer ' + accessToken});
        callbackFn(resp);
    } catch(err){
        console.log(err);
        toast.error("Something went wrong! Please try after some time");
    }
}

async function getUsers(accessToken, callbackFn){
    try{
        const resp = await sendRequest("/api/app/users", "GET", null, {'Authorization' : 'Bearer ' + accessToken});
        callbackFn(resp);
    } catch(err){
        console.log(err);
        toast.error("Something went wrong! Please try after some time");
    }
}

async function updateUser(id, accessToken, payload, callbackFn){
    try{
        const resp = await sendRequest(`/api/app/users/${id}/update/`, "PATCH", payload, {'Authorization' : 'Bearer ' + accessToken});
        callbackFn(resp);
    } catch(err){
        console.log(err);
        toast.error("Something went wrong! Please try after some time");
    }
}

async function getSkills(accessToken, callbackFn){
    try{
        const resp = await sendRequest("/api/app/skills", "GET", null, {'Authorization' : 'Bearer ' + accessToken});
        callbackFn(resp);
    } catch(err){
        console.log(err);
        toast.error("Something went wrong! Please try after some time");
    }
}

async function addSkill(accessToken, payload, callbackFn){
    try{
        const resp = await sendRequest("/api/app/skills/", "POST", payload, {'Authorization' : 'Bearer ' + accessToken});
        callbackFn(resp);
    } catch(err){
        console.log(err);
        toast.error("Something went wrong! Please try after some time");
    }
}

async function getOptimumUsers(accessToken, payload, callbackFn){
    try{
        const resp = await sendRequest("/api/app/representative/", "POST", payload, {'Authorization' : 'Bearer ' + accessToken});
        callbackFn(resp);
    } catch(err){
        console.log(err);
        toast.error("Something went wrong! Please try after some time");
    }
}

async function getCalendars(accessToken, callbackFn){
    try{
        const resp = await sendRequest("/api/app/calendars/", "GET", null, {'Authorization' : 'Bearer ' + accessToken});
        callbackFn(resp);
    } catch(err){
        console.log(err);
        toast.error("Something went wrong! Please try after some time");
    }
}

async function updateCalendar(id, accessToken, payload, callbackFn){
    try{
        const resp = await sendRequest(`/api/app/calendars/${id}/`, "PUT", payload, {'Authorization' : 'Bearer ' + accessToken});
        callbackFn(resp);
    } catch(err){
        console.log(err);
        toast.error("Something went wrong! Please try after some time");
    }
}

async function deleteCalendar(id, accessToken, callbackFn){
    try{
        const resp = await sendRequest(`/api/app/calendars/${id}/`, "DELETE", null, {'Authorization' : 'Bearer ' + accessToken});
        callbackFn(resp);
    } catch(err){
        console.log(err);
        toast.error("Something went wrong! Please try after some time");
    }
}

async function getLocations(accessToken, callbackFn){
    try{
        const resp = await sendRequest("/api/app/locations/", "GET", null, {'Authorization' : 'Bearer ' + accessToken});
        callbackFn(resp);
    } catch(err){
        console.log(err);
        toast.error("Something went wrong! Please try after some time");
    }
}

export {
    getToken,
    refreshTokenFn,
    verifyToken,
    getAppointments,
    getUsers,
    getSkills,
    addSkill,
    updateAppointment,
    deleteAppointment,
    updateUser,
    getOptimumUsers,
    getCalendars,
    updateCalendar,
    deleteCalendar,
    getLocations
}