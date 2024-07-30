module.exports = {
    apps: [
      {
        name: 'circle bot',
        script: 'dist/main.js',
        instances: 1,
        autorestart: true,
        watch: false,
        time: true,
        max_restarts: 10,
        min_uptime: 10000,
        listen_timeout: 15000,
        max_memory_restart: '5G',
        env: {
          NODE_ENV: 'development',
        },
        env_production: {
          NODE_ENV: 'production',
        },
      },
    ]
}  