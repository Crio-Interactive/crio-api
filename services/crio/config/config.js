console.log('process.env.CRIO_DATABASE_URL', process.env.CRIO_DATABASE_URL);

module.exports = {
  development: {
    username: 'postgres',
    password: '123456',
    database: 'crio_dev',
    host: '127.0.0.1',
    dialect: 'postgres',
    define: {
      paranoid: true,
    },
  },
  test: {
    username: 'root',
    password: null,
    database: 'database_test',
    host: '127.0.0.1',
    dialect: 'postgres',
  },
  production: {
    url: process.env.CRIO_DATABASE_URL,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    define: {
      paranoid: true,
    },
    dialect: 'postgres',
    // https://github.com/marcogrcr/sequelize/blob/patch-1/docs/manual/other-topics/aws-lambda.md
    pool: {
      max: 5,
      min: 0,
      idle: 0,
      acquire: 3000,
      evict: 100 * 60 * 1000,
    },
  },
};
