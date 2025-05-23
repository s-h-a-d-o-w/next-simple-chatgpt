import type { ClassAttributes, HTMLAttributes } from "react";
import type { ExtraProps } from "react-markdown";
import { css } from "../../../../styled-system/css";

export const cellStyle = css({
  padding: "6rem 12rem",
  border: "1px solid token(colors.stone.400)",
});

export const HeaderCell = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  node,
  children,
  ...props
}: ClassAttributes<HTMLTableCellElement> &
  HTMLAttributes<HTMLTableCellElement> &
  ExtraProps) => (
  <th {...props} className={cellStyle}>
    {children}
  </th>
);

export const Cell = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  node,
  children,
  ...props
}: ClassAttributes<HTMLTableCellElement> &
  HTMLAttributes<HTMLTableCellElement> &
  ExtraProps) => (
  <td {...props} className={cellStyle}>
    {children}
  </td>
);

export const rowStyle = css({
  _even: {
    backgroundColor: "stone.200",
  },
});

export const Row = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  node,
  children,
  ...props
}: ClassAttributes<HTMLTableRowElement> &
  HTMLAttributes<HTMLTableRowElement> &
  ExtraProps) => (
  <tr {...props} className={rowStyle}>
    {children}
  </tr>
);
