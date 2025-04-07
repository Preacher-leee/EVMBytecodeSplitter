# EVMBytecodeSplitter
EVM Bytecode Splitter - Solving the 24KB contract size limit

https://github.com/Divide-By-0/ideas-for-projects-people-would-use

"EVM Bytecode Splitter: There is a 24kb contract limit on the EVM, and it's a huge pain to cut down contract size. However, taking bytecode or Yul directly, determining memory access patterns, and automatically splitting contracts so that they are deployable on chain would be extremely valuable. Specifically, halo2 cannot be verified on chain right now because the Yul verifier without aggregation is too big."
