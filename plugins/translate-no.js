export default ({ app }) => {
    app.router.afterEach(() => {
      if (process.client) {
        document.getElementById('__nuxt').setAttribute('translate', 'no');
      }
    });
  };
  