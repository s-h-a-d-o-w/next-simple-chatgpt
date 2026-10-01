import type { ClassAttributes, HTMLAttributes } from "react";
import type { ExtraProps } from "react-markdown";
import { css } from "@/styled-system/css";

const cellStyle = css({
  padding: "6rem 12rem",
  border: "1px solid token(colors.surface.secondary.border)",
});

export function HeaderCell({
  node,
  children,
  ...props
}: ClassAttributes<HTMLTableCellElement> &
  HTMLAttributes<HTMLTableCellElement> &
  ExtraProps) {
  return (
    <th {...props} className={cellStyle}>
      {children}
    </th>
  );
}

export function Cell({
  node,
  children,
  ...props
}: ClassAttributes<HTMLTableCellElement> &
  HTMLAttributes<HTMLTableCellElement> &
  ExtraProps) {
  return (
    <td {...props} className={cellStyle}>
      {children}
    </td>
  );
}

const rowStyle = css({
  _even: {
    backgroundColor: "surface.secondary.raised",
  },
});

export function Row({
  node,
  children,
  ...props
}: ClassAttributes<HTMLTableRowElement> &
  HTMLAttributes<HTMLTableRowElement> &
  ExtraProps) {
  return (
    <tr {...props} className={rowStyle}>
      {children}
    </tr>
  );
}
