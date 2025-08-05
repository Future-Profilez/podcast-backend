module.exports = {
  apps: [
    {
      name: 'Podcast_backend',
      script: './app.js',
      cwd: '/home/ubuntu/Podcast_backend',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
