import React, { useState } from "react";
import { Button, Toggle } from "@uxpin/merge";
import { FaWheelchair, FaKeyboard, FaEye } from "react-icons/fa";

export default function HumanInterfaceDesign() {
  const [highContrast, setHighContrast] = useState(false);
  const [keyboardNav, setKeyboardNav] = useState(true);
  const [screenReader, setScreenReader] = useState(true);

  return (
    <div
      className={`p-6 rounded-lg shadow-lg ${
        highContrast ? "bg-black text-white" : "bg-gray-100 text-black"
      }`}
    >
      <h2 className="text-2xl font-bold mb-4">Human Interface Design</h2>

      {/* Section: Accessibility Features */}
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Accessibility Features</h3>
        <p className="text-sm mb-4">
          MobiNav ensures an inclusive experience with accessibility-focused features.
        </p>
        <div className="flex flex-col space-y-4">
          {/* High Contrast Mode */}
          <div className="flex items-center space-x-2">
            <FaEye size={20} />
            <label className="text-sm font-medium">High Contrast Mode</label>
            <Toggle
              value={highContrast}
              onChange={() => setHighContrast(!highContrast)}
            />
          </div>

          {/* Keyboard Navigation */}
          <div className="flex items-center space-x-2">
            <FaKeyboard size={20} />
            <label className="text-sm font-medium">Keyboard Navigation</label>
            <Toggle
              value={keyboardNav}
              onChange={() => setKeyboardNav(!keyboardNav)}
            />
          </div>

          {/* Screen Reader Support */}
          <div className="flex items-center space-x-2">
            <FaWheelchair size={20} />
            <label className="text-sm font-medium">Screen Reader Support</label>
            <Toggle
              value={screenReader}
              onChange={() => setScreenReader(!screenReader)}
            />
          </div>
        </div>
      </section>

      {/* Section: UI Components */}
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">UI Components</h3>
        <ul className="list-disc pl-6 text-sm">
          <li>Interactive campus map with real-time updates.</li>
          <li>Search bar for building-specific accessibility details.</li>
          <li>Obstacle reporting with an easy-to-use feedback form.</li>
          <li>Dark mode and color-blind friendly contrast settings.</li>
        </ul>
      </section>

      {/* Section: User Testing & Compliance */}
      <section className="mb-6">
        <h3 className="text-xl font-semibold mb-2">User Testing & Compliance</h3>
        <p className="text-sm">
          The interface adheres to WCAG 2.1 guidelines, ensuring compliance with ADA standards. 
          Extensive user testing is conducted with individuals who have diverse mobility needs.
        </p>
      </section>

      {/* CTA - Preview */}
      <Button
        variant="primary"
        onClick={() => alert("Previewing MobiNav UI Design")}
      >
        Preview UI Design
      </Button>
    </div>
  );
}
