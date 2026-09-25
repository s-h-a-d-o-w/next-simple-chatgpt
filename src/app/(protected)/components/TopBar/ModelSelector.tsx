import type { ModelKey } from "@/lib/server/models";
import { MdImage } from "react-icons/md";
import { styled } from "@/styled-system/jsx";
import { objectEntries } from "@/lib/utils/objectEntries";
import { useModels } from "@/app/(protected)/hooks/useModels";
import { useModelSelection } from "@/app/(protected)/hooks/useModelSelection";

const StyledSelect = styled("select", {
  base: {
    padding: "4rem 8rem",
    border: "2rem solid token(colors.amber.800)",
    backgroundColor: "white",
    cursor: "pointer",
    width: "100%",
    maxWidth: "340rem",
    textOverflow: "ellipsis",

    _dark: {
      borderColor: "brand.500",
      backgroundColor: "gray.700",
    },
  },
});

const StyledImageIcon = styled(MdImage, {
  base: {
    position: "absolute",
    right: "12rem",
    top: "0",
    width: "auto",
    height: "100%",
    padding: "4rem",
    pointerEvents: "none",
  },
});

const StyledSelectContainer = styled("div", {
  base: {
    position: "relative",
    flexGrow: 1,
    display: "flex",
    justifyContent: "flex-end",
  },
});

type Props = {
  showAttachmentModelsOnly: boolean;
};

export function ModelSelector({ showAttachmentModelsOnly }: Props) {
  const models = useModels();
  const { model, setModel } = useModelSelection();

  return (
    <StyledSelectContainer>
      <StyledSelect
        value={model}
        onChange={(e) => setModel(e.target.value as ModelKey)}
      >
        {objectEntries(models)
          .filter(([, { supportsAttachments }]) =>
            showAttachmentModelsOnly ? supportsAttachments : true,
          )
          .map(([id, { name, input, output }]) => (
            <option key={id} value={id}>
              {name} (in: ${input}/out: ${output} per 1Mt)
            </option>
          ))}
      </StyledSelect>
      {models[model].supportsAttachments && <StyledImageIcon />}
    </StyledSelectContainer>
  );
}
