import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { cloneDeep, debounce } from "lodash-es";
import {
  useHistory,
  type HistoryEntryV1,
} from "@/app/(protected)/hooks/useHistory";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { styled } from "@/styled-system/jsx";
import { Messages } from "../Messages";
import { List, useDynamicRowHeight } from "react-window";
import { HistoryHeader } from "./HistoryHeader";
import { ShortenedEntry } from "./ShortenedEntry";
import { useAtom, useSetAtom } from "jotai";
import {
  activeHistoryEntryAtom,
  chatStartTimeAtom,
  isHistoryOpenAtom,
  systemPromptAtom,
} from "../../atoms";
import type { SetMessages } from "@/types";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";

type Props = {
  setMessages: SetMessages;
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
        height: "45%",

        top: "64rem",
        right: "16rem",

        md: {
          width: "43%",
          height: "80%",

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

export const History = memo(function History({ setMessages }: Props) {
  const [activeHistoryEntry, setActiveHistoryEntry] = useAtom(
    activeHistoryEntryAtom,
  );
  const [isOpen, setIsHistoryOpen] = useAtom(isHistoryOpenAtom);
  const setSystemPrompt = useSetAtom(systemPromptAtom);
  const setStartTime = useSetAtom(chatStartTimeAtom);

  const [conversationHistory, setConversationHistory] = useHistory();

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

  const handleCloseHistory = useCallback(() => {
    setIsHistoryOpen(false);
    setActiveHistoryEntry(undefined);
  }, [setActiveHistoryEntry, setIsHistoryOpen]);

  const handleDeleteHistoryEntry = useCallback(
    (entry: HistoryEntryV1) => {
      if (activeHistoryEntry === entry) {
        setActiveHistoryEntry(undefined);
      }

      const nextHistory = cloneDeep(conversationHistory);
      const entryIndex = nextHistory.findIndex((_entry) => _entry === entry);
      nextHistory.splice(entryIndex, 1);
      setConversationHistory(nextHistory);
    },
    [
      activeHistoryEntry,
      conversationHistory,
      setActiveHistoryEntry,
      setConversationHistory,
    ],
  );

  const handleRestoreHistoryEntry = useCallback(() => {
    if (activeHistoryEntry) {
      setConversationHistory((history) =>
        history.filter(
          (entry) => entry.startTime !== activeHistoryEntry.startTime,
        ),
      );
      setMessages(activeHistoryEntry.messages);
      setStartTime(Date.now());
      setActiveHistoryEntry(undefined);
      setIsHistoryOpen(false);
      if (activeHistoryEntry.messages[0]?.parts[0]?.type === "text") {
        setSystemPrompt(activeHistoryEntry.messages[0].parts[0].text);
      }
    }
  }, [
    activeHistoryEntry,
    setActiveHistoryEntry,
    setConversationHistory,
    setIsHistoryOpen,
    setMessages,
    setStartTime,
    setSystemPrompt,
  ]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerms(value === "" ? undefined : value.toLowerCase().split(" "));
    }, 200),
    [],
  );

  const filteredHistory = useMemo(
    () =>
      (!searchTerms
        ? conversationHistory
        : conversationHistory.filter((entry) => {
            return searchTerms.every((term) =>
              entry.messages.some((message) =>
                message.parts.some(
                  (part) =>
                    part.type === "text" &&
                    part.text.toLowerCase().includes(term),
                ),
              ),
            );
          })
      ).toReversed(),
    [conversationHistory, searchTerms],
  );

  const rowHeight = useDynamicRowHeight({
    defaultRowHeight: 500,
  });

  return (
    <Dialog
      suppressNativeFocus
      isModal={false}
      isOpen={isOpen}
      onClose={handleCloseHistory}
    >
      <StyledHistory type="overview">
        <HistoryHeader />

        <StyledSearchInput
          ref={searchInputRef}
          type="text"
          placeholder="Search..."
          onChange={(e) => debouncedSearch(e.target.value)}
        />

        <List
          rowComponent={ShortenedEntry}
          rowCount={filteredHistory.length}
          rowHeight={rowHeight}
          rowProps={{
            filteredHistory,
            onDeleteHistoryEntry: handleDeleteHistoryEntry,
            onSetActiveHistoryEntry: setActiveHistoryEntry,
          }}
        />
      </StyledHistory>

      {activeHistoryEntry && (
        <StyledHistory type="entry">
          <Button
            onClick={handleRestoreHistoryEntry}
            style={{ alignSelf: "flex-end" }}
          >
            Restore
          </Button>
          <Messages messages={activeHistoryEntry.messages} />
        </StyledHistory>
      )}

      <DeleteConfirmationModal />
    </Dialog>
  );
});
