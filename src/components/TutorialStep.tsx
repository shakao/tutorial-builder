import { useEffect, useState, useRef } from 'react';
import Editor from "@monaco-editor/react";

import { parseHint, getHintMarkdown } from '../lib/markdown';

import { TutorialContext } from '../contexts/tutorial-context';

interface TutorialStepProps {
    index: number;
    className?: string;

    title: string;
    headerContentMd: string;
    hintContentMd?: string;
    showDialog?: boolean;
}

export function TutorialStep(props: TutorialStepProps) {
    const { index, className, title, headerContentMd, hintContentMd, showDialog} = props;
    const [ stepTitle, setStepTitle ] = useState(title);
    const [ stepContent, setStepContent ] = useState(headerContentMd);
    const [ showHintContent, setShowHintContent ] = useState(!!hintContentMd);
    const [ hint, setHint ] = useState(parseHint(hintContentMd));
    const [ isDialog, setIsDialog ] = useState(showDialog);
    const hintEitorRef = useRef(null);

    useEffect(() => setStepTitle(title), [title]);
    useEffect(() => setStepContent(headerContentMd), [headerContentMd]);
    useEffect(() => setHint(parseHint(hintContentMd)), [hintContentMd]);
    useEffect(() => setIsDialog(showDialog), [showDialog]);

    const onStepTitleChange = (evt: any) => {
        setStepTitle(evt.target.value)
    }

    const onStepContentChange = (evt: any) => {
        setStepContent(evt.target.value)
    }

    const toggleHintContent = () => {
        setShowHintContent(!showHintContent);
    }

    function handleHintEditorRef(editor: any, monaco: any) {
        hintEitorRef.current = editor;
    }

    return (
        <TutorialContext.Consumer>
            {({tutorial, setSteps, updateStep}) => {
                const currentStep = {
                    title: stepTitle,
                    headerContentMd: stepContent,
                    hintContentMd: getHintMarkdown(hint),
                    showDialog: isDialog
                }

                return (<div className={`tutorial-step ${className || ""}`}>
                    <div className="tutorial-step-body">
                        <div className="step-handle">
                            <i className="ui icon arrows alternate vertical" />
                        </div>
                        <div className="step-content" draggable={false}>
                            <div className="step-title">
                                <input type="text" value={stepTitle} placeholder="Enter step title" onChange={onStepTitleChange}
                                    onBlur={() => updateStep(index, currentStep)} />
                                <span>Dialog</span>
                                <i className={`ui icon square outline ${isDialog ? "check" : ""}`}
                                    onClick={() => updateStep(index, {
                                        ...currentStep,
                                        showDialog: !isDialog,
                                        showHint: !isDialog
                                    })} />
                            </div>
                            <div className="step-body">
                                <textarea rows={5} value={stepContent} onChange={onStepContentChange}
                                    onBlur={() => updateStep(index, currentStep)} />
                            </div>
                            <div className="step-hint">
                                <div className="hint-controls">
                                    <div className="hint-controls-left">
                                        <span>Has hint</span>
                                        <i className={`ui icon square outline ${showHintContent ? "check" : ""}`}
                                            onClick={toggleHintContent} />
                                    </div>
                                    {showHintContent && <div className="hint-controls-right">
                                        <label>Language:</label>
                                        <select name="language" value={hint?.language}
                                            onChange={(evt: any) => {
                                                updateStep(index, {
                                                    ...currentStep,
                                                    hintContentMd: getHintMarkdown({text: hint?.text || "", language: evt.target.value})
                                                })
                                            }}>
                                            <option value="blocks">Blocks</option>
                                            <option value="typescript">JavaScript</option>
                                            <option value="spy">Python</option>
                                            <option value="markdown">Markdown</option>
                                        </select>
                                    </div>}
                                </div>
                                {showHintContent && <div className="hint-body">
                                    <Editor defaultLanguage="typescript" defaultValue={hint?.text}
                                        // TODO turn off error highlighting
                                        options={{ minimap: { enabled: false } }}
                                        onMount={handleHintEditorRef}
                                        onChange={(value?: string) => {
                                            updateStep(index, {
                                                ...currentStep,
                                                // TODO these defaults are probably bad
                                                hintContentMd: getHintMarkdown({text: value || "", language: hint?.language || "markdown"})
                                            })
                                        }} />
                                </div>}
                            </div>
                        </div>
                    </div>
                    <div className="tutorial-step-actions">
                        <div className="step-button" onClick={() => {
                                tutorial.steps.splice(index, 1);
                                setSteps(tutorial.steps);
                            }}>
                            <i className="ui icon trash can" />
                        </div>
                        <div className="step-button" onClick={() => {
                                tutorial.steps.splice(index + 1, 0, { });
                                setSteps(tutorial.steps);
                            }}>
                            <i className="ui icon add circle" />
                        </div>
                    </div>
                </div>)
            }}
        </TutorialContext.Consumer>
    );
}