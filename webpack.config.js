module.exports = {
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: "coverage",
    coverageProvider: "v8",
    resolve: {
      fallback: {
        fs: false,
        util:false
      },
    },
  }