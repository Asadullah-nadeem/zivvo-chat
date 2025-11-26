import React from 'react';
import LoginBackground from './components/login/LoginBackground';
import LoginForm from './components/login/LoginForm';

export default function Home() {
    return (
        <LoginBackground>
            <LoginForm />
        </LoginBackground>
    );
}