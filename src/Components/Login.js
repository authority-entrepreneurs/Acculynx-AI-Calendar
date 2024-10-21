import React, { useContext, useState } from 'react';
import '../Styles/Login.css';
import { Card } from 'primereact/card';
import {ReactComponent as Logo} from '../Assets/logo.svg';
import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { context } from '../App';
import { toast } from 'react-toastify';
import { getToken } from '../apiCalls';
import secureLocalStorage from 'react-secure-storage';


export default function Login() {
    const {setAccessToken, setRefreshToken, setIsLoggedIn} = useContext(context);
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    function resetSignIn(){
        setEmail("");
        setPassword("");
    }
    
    function login(){
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if(emailRegex.test(email)){
            setEmailError("");
            if(password.length >= 8){
                setPasswordError("");
                setIsLoading(true);
                getToken(email, password, async (resp)=>{
                    if(resp.ok){
                        const {refresh, access} = await resp.json();
                        secureLocalStorage.setItem('email', email.toLowerCase());
                        secureLocalStorage.setItem('password', password);
                        setRefreshToken(refresh);
                        setAccessToken(access);
                        setIsLoading(false);
                        setIsLoggedIn(true);
                        resetSignIn();
                    }
                    else{
                        setIsLoading(false);
                        const {detail} = await resp.json();
                        toast.error(detail);
                    }
                })
            }
            else{
                setPasswordError("Invalid password");
            }
        }
        else{
            setEmailError("Invalid email");
        }
    }

    return (
        <div className="login">
            <div className="login-card-container">
                <Card>
                    <div className='logo-container'>
                        <Logo width="100" />
                        <h2 className='login-text'>Log in</h2>
                    </div>
                    
                    <div className='login-cred-container'>
                        <div className='input-container'>
                            <FloatLabel >
                                <label htmlFor="email">Your email</label>
                                <InputText className='login-input p-inputtext-sm' value={email} onChange={(e)=>setEmail(e.target.value)} id="email" invalid={emailError}/>
                            </FloatLabel>
                            {
                                emailError
                                &&
                                <small className='email-error error'>{emailError}</small>
                            }
                        </div>

                        <div className="input-container">
                            <FloatLabel>
                                <Password className='login-input p-inputtext-sm' value={password} onChange={(e)=>setPassword(e.target.value)} inputId="password" feedback={false} toggleMask invalid={passwordError}/>
                                <label htmlFor="password">Password</label>
                            </FloatLabel>
                            {
                                passwordError
                                &&
                                <small className='password-error error'>{passwordError}</small>
                            }
                        </div>
                    </div>
                    
                    <div className="login-button-container">
                        <Button className='input-container button' label="Log in" icon="pi pi-arrow-right" iconPos="right" loading={isLoading} rounded onClick={login}/>
                    </div>
                </Card>
            </div>
        </div>
    )
}