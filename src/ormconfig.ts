import { DataSourceOptions } from 'typeorm';

const config: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'password',
  database: 'Kjtarticle',
  entities: [__dirname + '/**/*.entity{.ts, .js}'], // look for fils with entity.ts or entity.js files
  synchronize: true,
  migrations: [__dirname + '/migrations/**/*.{.ts, .js}'],
  // cli: {
  //   migrationsDir: 'src/migrations',
  // },
};

export default config;