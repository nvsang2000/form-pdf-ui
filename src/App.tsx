import '@/styles/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Editor from './pages';
import ViewPDF from './pages/pdf';

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Editor />} />
				<Route path="view" element={<ViewPDF />} />
			</Routes>
		</BrowserRouter>
	);
}

export default App;
