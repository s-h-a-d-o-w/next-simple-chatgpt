import { formatDistance } from "date-fns/formatDistance";
import { css } from "@/styled-system/css";
import { IconButton } from "@/components/IconButton";
import { Message } from "../Message";
import { styled } from "@/styled-system/jsx";
import { HistoryEntryV1 } from "@/app/(protected)/hooks/useHistory";
import { RowComponentProps } from "react-window";

type Props = {
  filteredHistory: HistoryEntryV1[];
  onDeleteHistoryEntry: (entry: HistoryEntryV1) => void;
  onSetActiveHistoryEntry: (entry: HistoryEntryV1) => void;
};

const StyledDeleteButton = styled(IconButton, {
  base: {
    position: "absolute",
    top: "8rem",
    right: "8rem",
  },
});

export function ShortenedEntry({
  filteredHistory,
  index,
  onDeleteHistoryEntry,
  onSetActiveHistoryEntry,
  style,
}: RowComponentProps<Props>) {
  const entry = filteredHistory[index];
  const firstUserMessage = entry?.messages[1];

  return !firstUserMessage ? null : (
    <div style={style}>
      <div style={{ paddingBottom: "8rem" }}>
        <div
          className={css({
            fontSize: "sm",
          })}
        >
          {entry.startTime
            ? formatDistance(entry.startTime, new Date(), {
                addSuffix: true,
              })
            : ""}
        </div>
        <div style={{ position: "relative" }}>
          <Message
            {...firstUserMessage}
            shortened
            onClick={() => onSetActiveHistoryEntry(entry)}
          />
          <StyledDeleteButton
            name="delete"
            type="button"
            iconSize="md"
            variant="ghost"
            onClick={() => onDeleteHistoryEntry(entry)}
          />
        </div>
      </div>
    </div>
  );
}
