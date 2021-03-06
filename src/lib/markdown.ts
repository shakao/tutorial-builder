import { TutorialStepInfo, TutorialHint, HintLanguage } from '../contexts/tutorial-context';

export function getTutorialMarkdown(title: string, steps: TutorialStepInfo[]) {
    let md = `### @explicitHints true\n\n# ${title}\n\n`;
    steps.forEach((step, i) => {
        const { title, showHint, showDialog, headerContentMd, hintContentMd, visibleHint } = step;
        let titleMd = `${title || `Step ${i}`} ${(showHint || showDialog) ? "@showHint" : ""} ${showDialog ? "@showDialog" : ""}`
        if (!title) titleMd = `{${titleMd}}`;
        md += `## ${titleMd}\n\n`;
        md += `${headerContentMd}\n\n`;
        if (visibleHint) md += `#### ~ tutorialhint\n${hintContentMd}\n\n`;
    })

    return md;
}

export function parseTutorial(md: string): { title: string, steps: TutorialStepInfo[] } {
    const parsedTutorial = (window as any).pxt.tutorial.parseTutorial(md);
    const steps = parsedTutorial.steps;
    steps.forEach((step: TutorialStepInfo) => {
        step.visibleHint = !!step.hintContentMd;
    })
    return { title: parsedTutorial.title, steps: steps };
}

export function getHintMarkdown(hint?: TutorialHint): string | undefined {
    if (!hint) return;

    switch (hint.language) {
        case "blocks":
        case "typescript":
        case "spy":
            return `\`\`\`${hint.language}\n${hint.text}\n\`\`\``
        case "markdown":
        default:
            return hint.text
    }
}

export function parseHint(md?: string): TutorialHint | undefined {
    if (!md) return;

    let language: HintLanguage = "markdown";
    let text = md.trim();
    let match = /^```\s*(blocks|ts|typescript|spy)\s*([\s\S]+)\s*```/gmi.exec(text);
    if (match) {
        text = match[2];
        switch (match[1]) {
            case "blocks":
            case "typescript":
            case "spy":
                language = match[1];
                break;
            case "ts":
                language = "typescript";
                break;
            default:
                language = "blocks"
                break;
        }
    }

    return { language, text }
}