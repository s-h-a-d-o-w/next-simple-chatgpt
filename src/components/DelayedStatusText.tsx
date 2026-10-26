import { HTMLAttributes, useEffect, useState } from "react";
import { styled } from "@/styled-system/jsx";

const SHOW_DELAY = 2_000;

const DelayedStatusTextContainer = styled("div", {
  base: {
    opacity: 0,
    animation: `400ms ease-in-out forwards fadeIn`,
  },
});

function DelayedStatusText({
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), SHOW_DELAY);
  }, []);

  return !show ? undefined : (
    <DelayedStatusTextContainer {...props}>
      {children}
    </DelayedStatusTextContainer>
  );
}

export default DelayedStatusText;
