

import type { InputHTMLAttributes } from 'react';
import './Campo.css'

interface CampoProps extends InputHTMLAttributes<HTMLInputElement>{
    className?: string;
}

function Campo({
    placeholder,
    type="text",
    className = "",
    ...props
} : CampoProps){
    const classes = ["campo", className].filter(Boolean).join(" ")

    return(
        <input type={type} className={classes} placeholder={placeholder || "Digite algo..."} {...props}/>
    );
}

export default Campo;