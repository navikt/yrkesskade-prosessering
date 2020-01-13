import * as React from 'react';
import { render } from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import App from './komponenter/App';

import './index.less';

const rootElement = document.getElementById('app');
const renderApp = (Component: React.ComponentType<{}>): void => {
    render(
        <AppContainer>
            <Component />
        </AppContainer>,
        rootElement
    );
};

renderApp(App);

if (module.hot) {
    module.hot.accept('./komponenter/App', () => {
        const NewApp = require('./komponenter/App').default;
        renderApp(NewApp);
    });
}
