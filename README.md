# Vite + React + TypeScript SPA

This project is preconfigured with the following tooling:

- Yarn for package management
- ESLint with React and React Hooks plugins
- Prettier and EditorConfig for formatting
- Vitest and Testing Library for automated tests
- Redux Toolkit with RxJS via redux-observable
- Storybook with Figma-linked design references

## Commands

```bash
yarn dev
yarn build
yarn lint
yarn format
yarn test
yarn storybook
```

## Storybook and Figma

The sample story at `src/components/CounterPanel.stories.tsx` already includes a Figma design parameter.
Replace the placeholder URL with your actual Figma file or frame URL.

## Suggested workflow

1. Build UI components under `src/components`
2. Add stories beside components with `*.stories.tsx`
3. Connect state through the store in `src/store`
4. Add tests with Vitest and Testing Library
