"use client";

import { useEffect } from "react";
import { styled } from "../../../styled-system/jsx";
import { useIsDarkMode } from "@/hooks/useDarkMode";

const ToggleLabel = styled("label", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    cursor: "pointer",
  },
});

const HiddenInput = styled("input", {
  base: {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: 0,
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: 0,
  },
});

const ToggleTrack = styled("div", {
  base: {
    display: "block",
    width: "48rem",
    height: "24rem",
    borderRadius: "full !important",
    border: "2px solid",

    backgroundColor: "white",
    borderColor: "amber.800",
    _dark: {
      backgroundColor: "gray.700",
      borderColor: "brand.500",
    },
  },
});

const IconContainer = styled("div", {
  base: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingX: "6rem",
  },
});

const Icon = styled("svg", {
  base: {
    height: "12rem",
    width: "12rem",
  },
  variants: {
    type: {
      sun: {
        color: "black",
      },
      moon: {
        color: "white",
      },
    },
  },
});

const ToggleThumb = styled("div", {
  base: {
    position: "absolute",
    top: "4rem",
    width: "16rem",
    height: "16rem",
    borderRadius: "full !important",
    transitionProperty: "left",
    transitionDuration: "200ms",
    transitionTimingFunction: "ease-in-out",

    backgroundColor: "amber.800",
    left: "4rem",
    _dark: {
      backgroundColor: "gray.50",
      left: "28rem",
    },
  },
});

function applyTheme(isDark: boolean) {
  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function ThemeToggle() {
  const [isDarkMode, setIsDarkMode] = useIsDarkMode();

  useEffect(() => {
    applyTheme(isDarkMode);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    applyTheme(newDarkMode);
  };

  return (
    <ToggleLabel>
      <div style={{ position: "relative" }}>
        <HiddenInput
          type="checkbox"
          checked={isDarkMode}
          onChange={toggleDarkMode}
          aria-label="Toggle dark mode"
        />
        <ToggleTrack />
        <IconContainer>
          <Icon
            type="moon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </Icon>
          <Icon
            type="sun"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </Icon>
        </IconContainer>
        <ToggleThumb />
      </div>
    </ToggleLabel>
  );
}
