import React from 'react';
import './Home.css';
function Home() {
    return (
        <div className="home-container">
            {/* Navigation Bar */}
            <nav className="navbar">
                <div className="nav-brand">MusicTrainer</div>
                <div className="nav-links">
                    <a href="#home">Home</a>
                    <a href="#practice">Practice</a>
                    <a href="#stats">Options</a>
                    <a href="#profile">Profile</a>
                </div>
            </nav>
            {/* Centered Display Area */}
            <main className="main-content">
                <div className="content-container">
                    <h1>Welcome to MusicTrainer</h1>
                    <p>Start your musical journey today!</p>
                </div>
            </main>
            {/* Button Row */}
            <div className="button-row">
                <button className="action-button">Start Practice</button>
                <button className="action-button">View Progress</button>
                <button className="action-button">Settings</button>
            </div>
        </div>
    );
}
export default Home;