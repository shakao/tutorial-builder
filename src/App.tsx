import { useState, useRef } from 'react';
import Editor from "@monaco-editor/react";

import './styles/App.css';

import { getTutorialMarkdown, parseTutorial } from './lib/markdown';
import { TutorialStepInfo, TutorialContext, tutorial } from './contexts/tutorial-context';
import { TutorialStep } from './components/TutorialStep';

function App() {
    const [tutorialState, setTutorialState] = useState(tutorial);
    const [view, setView] = useState<"steps" | "markdown">("steps");
    const { steps } = tutorialState;
    const editorRef = useRef(null);

    const toggleView = () => {
        if (view === "steps") {
            setView("markdown");
        } else {
            const newSteps = editorRef?.current ? parseTutorial((editorRef.current as any).getValue()) : steps;
            setSteps(newSteps);
            setView("steps");
        }
    }

    const copySteps = () => {
        const markdown = getTutorialMarkdown(steps);
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
                    <div className="header-button" onClick={toggleView}>
                        <i className={`ui icon ${view === "steps" ? "code" : "list ol"}`} />
                    </div>
                    <div className="header-button" onClick={copySteps}>
                        <i className="ui icon copy" />
                    </div>
                </div>
                <div className="container">
                    {view === "steps" && <div className="tutorial-step-container">
                        {steps.map((el, i) => {
                            const { title, headerContentMd, hintContentMd, showDialog } = el;
                            return <TutorialStep key={`step_${i}`} index={i}
                                title={title || ""} headerContentMd={headerContentMd || ""}
                                hintContentMd={hintContentMd || ""} showDialog={showDialog} />
                        })}
                    </div>}
                    {view === "markdown" && <div className="tutorial-markdown">
                        <Editor defaultLanguage="markdown"
                            defaultValue={getTutorialMarkdown(steps)}
                            onMount={handleEditorRef} />
                    </div>}
                </div>
            </div>
        </TutorialContext.Provider>
    );
}

export default App;
