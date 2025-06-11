import React, { useState } from 'react';
import './Home.css';
import ScoreViewer from './MidiScoreViewer';
import { Wand2 } from 'lucide-react';

function Home() {
    const [abcNotation, setAbcNotation] = useState("C2 C2 | G2 G2 | A2 A2 | G4 |");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = async () => {
        setIsGenerating(true);
        try {
            // TODO: Add AI generation logic here
            // For now, just simulate a delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Placeholder: Later this will be replaced with actual AI-generated ABC notation
            setAbcNotation("E2 E2 | F2 F2 | G2 G2 | C4 |");
        } catch (error) {
            console.error('Error generating etude:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="home-container">
            {/* Navigation Bar */}
            <nav className="navbar">
                <div className="nav-brand">
                    <span className="logo-icon">🎵</span>
                    MusicTrainer
                </div>
                <div className="nav-links">
                    <a href="#home" className="nav-link active">Home</a>
                    <a href="#practice" className="nav-link">Practice</a>
                    <a href="#stats" className="nav-link">Statistics</a>
                    <a href="#profile" className="nav-link">Profile</a>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Welcome to MusicTrainer</h1>
                </div>
            </section>

            {/* Score Viewer Section */}
            <section className="score-section">
                <div className="section-header">
                    <h2>Your Music Score</h2>
                    <div className="score-actions">
                        <p>Generate new etudes</p>
                        <button
                            className={`generate-button ${isGenerating ? 'generating' : ''}`}
                            onClick={handleGenerate}
                            disabled={isGenerating}
                        >
                            <Wand2 className="generate-icon" size={20} />
                            {isGenerating ? 'Generating...' : 'Generate Etude'}
                        </button>
                    </div>
                </div>
                <div className="score-container">
                    <ScoreViewer abcNotation={abcNotation} />
                </div>
            </section>

            {/* Action Buttons */}
            <section className="action-section">
                <div className="button-grid">

                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <p>&copy; 2025 MusicTrainer. Start your musical journey today!</p>
            </footer>
        </div>
    );
}

export default Home;