import { Button } from "@/components/Button";
import { Dialog } from "@/components/Dialog";
import { cloneDeep, debounce } from "lodash-es";
import {
  CURRENT_HISTORY_VERSION,
  historySerializer,
  useHistory,
} from "@/app/(protected)/hooks/useHistory";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { styled } from "@/styled-system/jsx";
import { Messages } from "../Messages";
import { HistoryHeader } from "./HistoryHeader";
import { ShortenedEntry } from "./ShortenedEntry";
import { useAtom, useSetAtom } from "jotai";
import {
  activeHistoryEntryAtom,
  chatStartTimeAtom,
  isHistoryOpenAtom,
  systemPromptAtom,
} from "../../atoms";
import { saveJsonFile } from "@/app/(protected)/components/History/utils/saveJsonFile";
import { loadJsonFile } from "@/app/(protected)/components/History/utils/loadJsonFile";
import type { UIMessage } from "ai";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { isDeleteConfirmationOpenAtom } from "./atoms";

type Props = {
  setMessages: (
    messages: UIMessage[] | ((messages: UIMessage[]) => UIMessage[]),
  ) => void;
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

export const History = memo(function History({ setMessages }: Props) {
  const [activeHistoryEntry, setActiveHistoryEntry] = useAtom(
    activeHistoryEntryAtom,
  );
  const [isOpen, setIsHistoryOpen] = useAtom(isHistoryOpenAtom);
  const setSystemPrompt = useSetAtom(systemPromptAtom);
  const setIsDeleteConfirmationOpen = useSetAtom(isDeleteConfirmationOpenAtom);
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

  const handleDeleteHistory = useCallback(() => {
    setIsDeleteConfirmationOpen(true);
  }, [setIsDeleteConfirmationOpen]);

  const handleDeleteHistoryEntry = useCallback(
    (index: number) => {
      const nextHistory = cloneDeep(conversationHistory);
      nextHistory.splice(index, 1);
      setConversationHistory(nextHistory);
    },
    [conversationHistory, setConversationHistory],
  );

  const handleLoadHistory = useCallback(async () => {
    try {
      setConversationHistory(historySerializer.parse(await loadJsonFile()));
    } catch {
      // TODO: user cancelled or picked nonsense. should probably show error.
    }
  }, [setConversationHistory]);

  const handleSaveHistory = useCallback(() => {
    saveJsonFile(
      {
        version: CURRENT_HISTORY_VERSION,
        history: conversationHistory,
      },
      `history-${new Date().toISOString().replaceAll(/[:.]/g, "-")}`,
    );
  }, [conversationHistory]);

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
      onClose={handleCloseHistory}
    >
      <StyledHistory type="overview">
        <HistoryHeader
          conversationHistory={conversationHistory}
          onDeleteHistory={handleDeleteHistory}
          onLoad={handleLoadHistory}
          onSave={handleSaveHistory}
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
          .map((entry) =>
            !entry.messages[1] ? null : (
              <ShortenedEntry
                key={entry.startTime}
                entry={entry}
                onDeleteHistoryEntry={() => {
                  if (activeHistoryEntry === entry) {
                    setActiveHistoryEntry(undefined);
                  }
                  const index = conversationHistory.findIndex(
                    (_entry) => _entry === entry,
                  );
                  handleDeleteHistoryEntry(index);
                }}
                onSetActiveHistoryEntry={() => {
                  setActiveHistoryEntry(entry);
                }}
              />
            ),
          )}
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
