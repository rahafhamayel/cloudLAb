import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Interactions } from '@aws-amplify/interactions';

import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import awsExports from './aws-exports';

// Amplify v6 configuration
Amplify.configure(awsExports);
Amplify.addPluggable(Interactions);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Authenticator.Provider>
      <App />
    </Authenticator.Provider>
  </React.StrictMode>
);
