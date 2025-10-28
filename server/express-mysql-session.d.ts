declare module 'express-mysql-session' {
  import { SessionStore } from 'express-session';
  import { Pool, Connection } from 'mysql2/promise';

  interface MySQLSessionStoreOptions {
    createDatabaseTable?: boolean;
    schema?: {
      tableName?: string;
      columnNames?: {
        session_id?: string;
        expires?: string;
        data?: string;
      };
    };
  }

  interface MySQLSessionStore extends SessionStore {
    new (options: MySQLSessionStoreOptions, connection: Pool | Connection): SessionStore;
  }

  function MySQLStore(session: any): MySQLSessionStore;

  export = MySQLStore;
}
