export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'build', 'ci',
      'enh', 'enhance', 'tweak', 'imp', 'improve',
    ]],
    'subject-case': [2, 'always', 'sentence-case'],
    'header-max-length': [2, 'always', 80],
  },
  ignores: [
    (commit) => commit.includes('Signed-off-by: dependabot[bot]')
  ]
};
