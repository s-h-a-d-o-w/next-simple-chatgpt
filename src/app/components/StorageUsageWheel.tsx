import { styled } from "../../../styled-system/jsx";
import { useStorageUsage } from "@/hooks/useStorageUsage";

// @ts-expect-error bug in pandas type generation
const StyledContainer = styled("div", {
  base: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    margin: "0 2rem",
    width: "20px",
    height: "20px",
    xs: {
      width: "24px",
      height: "24px",
    },
    lg: {
      width: "30px",
      height: "30px",
    },
  },
});

// @ts-expect-error bug in pandas type generation
const StyledPercentage = styled("div", {
  base: {
    position: "absolute",
    fontSize: "2xs",
    display: "none",
    fontWeight: "bold",
    color: "gray.700",
    _dark: {
      color: "gray.300",
    },
    xs: {
      display: "block",
    },
  },
});

export function StorageUsageWheel() {
  const storageUsage = useStorageUsage();
  // const storageUsage = 0.85;
  if (!storageUsage) {
    return null;
  }

  const size = 20;
  const percentage = Math.round(storageUsage * 100);
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference * (1 - storageUsage);

  const getColor = (usage: number) => {
    if (usage < 0.5) {
      const red = Math.round(240 * usage * 2);
      return `rgb(${red}, 240, 0)`;
    } else {
      const green = Math.round(240 * (1 - usage) * 2);
      return `rgb(240, ${green}, 0)`;
    }
  };

  return (
    <StyledContainer>
      <svg width={"100%"} height={"100%"} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.2"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(storageUsage)}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{
            transition: "stroke-dashoffset 0.3s ease-in-out",
          }}
        />
      </svg>
      <StyledPercentage>{percentage}%</StyledPercentage>
    </StyledContainer>
  );
}
