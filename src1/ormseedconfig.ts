import { DataSourceOptions } from 'typeorm';
import ormconfig from './ormconfig';

const ormseedconfig = {
  ...ormconfig,
  migrations: ['src/seeds/*.ts'],
  cli: {
    migrationsDir: 'src/seeds',
  },
};

export default ormseedconfig;
