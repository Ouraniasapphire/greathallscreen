import { createSignal, JSX } from "solid-js";
import { useConfig } from "../useConfig";

export default function SlideMenu(props: {
  children:
    | number
    | boolean
    | Node
    | JSX.ArrayElement
    | (string & {})
    | null
    | undefined;
}) {
  const [open, setOpen] = createSignal(false);
  const { config } = useConfig();

  return (
    <div>
      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: "fixed",
          inset: "0",
          "background-color": "rgba(0,0,0,0.5)",
          transition: "opacity 0.3s ease",
          opacity: open() ? 1 : 0,
          visibility: open() ? "visible" : "hidden",
          "z-index": 40,
        }}
      />

      {/* Slide-in menu */}
      <div
        style={{
          display: "flex",
          "flex-direction": "column",
          "align-items": "stretch",
          "justify-content": "flex-start",
          gap: "0.5rem",
          position: "fixed",
          top: 0,
          right: 0,
          height: "100%",
          width: "8rem",
          "background-color": config().backgroundColor,
          "box-shadow": "0 0 15px rgba(0,0,0,0.3)",
          transform: open() ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease",
          "z-index": 60,
          padding: "1.5rem",
          "overflow-y": "auto",
        }}
      >
        {/* Button inside menu */}
        <button
          onClick={() => setOpen(false)}
          style={{
            width: "100%",
            padding: "0.5rem 1rem",
            "border-radius": "0.5rem",
            border: "none",
            cursor: "pointer",
            "background-color": config().textColor,
            color: config().backgroundColor,
            "font-weight": "bold",
            "line-height": 1,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill={config().backgroundColor}
          >
            <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
          </svg>
        </button>

        {/* Menu content */}
        {props.children}
      </div>

      {/* External toggle button */}
      {!open() && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: "fixed",
            top: "1rem",
            right: "1rem",
            padding: "0.5rem 1rem",
            "border-radius": "0.5rem",
            border: "none",
            cursor: "pointer",
            "background-color": config().textColor,
            color: config().backgroundColor,
            "font-weight": "bold",
            "z-index": 50,
            "line-height": 1,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill={config().backgroundColor}
          >
            <path d="M120-240v-80h720v80H120Zm0-200v-80h720v80H120Zm0-200v-80h720v80H120Z" />
          </svg>
        </button>
      )}
    </div>
  );
}
