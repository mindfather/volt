/* @refresh reload */
import { render } from 'solid-js/web';

import { bootstrapApi } from './logic/api';
import './index.css';
import App from './App';

bootstrapApi();

render(() => <App />, document.getElementById('root'));
