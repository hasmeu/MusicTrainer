import React, { useState, useRef, useEffect } from 'react';
import ABCJS from 'abcjs';
import { Settings, Play, Pause, Square } from 'lucide-react';
import './MidiScoreViewer.css';


const TIME_SIGNATURES = [
    { numerator: 4, denominator: 4, display: "4/4" },
    { numerator: 3, denominator: 4, display: "3/4" },
    { numerator: 2, denominator: 4, display: "2/4" },
    { numerator: 6, denominator: 8, display: "6/8" },
    { numerator: 9, denominator: 8, display: "9/8" },
    { numerator: 12, denominator: 8, display: "12/8" }
];

const KEY_SIGNATURES = [
    { key: 'C', display: 'C Major' },
    { key: 'G', display: 'G Major' },
    { key: 'D', display: 'D Major' },
    { key: 'A', display: 'A Major' },
    { key: 'E', display: 'E Major' },
    { key: 'F', display: 'F Major' },
    { key: 'Bb', display: 'Bb Major' },
    { key: 'Eb', display: 'Eb Major' },
    { key: 'Am', display: 'A Minor' },
    { key: 'Em', display: 'E Minor' },
    { key: 'Bm', display: 'B Minor' },
    { key: 'Dm', display: 'D Minor' },
    { key: 'Gm', display: 'G Minor' }
];

const ScoreViewer = ({ abcNotation = '' }) => {
    const [timeSignature, setTimeSignature] = useState({ numerator: 4, denominator: 4 });
    const [selectedKey, setSelectedKey] = useState('C');
    const [tempo, setTempo] = useState(120);
    const [title, setTitle] = useState('New Score');
    const [showSettings, setShowSettings] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const scoreRef = useRef(null);
    const synthRef = useRef(null);
    const visualizerRef = useRef(null);

    useEffect(() => {
        updateScore();
        // Clean up synth on unmount
        return () => {
            if (synthRef.current) {
                synthRef.current.stop();
            }
        };
    }, [abcNotation, timeSignature, selectedKey, tempo, title]);

    const updateScore = () => {
        if (!scoreRef.current) return;

        const headerString = `X:1
T:${title}
M:${timeSignature.numerator}/${timeSignature.denominator}
L:1/8
Q:1/4=${tempo}
K:${selectedKey}
`;

        const fullNotation = headerString + (abcNotation || 'z4 |]');

        // Create the visual score
        const visualObj = ABCJS.renderAbc(scoreRef.current, fullNotation, {
            responsive: 'resize',
            add_classes: true,
            staffwidth: 2000,
            scale: 2.0,
            paddingbottom: 40,
            paddingright: 40,
            paddingleft: 40,
            paddingtop: 40,
            format: {
                measurenumber: true,
                vocalfont: "Arial 12",
                composerfont: "Arial 14",
                titlefont: "Arial 16",
                tempofont: "Arial 12",
                annotationfont: "Arial 10",
                footerfont: "Arial 10",
                headerfont: "Arial 10",
                textfont: "Arial 12",
                wordsfont: "Arial 12"
            }
        });

        // Initialize synthesizer if it hasn't been yet
        if (!synthRef.current) {
            synthRef.current = new ABCJS.synth.CreateSynth();
        }

        // Initialize audio context and prepare the tune
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const visualObj0 = visualObj[0];

        if (visualObj0) {
            synthRef.current.init({
                audioContext: audioContext,
                visualObj: visualObj0,
                millisecondsPerMeasure: (60000 / tempo) * timeSignature.numerator
            }).then(() => {
                console.log("Audio ready");
            }).catch(error => {
                console.error("Audio initialization failed:", error);
            });
        }
    };

    const handlePlayback = async () => {
        if (!synthRef.current) return;

        if (isPlaying) {
            synthRef.current.stop();
            setIsPlaying(false);
        } else {
            try {
                await synthRef.current.start();
                setIsPlaying(true);
                synthRef.current.addEventListener('ended', () => {
                    setIsPlaying(false);
                });
            } catch (error) {
                console.error("Playback failed:", error);
                setIsPlaying(false);
            }
        }
    };

    const handleStop = () => {
        if (synthRef.current) {
            synthRef.current.stop();
            setIsPlaying(false);
        }
    };

    const handleTimeSignatureChange = (sig) => {
        setTimeSignature({
            numerator: sig.numerator,
            denominator: sig.denominator
        });
    };
    const downloadAbc = () => {
        const headerString = `X:1
T:${title}
M:${timeSignature.numerator}/${timeSignature.denominator}
L:1/8
Q:1/4=${tempo}
K:${selectedKey}
`;
        const fullNotation = headerString + (abcNotation || 'z4 |]');

        const blob = new Blob([fullNotation], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${title.replace(/\s+/g, '_')}.abc`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };
    return (
        <div className="score-viewer">
            <div className="header">
                <h1 className="title">ABC Score Editor</h1>
                <div className="controls">
                    <button
                        className="playback-button"
                        onClick={handlePlayback}
                        title={isPlaying ? "Pause" : "Play"}
                    >
                        {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                    </button>
                    <button
                        className="stop-button"
                        onClick={handleStop}
                        title="Stop"
                    >
                        <Square size={24} />
                    </button>
                    <button
                        className="settings-button"
                        onClick={() => setShowSettings(!showSettings)}
                    >
                        <Settings size={24} />
                    </button>
                </div>
            </div>

            {showSettings && (
                <div className="settings-panel">
                    <div className="setting-group">
                        <label>Title:</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="title-input"
                        />
                    </div>
                    <div className="setting-group">
                        <label>Tempo:</label>
                        <input
                            type="number"
                            value={tempo}
                            onChange={(e) => setTempo(parseInt(e.target.value))}
                            min="40"
                            max="208"
                            className="tempo-input"
                        />
                    </div>
                    <div className="setting-group">
                        <label>Time Signature:</label>
                        <select
                            value={`${timeSignature.numerator}/${timeSignature.denominator}`}
                            onChange={(e) => {
                                const [num, den] = e.target.value.split('/');
                                handleTimeSignatureChange({
                                    numerator: parseInt(num),
                                    denominator: parseInt(den)
                                });
                            }}
                            className="time-signature-select"
                        >
                            {TIME_SIGNATURES.map((sig) => (
                                <option key={sig.display} value={sig.display}>
                                    {sig.display}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="setting-group">
                        <label>Key:</label>
                        <select
                            value={selectedKey}
                            onChange={(e) => setSelectedKey(e.target.value)}
                            className="key-signature-select"
                        >
                            {KEY_SIGNATURES.map((sig) => (
                                <option key={sig.key} value={sig.key}>
                                    {sig.display}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button onClick={downloadAbc} className="download-button">
                        Download ABC
                    </button>
                </div>
            )}
            <div ref={scoreRef} className="score-container"></div>
        </div>
    );
};

export default ScoreViewer;
