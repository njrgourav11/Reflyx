// Shim declarations for PrismJS component modules not covered by @types/prismjs
// Extend as needed for additional languages

declare module 'prismjs/components/prism-bash' {
  const value: unknown;
  export default value;
}

declare module 'prismjs/components/*' {
  const value: unknown;
  export default value;
}