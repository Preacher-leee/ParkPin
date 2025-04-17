import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add title and favicon to the document
document.title = "ParkPal - Never Forget Where You Parked";

// Render the app
createRoot(document.getElementById("root")!).render(<App />);
