import { MdArrowUpward, MdDelete, MdReplay, MdStop } from "react-icons/md";
import { Button } from "./Button";
import { css } from "../../../styled-system/css";
import { ComponentProps } from "../../../styled-system/types";

type Props = ComponentProps<typeof Button> & {
  name: keyof typeof iconMap;
};

const iconMap = {
  delete: MdDelete,
  replay: MdReplay,
  stop: MdStop,
  up: MdArrowUpward,
} as const;

export function IconButton({ name, iconSize = "xl", ...rest }: Props) {
  const Icon = iconMap[name];

  return (
    <Button iconSize={iconSize} {...rest}>
      <Icon
        className={css({
          width: "100%",
          height: "100%",
        })}
      />
    </Button>
  );
}
