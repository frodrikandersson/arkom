import { StackClientApp } from '@stackframe/react';
import { useNavigate } from 'react-router-dom';
import { config } from './env';

export const stackClientApp = new StackClientApp({
  projectId: config.stackProjectId,
  publishableClientKey: config.stackPublishableKey,
  tokenStore: 'cookie',
  redirectMethod: { useNavigate },
});