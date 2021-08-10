module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-case": [2, "always", "upper-case"],
    "subject-case": [2, "always", "sentence-case"],
    "subject-max-length": [2, "always", 50],
  },
};
