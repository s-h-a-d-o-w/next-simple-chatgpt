import DialogImplementation, { type DialogProps } from "./DialogImplementation";
import { ClientOnly } from "./ClientOnly";

export const Dialog = ({ ...props }: DialogProps) => {
  return (
    <ClientOnly>
      <DialogImplementation {...props} />
    </ClientOnly>
  );
};
