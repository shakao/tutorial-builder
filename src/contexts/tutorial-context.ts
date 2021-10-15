import React from 'react';
import { parseTutorial  } from '../lib/markdown';

export interface TutorialStepInfo {
    showHint?: boolean; // automatically displays hint
    showDialog?: boolean; // no coding, displays in modal
    resetDiff?: boolean; // reset diffify algo
    tutorialCompleted?: boolean;

    // Step content
    title?: string;
    activity?: number;
    headerContentMd?: string;
    hintContentMd?: string;

    // State info
    visibleHint?: boolean;

    // Not used
    contentMd?: string;
}

export interface TutorialInfo {
    title: string;
    steps: TutorialStepInfo[];
    code?: string[];
}

export type HintLanguage = "markdown" | "typescript" | "blocks" | "spy";

export interface TutorialHint {
    language: HintLanguage;
    text: string;
}

let tutorialTemplate = `
# My Tutorial

## Step 1 @showDialog

Welcome to my tutorial! This is the first step and it is a dialog

## Step 2

Let's write some code! Click the hint if you need help.

\`\`\`blocks
let x = 2;
let y = 3;
let z = x + y;
\`\`\`

## Step 3

Great work! Click the **Done** button to exit the tutorial.

`

export const tutorial = {
    ...parseTutorial(tutorialTemplate)
};

export const TutorialContext = React.createContext( {
    tutorial,
    setSteps: (newSteps: TutorialStepInfo[]) => {},
    updateStep: (index: number, newStep: TutorialStepInfo) => {}
});