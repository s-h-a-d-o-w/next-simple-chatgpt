import { MdArrowUpward, MdDelete, MdReplay, MdStop } from "react-icons/md";
import { Button } from "./Button";
import { css } from "../../../styled-system/css";
import { styled } from "../../../styled-system/jsx";
import {
  ComponentProps,
  StyledVariantProps,
} from "../../../styled-system/types";

type Props = ComponentProps<typeof Button> &
  StyledVariantProps<typeof StyledButton> & {
    name: keyof typeof iconMap;
  };

const iconMap = {
  delete: MdDelete,
  replay: MdReplay,
  stop: MdStop,
  up: MdArrowUpward,
} as const;

const StyledButton = styled(Button, {
  variants: {
    size: {
      sm: {
        width: "sm",
        height: "sm",
        padding: "4rem",
      },
      md: {
        width: "md",
        height: "md",
        padding: "4rem",
      },
      xl: {
        width: "xl",
        height: "xl",
        padding: "8rem",
      },
    },
  },
});

export function IconButton({ name, size = "xl", ...rest }: Props) {
  const Icon = iconMap[name];

  return (
    <StyledButton size={size} {...rest}>
      <Icon
        className={css({
          width: "100%",
          height: "100%",
        })}
      />
    </StyledButton>
  );
}
