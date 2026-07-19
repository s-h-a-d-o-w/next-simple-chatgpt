import DialogImplementation, { type DialogProps } from "./DialogImplementation";
import { ClientOnly } from "./ClientOnly";

export const Dialog = ({ ...props }: DialogProps) => (
  <ClientOnly>
    <DialogImplementation {...props} />
  </ClientOnly>
);
