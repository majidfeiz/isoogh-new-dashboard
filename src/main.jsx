import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import * as serviceWorker from "./serviceWorker"
import { BrowserRouter } from "react-router-dom"
import "./i18n"
import { Provider } from "react-redux"
import store from "./store";
import { AuthProvider } from "./context/AuthContext.jsx";
import BaleMiniApp from "./pages/BaleMiniApp/BaleMiniApp.jsx";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.Fragment>
    <Provider store={store}>
      {window.location.pathname.startsWith("/bale-mini-app") ? <BaleMiniApp /> : <AuthProvider><BrowserRouter><App /></BrowserRouter></AuthProvider>}
    </Provider>
  </React.Fragment>
);

serviceWorker.unregister()
