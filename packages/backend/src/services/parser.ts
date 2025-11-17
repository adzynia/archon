import { ArchitectureInput } from '@archon/shared';

/**
 * Parse raw architecture text into structured input
 * Extracts sections by headings and diagrams from code blocks
 */
export function parseArchitectureDocument(rawText: string): ArchitectureInput {
  const sections = extractSections(rawText);
  const diagrams = extractDiagrams(rawText);

  return {
    rawText,
    sections,
    diagrams,
  };
}

function extractSections(text: string): ArchitectureInput['sections'] {
  const sections: ArchitectureInput['sections'] = [];
  const lines = text.split('\n');
  let currentSection: { title: string; content: string } | null = null;

  for (const line of lines) {
    // Match markdown headings (# Title or ## Title)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

    if (headingMatch) {
      // Save previous section if exists
      if (currentSection) {
        sections.push(currentSection);
      }

      // Start new section
      currentSection = {
        title: headingMatch[2].trim(),
        content: '',
      };
    } else if (currentSection) {
      // Add content to current section
      currentSection.content += line + '\n';
    }
  }

  // Add last section
  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}

function extractDiagrams(text: string): ArchitectureInput['diagrams'] {
  const diagrams: ArchitectureInput['diagrams'] = [];

  // Match fenced code blocks
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const lang = match[1].toLowerCase();
    const content = match[2];

    let type: 'plantuml' | 'mermaid' | 'unknown' = 'unknown';

    if (lang === 'plantuml' || lang === 'puml' || content.includes('@startuml')) {
      type = 'plantuml';
    } else if (
      lang === 'mermaid' ||
      content.trim().startsWith('graph') ||
      content.trim().startsWith('sequenceDiagram')
    ) {
      type = 'mermaid';
    }

    if (type !== 'unknown') {
      diagrams.push({
        type,
        raw: content.trim(),
      });
    }
  }

  return diagrams;
}
