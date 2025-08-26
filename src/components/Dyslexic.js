import React, { createContext, useContext, useState } from "react";

// Create context
const DyslexicContext = createContext();

// Provider component
export function DyslexicProvider({ children }) {
  const [dyslexic, setDyslexic] = useState(false);

  // Toggle function
  const toggleDyslexic = () => setDyslexic((prev) => !prev);

  // Add/remove class on body
  React.useEffect(() => {
    if (dyslexic) {
      document.body.classList.add("font-dyslexic");
    } else {
      document.body.classList.remove("font-dyslexic");
    }
  }, [dyslexic]);

  return (
    <DyslexicContext.Provider value={{ dyslexic, toggleDyslexic }}>
      {children}
    </DyslexicContext.Provider>
  );
}

// Custom hook for consuming context
export function useDyslexic() {
  return useContext(DyslexicContext);
}

// Example toggle button (put this in your header)
export function DyslexicToggleButton() {
  const { dyslexic, toggleDyslexic } = useDyslexic();
  return (
    <button
      onClick={toggleDyslexic}
      className="text-xs sm:text-base flex items-center gap-2 font-semibold rounded transition duration-200 cursor-pointer bg-yellow-300 text-black hover:bg-amber-500 hover:text-white px-8 py-3 w-max mx-auto">
      {dyslexic ? "Disable Dyslexic Font" : "Enable Dyslexic Font"}
    </button>
  );
}
