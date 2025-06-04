import React, { useState, useEffect, useRef } from 'react';
import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';
import ABCJS from 'abcjs';
import './MidiScoreViewer.css';

const TIME_SIGNATURES = [
    { numerator: 4, denominator: 4, display: "4/4" },
    { numerator: 3, denominator: 4, display: "3/4" },
    { numerator: 2, denominator: 4, display: "2/4" },
    { numerator: 6, denominator: 8, display: "6/8" },
    { numerator: 9, denominator: 8, display: "9/8" },
    { numerator: 12, denominator: 8, display: "12/8" }
];

const MidiScoreViewer = ({ midiFile }) => {
    const [midiData, setMidiData] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [selectedTimeSignature, setSelectedTimeSignature] = useState({ numerator: 4, denominator: 4 });
    const scoreRef = useRef(null);
    const synth = useRef(null);

    useEffect(() => {
        if (midiFile) {
            loadMidiFile(midiFile);
        }
    }, [midiFile]);

    // Re-render score when time signature changes
    useEffect(() => {
        if (midiData) {
            const abcString = midiToABC(midiData);
            renderScore(abcString);
        }
    }, [selectedTimeSignature]);

    const handleTimeSignatureChange = (event) => {
        const [numerator, denominator] = event.target.value.split('/').map(Number);
        setSelectedTimeSignature({ numerator, denominator });
    };

    const midiToABC = (midi) => {
        // Use selected time signature instead of MIDI file's time signature
        const timeSignature = selectedTimeSignature;

        // Get tempo from MIDI file
        const tempo = midi.header.tempos.length > 0
            ? Math.round(midi.header.tempos[0].bpm)
            : 120;

        let abcString = `%%titlefont none
X:1
T:
M:${timeSignature.numerator}/${timeSignature.denominator}
L:1/8
Q:1/4=${tempo}
%%staves P1
V:P1 clef=treble
K:C
`;

        const track = midi.tracks.find(track => track.notes.length > 0);
        if (!track) return abcString;

        const notes = [...track.notes].sort((a, b) => a.time - b.time);
        let currentBeat = 0;
        const beatsPerMeasure = timeSignature.numerator * (8 / timeSignature.denominator);

        // Group notes by their start time to handle chords
        const noteGroups = {};
        notes.forEach(note => {
            const startTime = Math.round(note.time * 100) / 100;
            if (!noteGroups[startTime]) {
                noteGroups[startTime] = [];
            }
            noteGroups[startTime].push(note);
        });

        // Process notes in order
        Object.keys(noteGroups)
            .sort((a, b) => parseFloat(a) - parseFloat(b))
            .forEach(time => {
                const groupNotes = noteGroups[time];

                if (groupNotes.length > 1) {
                    abcString += '[';
                    groupNotes.forEach((note, index) => {
                        const midiNote = note.midi;
                        const octave = Math.floor(midiNote / 12) - 5;
                        let noteName = note.name.replace(/\d+$/, '');
                        noteName = noteName.replace('#', '^').replace('b', '_');

                        if (octave >= 0) {
                            noteName = noteName.toLowerCase();
                        }

                        const octaveModifier = octave > 0 ? "'".repeat(octave) :
                            octave < 0 ? ",".repeat(-octave) : '';

                        abcString += `${noteName}${octaveModifier}`;
                        if (index === groupNotes.length - 1) {
                            const duration = Math.round(note.duration * 8);
                            abcString += `${duration || 1}]`;
                            currentBeat += duration;
                        }
                    });
                } else {
                    const note = groupNotes[0];
                    const midiNote = note.midi;
                    const octave = Math.floor(midiNote / 12) - 5;
                    let noteName = note.name.replace(/\d+$/, '');
                    noteName = noteName.replace('#', '^').replace('b', '_');

                    if (octave >= 0) {
                        noteName = noteName.toLowerCase();
                    }

                    const octaveModifier = octave > 0 ? "'".repeat(octave) :
                        octave < 0 ? ",".repeat(-octave) : '';

                    const duration = Math.round(note.duration * 8);
                    abcString += `${noteName}${octaveModifier}${duration || 1}`;
                    currentBeat += duration;
                }

                if (currentBeat >= beatsPerMeasure) {
                    abcString += " | ";
                    currentBeat = currentBeat % beatsPerMeasure;
                } else {
                    abcString += " ";
                }
            });

        if (!abcString.endsWith(" | ")) {
            abcString += " |]";
        }

        return abcString;
    };

    const renderScore = (abcString) => {
        ABCJS.renderAbc(scoreRef.current, abcString, {
            responsive: 'resize',
            add_classes: true,
            staffwidth: 1600,
            scale: 2,
            paddingbottom: 50,
            paddingright: 50,
            paddingleft: 50,
            paddingtop: 50,
            format: {
                gchordfont: "Arial",
                measurenumber: true,
                vocalfont: "Arial",
                composerfont: "Arial",
                composerspace: 0,
                partsfont: "Arial",
                tempofont: "Arial",
                titlefont: "Arial",
                annotationfont: "Arial",
                footerfont: "Arial",
                headerfont: "Arial",
                historyfont: "Arial",
                infofont: "Arial",
                textfont: "Arial",
                wordsfont: "Arial"
            }
        });
    };

    const loadMidiFile = async (file) => {
        try {
            let midi;
            if (file instanceof File) {
                const arrayBuffer = await file.arrayBuffer();
                midi = new Midi(arrayBuffer);
            } else if (typeof file === 'string') {
                midi = await Midi.fromUrl(file);
            } else {
                throw new Error('Invalid file type. Expected File object or URL string');
            }

            setMidiData(midi);
            const abcString = midiToABC(midi);
            renderScore(abcString);
        } catch (error) {
            console.error('Error loading MIDI file:', error);
        }
    };

    const playMidi = async () => {
        if (!midiData || isPlaying) return;

        setIsPlaying(true);
        if (!synth.current) {
            synth.current = new Tone.PolySynth().toDestination();
        }

        midiData.tracks.forEach(track => {
            track.notes.forEach(note => {
                synth.current.triggerAttackRelease(
                    note.name,
                    note.duration,
                    note.time + Tone.now(),
                    note.velocity
                );
            });
        });

        setTimeout(() => {
            setIsPlaying(false);
        }, midiData.duration * 1000);
    };

    return (
        <div className="midi-score-viewer">
            <div className="controls">
                <div className="control-group">
                    <label htmlFor="timeSignature">Time Signature: </label>
                    <select
                        id="timeSignature"
                        value={`${selectedTimeSignature.numerator}/${selectedTimeSignature.denominator}`}
                        onChange={handleTimeSignatureChange}
                        className="time-signature-select"
                    >
                        {TIME_SIGNATURES.map(ts => (
                            <option key={ts.display} value={ts.display}>
                                {ts.display}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={playMidi}
                    disabled={!midiData || isPlaying}
                    className="play-button"
                >
                    {isPlaying ? 'Playing...' : 'Play'}
                </button>
            </div>
            <div className="score-display">
                <div ref={scoreRef} />
            </div>
        </div>
    );
};

export default MidiScoreViewer;