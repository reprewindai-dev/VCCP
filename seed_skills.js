const fs = require('fs');

const skillsList = [
  "agent-architecture-audit", "agent-eval", "agent-harness-construction", "agent-payment-x402",
  "agentic-engineering", "agentic-os", "ai-first-engineering", "ai-regression-testing",
  "android-clean-architecture", "api-design", "architecture-decision-records", "article-writing",
  "autonomous-loops", "backend-patterns", "benchmark", "blueprint", "browser-qa", "bun-runtime",
  "canary-watch", "carrier-relationship-management", "ck", "claude-devfleet", "click-path-audit",
  "clickhouse-io", "codebase-onboarding", "coding-standards", "compose-multiplatform-patterns",
  "configure-ecc", "contract-first", "content-engine", "content-hash-cache-pattern", "context-budget",
  "continuous-agent-loop", "continuous-learning", "continuous-learning-v2", "cost-aware-llm-pipeline",
  "cpp-coding-standards", "cpp-testing", "crosspost", "customs-trade-compliance", "data-scraper-agent",
  "database-migrations", "deep-research", "deployment-patterns", "design-system", "django-patterns",
  "django-security", "django-tdd", "django-verification", "dmux-workflows", "docker-patterns",
  "documentation-lookup", "e2e-testing", "energy-procurement", "enterprise-agent-ops", "error-handling",
  "eval-harness", "exa-search", "fal-ai-media", "flutter-dart-code-review", "foundation-models-on-device"
];

const generatedSkills = skillsList.map((skill, index) => {
  return `  {
    id: 'skill-${skill}',
    name: 'ECC ${skill.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}',
    version: '1.0.0',
    description: 'Specialized ECC capability for ${skill.replace(/-/g, ' ')}.',
    category: index % 3 === 0 ? 'mcp-tool' : index % 2 === 0 ? 'data-pipeline' : 'code-gen',
    author: 'Veklom Enterprise / ECC Community',
    hash: require('crypto').createHash('sha256').update(skill).digest('hex'),
    signature: 'sig_ecc_' + require('crypto').createHash('md5').update(skill).digest('hex').substring(0, 10),
    provenanceSigner: 'ed25519:reprewindai_key_main',
    permissions: ['read:workspace'],
    parameters: [
      { name: 'target', type: 'string', description: 'Target identifier', required: true }
    ],
    eccCompatible: true,
    reputationScore: Math.floor(Math.random() * 10) + 90,
    codeSnippet: \`name: ECC \${skill}\\ndescription: ECC skill for \${skill}\\ntools:\\n  - name: execute_\${skill.replace(/-/g, '_')}\\n    parameters: { target: string }\\n\`,
    updatedAt: new Date().toISOString()
  }`;
});

let content = fs.readFileSync('src/server/repogate-scanner.ts', 'utf-8');
content = content.replace(/export const INITIAL_SKILLS_REGISTRY: SkillSpec\[\] = \[[\s\S]*?\];/, `export const INITIAL_SKILLS_REGISTRY: SkillSpec[] = [\n${generatedSkills.join(',\n')}\n];`);

fs.writeFileSync('src/server/repogate-scanner.ts', content);
