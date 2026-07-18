const app = require('./app');
const { port } = require('./config/env');
const { sequelize } = require('./models');

async function start() {
  await sequelize.authenticate();
  app.listen(port, () => {
    console.log(`SIGEB API disponible en http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error('No fue posible iniciar SIGEB API:', error.message);
  process.exitCode = 1;
});
