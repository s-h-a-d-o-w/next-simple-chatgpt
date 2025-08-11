import { formatDistance } from "date-fns/formatDistance";
import { css } from "../../../../styled-system/css";
import { IconButton } from "@/components/IconButton";
import { Message } from "../Message";
import { styled } from "../../../../styled-system/jsx";
import { HistoryEntryV1 } from "@/hooks/useHistory";

type Props = {
  entry: HistoryEntryV1;
  onDeleteHistoryEntry: () => void;
  onSetActiveHistoryEntry: () => void;
};

const StyledDeleteButton = styled(IconButton, {
  base: {
    position: "absolute",
    top: "8rem",
    right: "8rem",
  },
});

export function ShortenedEntry({
  entry,
  onDeleteHistoryEntry,
  onSetActiveHistoryEntry,
}: Props) {
  const firstUserMessage = entry.messages[1];

  return !firstUserMessage ? null : (
    <div>
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
          onClick={onSetActiveHistoryEntry}
        />
        <StyledDeleteButton
          name="delete"
          type="button"
          iconSize="md"
          variant="ghost"
          onClick={onDeleteHistoryEntry}
        />
      </div>
    </div>
  );
}
