import "./App.css";
import AsyncRouter from "./routes/AsyncRouter";
import { ThemeProvider } from "./context/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <AsyncRouter />
    </ThemeProvider>
  );
}

export default App;
