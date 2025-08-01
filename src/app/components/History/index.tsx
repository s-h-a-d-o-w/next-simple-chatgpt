import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { debounce } from "lodash";
import { useCallback, useEffect, useRef, useState } from "react";
import { styled } from "../../../../styled-system/jsx";
import { Messages } from "../Messages";
import { HistoryHeader } from "./HistoryHeader";
import { ShortenedEntry } from "./ShortenedEntry";
import { HistoryEntry } from "@/hooks/useHistory";

type Props = {
  conversationHistory: HistoryEntry[];
  isOpen: boolean;
  onClose: () => void;
  onDeleteHistoryEntry: (index: number) => void;
  onRestoreHistoryEntry: () => void;
  onSetActiveHistoryEntry: (messages?: HistoryEntry) => void;
  onDeleteHistory: () => void;
  onLoad: () => void;
  onSave: () => void;

  activeHistoryEntry?: HistoryEntry;
};

const StyledHistory = styled("div", {
  base: {
    position: "fixed",

    overflow: "auto",
    backgroundColor: "amber.50",
    padding: "12rem",
    border: "2px solid token(colors.amber.800)",
    boxShadow: "token(colors.amber.900) 1px 1px 0px 0px",

    display: "flex",
    flexDirection: "column",
    gap: "8rem",

    _dark: {
      backgroundColor: "gray.900",
      color: "gray.50",
      border: "none",
      boxShadow: "none",
    },
  },

  variants: {
    type: {
      entry: {
        width: "85%",
        height: "43%",

        left: "16rem",
        bottom: "16rem",

        md: {
          width: "52%",
          height: "93%",

          top: "24rem",
          left: "16rem",
        },
      },
      overview: {
        width: "85%",
        maxHeight: "45%",

        top: "64rem",
        right: "16rem",

        md: {
          width: "43%",
          maxHeight: "80%",

          top: "64rem",
          right: "16rem",
        },
      },
    },
  },
});

const StyledSearchInput = styled("input", {
  base: {
    width: "100%",
    padding: "8rem",

    backgroundColor: "white",
    border: "2rem solid token(colors.amber.800)",
    _dark: {
      backgroundColor: "gray.700",
      borderColor: "gray.50",
    },
  },
});

export const History = function History({
  activeHistoryEntry,
  conversationHistory,
  isOpen,
  onClose,
  onDeleteHistoryEntry,
  onRestoreHistoryEntry,
  onSetActiveHistoryEntry,
  onDeleteHistory,
  onLoad,
  onSave,
}: Props) {
  const [searchTerms, setSearchTerms] = useState<string[]>();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (
      isOpen &&
      searchInputRef.current &&
      !/Mobi|Android/i.test(navigator.userAgent)
    ) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerms(value === "" ? undefined : value.toLowerCase().split(" "));
    }, 200),
    [],
  );

  const filteredHistory = !searchTerms
    ? conversationHistory
    : conversationHistory.filter((entry) => {
        return searchTerms.every((term) =>
          entry.messages.some((message) =>
            message.parts.some(
              (part) =>
                part.type === "text" && part.text.toLowerCase().includes(term),
            ),
          ),
        );
      });

  return (
    <Dialog
      suppressNativeFocus
      isModal={false}
      isOpen={isOpen}
      onClose={onClose}
    >
      <StyledHistory type="overview">
        <HistoryHeader
          conversationHistory={conversationHistory}
          onDeleteHistory={onDeleteHistory}
          onLoad={onLoad}
          onSave={onSave}
        />

        <StyledSearchInput
          ref={searchInputRef}
          type="text"
          placeholder="Search..."
          onChange={(e) => debouncedSearch(e.target.value)}
        />

        {filteredHistory
          .slice(0)
          .reverse()
          .map((entry, index) =>
            !entry.messages[1] ? null : (
              <ShortenedEntry
                key={index}
                entry={entry}
                onDeleteHistoryEntry={() => {
                  if (activeHistoryEntry === entry) {
                    onSetActiveHistoryEntry(undefined);
                  }
                  const index = conversationHistory.findIndex(
                    (_entry) => _entry === entry,
                  );
                  onDeleteHistoryEntry(index);
                }}
                onSetActiveHistoryEntry={() => {
                  onSetActiveHistoryEntry(entry);
                }}
              />
            ),
          )}
      </StyledHistory>

      {activeHistoryEntry && (
        <StyledHistory type="entry">
          <Button
            onClick={onRestoreHistoryEntry}
            style={{ alignSelf: "flex-end" }}
          >
            Restore
          </Button>
          <Messages messages={activeHistoryEntry.messages} />
        </StyledHistory>
      )}
    </Dialog>
  );
};
