EVMBytecodeSplitter
EVM Bytecode Splitter - Solving the 24KB contract size limit

https://github.com/Divide-By-0/ideas-for-projects-people-would-use

"EVM Bytecode Splitter: There is a 24kb contract limit on the EVM, and it's a huge pain to cut down contract size. However, taking bytecode or Yul directly, determining memory access patterns, and automatically splitting contracts so that they are deployable on chain would be extremely valuable. Specifically, halo2 cannot be verified on chain right now because the Yul verifier without aggregation is too big."


**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev

Project
https://lovable.dev/projects/b0475e15-3827-4d75-95c8-5c480ddc3061

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
