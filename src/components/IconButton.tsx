import {
  MdCheck,
  MdContentCopy,
  MdArrowUpward,
  MdReplay,
  MdStop,
  MdFileDownload,
  MdFileUpload,
  MdLogout,
  MdHistory,
  MdCached,
  MdImage,
  MdOutlineDelete,
  MdExpandMore,
  MdExpandLess,
} from "react-icons/md";
import { FaGithub } from "react-icons/fa6";
import { Button } from "./Button";
import { css } from "../../styled-system/css";
import { ComponentProps } from "../../styled-system/types";
import { styled } from "../../styled-system/jsx";

type Props = ComponentProps<typeof Button> & {
  name: keyof typeof iconMap;
  label?: string;
};

const iconMap = {
  check: MdCheck,
  collapse: MdExpandLess,
  copy: MdContentCopy,
  delete: MdOutlineDelete,
  expand: MdExpandMore,
  github: FaGithub,
  history: MdHistory,
  image: MdImage,
  load: MdFileUpload,
  logout: MdLogout,
  replay: MdReplay,
  reset: MdCached,
  save: MdFileDownload,
  stop: MdStop,
  up: MdArrowUpward,
} as const;

const StyledButton = styled(Button, {
  base: {
    display: "flex",
    alignItems: "center",
    gap: "6rem",
    whiteSpace: "nowrap",
  },
});

const StyledLabel = styled("span", {
  base: {
    marginBottom: "-1px",
  },
});

export function IconButton({ name, iconSize = "xl", label, ...rest }: Props) {
  const Icon = iconMap[name];
  const { "aria-label": ariaLabel, ...otherProps } = rest;
  return (
    <StyledButton
      iconSize={iconSize}
      aria-label={ariaLabel ?? label ?? name}
      {...otherProps}
    >
      <Icon
        className={css({
          width: "auto",
          height: "100%",
        })}
      />
      {label && <StyledLabel>{label}</StyledLabel>}
    </StyledButton>
  );
}
