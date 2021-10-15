import { useState, useRef } from 'react';
import Editor from "@monaco-editor/react";

import './styles/App.css';

import { getTutorialMarkdown, parseTutorial } from './lib/markdown';
import { TutorialStepInfo, TutorialContext, tutorial } from './contexts/tutorial-context';
import { TutorialStep } from './components/TutorialStep';

interface SwapState {
    up: number;
    down: number;
}

function App() {
    const [tutorialState, setTutorialState] = useState(tutorial);
    const { title, steps } = tutorialState;

    const [view, setView] = useState<"steps" | "markdown">("steps");
    const [swapState, setSwapState] = useState<SwapState | undefined>(undefined);
    const [currentTitle, setCurrentTItle] = useState(title);

    const editorRef = useRef(null);

    const toggleView = () => {
        if (view === "steps") {
            setView("markdown");
        } else {
            const newTutorial = editorRef?.current ? parseTutorial((editorRef.current as any).getValue()) : tutorialState;
            setSteps(newTutorial.steps);
            setView("steps");
        }
    }

    const copyMarkdown = () => {
        const markdown = getTutorialMarkdown(title, steps);
        if (navigator.clipboard) {
            navigator.clipboard.writeText(markdown).then(() => {
                console.log("Copied to clipboard.");
            }, (err) => {
                console.log("Failed to copy markdown.", err);
            });
        } else if ((window as any).clipboardData) {
            (window as any).clipboardData.setData("Text", markdown);
        }
    }

    const setTitle = () => {
        setTutorialState({
            ...tutorialState,
            title: currentTitle
        })
    }

    const onTitleInputChange = (evt: any) => setCurrentTItle(evt.target.value)

    const swapSteps = (startIndex: number, endIndex: number) => {
        if (!swapState) {
            setSwapState({
                up: Math.max(startIndex, endIndex),
                down: Math.min(startIndex, endIndex)
            })

            setTimeout(() => {
                [steps[startIndex], steps[endIndex]] = [steps[endIndex], steps[startIndex]];
                setSteps(steps);
                setSwapState(undefined);
            }, 400)
        }
    }

    const setSteps = (newSteps: TutorialStepInfo[]) => {
        setTutorialState({
            ...tutorialState,
            steps: newSteps
        })
    };

    const updateStep = (index: number, newStep: TutorialStepInfo) => {
        let newSteps = tutorialState.steps;
        newSteps[index] = {
            ...newSteps[index],
            ...newStep
        };
        setTutorialState({
            ...tutorialState,
            steps: newSteps
        })
    };

    const tutorialContext = {
        tutorial: tutorialState,
        setSteps,
        updateStep
    }

    function handleEditorRef(editor: any, monaco: any) {
        editorRef.current = editor;
    }

    return (
        <TutorialContext.Provider value={tutorialContext}>
            <div className="app">
                <div className="header">
                    <div className="header-bar-left">
                        <input value={currentTitle} onChange={onTitleInputChange} onBlur={setTitle}></input>
                    </div>
                    <div className="header-bar-right">
                        <div className="header-button toggle-view" onClick={toggleView}>
                            <i className={`ui icon ${view === "steps" ? "code" : "list ol"}`} />
                            <span>{`View ${view === "steps" ? "Markdown" : "Tutorial"}`}</span>
                        </div>
                        <div className="header-button" onClick={copyMarkdown}>
                            <i className="ui icon copy" />
                        </div>
                    </div>
                </div>
                <div className="container">
                    {view === "steps" && <div className="tutorial-step-container">
                        {steps.map((el, i) => {
                            const { title, headerContentMd, hintContentMd,
                                showDialog, visibleHint } = el as TutorialStepInfo;
                            return <TutorialStep key={`step_${i}`} index={i}
                                className={swapState?.up === i ? "animating up"
                                    : (swapState?.down === i ? "animating down" : "" )}
                                title={title || ""} headerContentMd={headerContentMd || ""}
                                hintContentMd={hintContentMd || ""} showDialog={showDialog}
                                visibleHint={visibleHint}
                                swapSteps={swapSteps} />
                        })}
                    </div>}
                    {view === "markdown" && <div className="tutorial-markdown">
                        <Editor defaultLanguage="markdown"
                            defaultValue={getTutorialMarkdown(title, steps)}
                            onMount={handleEditorRef} />
                    </div>}
                </div>
            </div>
        </TutorialContext.Provider>
    );
}

export default App;
