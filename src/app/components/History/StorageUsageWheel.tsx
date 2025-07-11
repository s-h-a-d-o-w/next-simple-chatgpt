import { styled } from "../../../../styled-system/jsx";
import { useStorageUsage } from "@/hooks/useStorageUsage";

const SIZE = 20;

const StyledContainer = styled("div", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    margin: "0 2rem",

    width: "20rem",
    height: "20rem",
    xs: {
      width: "24rem",
      height: "24rem",
    },
    lg: {
      width: "30rem",
      height: "30rem",
    },
  },
});

const StyledPercentage = styled("div", {
  base: {
    position: "absolute",
    fontSize: "2xs",
    fontWeight: "bold",

    color: "gray.700",
    _dark: {
      color: "gray.300",
    },

    display: "none",
    xs: {
      display: "block",
    },
  },
});

function getColor(usage: number) {
  if (usage < 0.5) {
    const red = Math.round(240 * usage * 2);
    return `rgb(${red}, 240, 0)`;
  } else {
    const green = Math.round(240 * (1 - usage) * 2);
    return `rgb(240, ${green}, 0)`;
  }
}

export function StorageUsageWheel() {
  const storageUsage = useStorageUsage();
  if (!storageUsage) {
    return null;
  }

  const radius = (SIZE - 4) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <StyledContainer>
      <svg width={"100%"} height={"100%"} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.2"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={radius}
          fill="none"
          stroke={getColor(storageUsage)}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - storageUsage)}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          style={{
            transition: "stroke-dashoffset 0.3s ease-in-out",
          }}
        />
      </svg>
      <StyledPercentage>{Math.round(storageUsage * 100)}%</StyledPercentage>
    </StyledContainer>
  );
}
