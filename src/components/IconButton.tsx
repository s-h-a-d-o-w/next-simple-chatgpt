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
} from "react-icons/md";
import { Button } from "./Button";
import { css } from "../../styled-system/css";
import { ComponentProps } from "../../styled-system/types";

type Props = ComponentProps<typeof Button> & {
  name: keyof typeof iconMap;
};

const iconMap = {
  check: MdCheck,
  copy: MdContentCopy,
  delete: MdOutlineDelete,
  history: MdHistory,
  load: MdFileUpload,
  logout: MdLogout,
  replay: MdReplay,
  reset: MdCached,
  save: MdFileDownload,
  stop: MdStop,
  up: MdArrowUpward,
} as const;

export function IconButton({ name, iconSize = "xl", ...rest }: Props) {
  const Icon = iconMap[name];
  const { "aria-label": ariaLabel, ...otherProps } = rest;
  return (
    <Button iconSize={iconSize} aria-label={ariaLabel ?? name} {...otherProps}>
      <Icon
        className={css({
          width: "100%",
          height: "100%",
        })}
      />
    </Button>
  );
}
