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

    visibleHint?: boolean;

    swapSteps: (startIndex: number, endIndex: number) => void;
}

export function TutorialStep(props: TutorialStepProps) {
    const { index, className, title, headerContentMd, hintContentMd,
        showDialog, visibleHint, swapSteps } = props;
    const [ stepTitle, setStepTitle ] = useState(title);
    const [ stepContent, setStepContent ] = useState(headerContentMd);
    const [ hintContent, setHintContent ] = useState(hintContentMd);
    const [ showHintContent, setShowHintContent ] = useState(visibleHint);
    const [ isDialog, setIsDialog ] = useState(showDialog);
    const hintEitorRef = useRef(null);

    useEffect(() => setStepTitle(title), [title]);
    useEffect(() => setStepContent(headerContentMd), [headerContentMd]);
    useEffect(() => setHintContent(hintContentMd), [hintContentMd]);
    useEffect(() => setShowHintContent(visibleHint), [visibleHint]);
    useEffect(() => setIsDialog(showDialog), [showDialog]);

    const onStepTitleChange = (evt: any) => {
        setStepTitle(evt.target.value)
    }

    const onStepContentChange = (evt: any) => {
        setStepContent(evt.target.value)
    }

    function handleHintEditorRef(editor: any, monaco: any) {
        hintEitorRef.current = editor;
        monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
            noSemanticValidation: true,
            noSyntaxValidation: true,
        });
    }


    return (
        <TutorialContext.Consumer>
            {({tutorial, setSteps, updateStep}) => {
                const hint = parseHint(hintContent);
                const currentStep = {
                    title: stepTitle,
                    headerContentMd: stepContent,
                    hintContentMd: hintContent,
                    showDialog: isDialog,
                    visibleHint: showHintContent
                }
                return (<div className={`tutorial-step ${className || ""}`}>
                    <div className="tutorial-step-body">
                        <div className="step-handle">
                            <div className="step-handle-top">
                                <i className="ui icon chevron up" onClick={() => swapSteps(index, index - 1)} />
                            </div>
                            <div className="step-handle-bottom">
                                <i className="ui icon chevron down" onClick={() => swapSteps(index, index + 1)}  />
                            </div>
                        </div>
                        <div className="step-content" draggable={false}>
                            <div className="step-title">
                                <input type="text" value={stepTitle} placeholder="Enter step title" onChange={onStepTitleChange}
                                    onBlur={() => updateStep(index, currentStep)} />
                                <span>Dialog</span>
                                <i className={`ui icon square outline ${isDialog ? "check" : ""}`}
                                    onClick={() => updateStep(index, {
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
                                            onClick={() => updateStep(index, { visibleHint: !showHintContent })} />
                                    </div>
                                    {showHintContent && <div className="hint-controls-right">
                                        <label>Language:</label>
                                        <select name="language" value={hint?.language}
                                            onChange={(evt: any) => {
                                                updateStep(index, {
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
                                    <Editor defaultLanguage="typescript" value={hint?.text}
                                        options={{ minimap: { enabled: false } }}
                                        onMount={handleHintEditorRef}
                                        onChange={(value?: string) => {
                                            const newHint = parseHint(hintContentMd);
                                            updateStep(index, {
                                                // TODO these defaults are probably bad
                                                hintContentMd: getHintMarkdown({text: value || "", language: newHint?.language || "markdown"})
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