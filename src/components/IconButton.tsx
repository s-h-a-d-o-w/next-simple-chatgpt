import {
  MdCheck,
  MdContentCopy,
  MdArrowUpward,
  MdOutlineDelete,
  MdReplay,
  MdStop,
  MdFileDownload,
  MdFileUpload,
  MdLogout,
  MdHistory,
  MdCached,
  MdImage,
} from "react-icons/md";
import { Button } from "./Button";
import { css } from "../../styled-system/css";
import { ComponentProps } from "../../styled-system/types";

type Props = ComponentProps<typeof Button> & {
  name: keyof typeof iconMap;
  label?: string;
};

const iconMap = {
  check: MdCheck,
  copy: MdContentCopy,
  delete: MdOutlineDelete,
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

export function IconButton({ name, iconSize = "xl", label, ...rest }: Props) {
  const Icon = iconMap[name];
  const { "aria-label": ariaLabel, ...otherProps } = rest;
  return (
    <Button
      iconSize={iconSize}
      className={css({ display: "flex", alignItems: "center", gap: "4rem" })}
      aria-label={ariaLabel ?? name}
      {...otherProps}
    >
      <Icon
        className={css({
          width: "auto",
          height: "100%",
        })}
      />
      {label && <span className={css({ marginBottom: "-1px" })}>{label}</span>}
    </Button>
  );
}
