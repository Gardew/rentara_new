import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {Toaster} from "./components/ui/toaster.tsx";
import { initI18n } from './services/i18n/index.js'

initI18n().then(() => {
	ReactDOM.createRoot(document.getElementById('root')).render(
		<React.StrictMode>
			<Toaster/>
			<App />
		</React.StrictMode>,
	)
});
