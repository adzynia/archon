import { describe, it, expect } from 'vitest';
import { parseArchitectureDocument } from './parser';

describe('parseArchitectureDocument', () => {
  it('should parse basic architecture text', () => {
    const text = `
# My Architecture

## Overview
This is a test architecture.

## Components
- Service A
- Service B
    `;

    const result = parseArchitectureDocument(text);

    expect(result).toHaveProperty('rawText');
    expect(result).toHaveProperty('sections');
    expect(result).toHaveProperty('diagrams');
    expect(result.rawText).toBe(text);
    expect(result.sections).toBeDefined();
    expect(result.diagrams).toBeDefined();
  });

  it('should extract markdown sections', () => {
    const text = `
# Architecture

## Overview
Overview content here.

## Components
Component details here.

## Deployment
Deployment info here.
    `;

    const result = parseArchitectureDocument(text);

    expect(result.sections).toHaveLength(4);
    const overviewSection = result.sections.find(s => s.title === 'Overview');
    const componentsSection = result.sections.find(s => s.title === 'Components');
    const deploymentSection = result.sections.find(s => s.title === 'Deployment');

    expect(overviewSection).toBeDefined();
    expect(componentsSection).toBeDefined();
    expect(deploymentSection).toBeDefined();
    expect(overviewSection?.content).toContain('Overview content here');
    expect(componentsSection?.content).toContain('Component details here');
  });

  it('should identify Mermaid diagrams', () => {
    const text = `
# Architecture

\`\`\`mermaid
graph TD
  A --> B
\`\`\`
    `;

    const result = parseArchitectureDocument(text);

    expect(result.diagrams).toHaveLength(1);
    expect(result.diagrams[0]).toHaveProperty('type', 'mermaid');
    expect(result.diagrams[0].raw).toContain('graph TD');
  });

  it('should identify PlantUML diagrams', () => {
    const text = `
# Architecture

\`\`\`plantuml
@startuml
A --> B
@enduml
\`\`\`
    `;

    const result = parseArchitectureDocument(text);

    expect(result.diagrams).toHaveLength(1);
    expect(result.diagrams[0]).toHaveProperty('type', 'plantuml');
    expect(result.diagrams[0].raw).toContain('@startuml');
  });

  it('should handle empty text', () => {
    const result = parseArchitectureDocument('');

    expect(result.rawText).toBe('');
    expect(result.sections).toEqual([]);
    expect(result.diagrams).toEqual([]);
  });

  it('should handle text with no sections', () => {
    const text = 'Just some plain text without sections';

    const result = parseArchitectureDocument(text);

    expect(result.rawText).toBe(text);
    expect(result.sections).toEqual([]);
  });

  it('should handle multiple diagrams', () => {
    const text = `
# Architecture

\`\`\`mermaid
graph TD
  A --> B
\`\`\`

\`\`\`plantuml
@startuml
C --> D
@enduml
\`\`\`
    `;

    const result = parseArchitectureDocument(text);

    expect(result.diagrams).toHaveLength(2);
    expect(result.diagrams[0].type).toBe('mermaid');
    expect(result.diagrams[1].type).toBe('plantuml');
  });
});
