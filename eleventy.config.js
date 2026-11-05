module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({
    "site/.nojekyll": ".nojekyll",
    "site/fonts": "fonts",
    "site/images": "images",
    "site/style.css": "style.css",
  });

  return {
    dir: {
      input: "site",
      includes: "_includes",
      output: "docs",
    },
    templateFormats: ["njk"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
