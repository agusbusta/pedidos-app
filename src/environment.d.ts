declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      DB_HOST: string;
      DB_PORT: string;
      DB_NAME: string;
      DB_USER: string;
      DB_PASSWORD: string;
      ALERTA_DESPACHO_HORAS: string;
      SMTP_HOST: string;
      SMTP_PORT: string;
      SMTP_USER: string;
      SMTP_PASS: string;
      ADMIN_EMAIL: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

export {}; 