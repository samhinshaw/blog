module.exports = (Plugin, options) => {
  Plugin.markdown.configure((md) => {
    md.use(
      {
        langPrefix: 'language-',
        typographer: true,
      },
      options,
    );
  });
};
