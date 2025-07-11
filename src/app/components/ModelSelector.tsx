import { models, type ModelKey } from "@/utils/consts";
import { MdImage } from "react-icons/md";
import { styled } from "../../../styled-system/jsx";

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
  value: ModelKey;
  onChange: (value: ModelKey) => void;
  showAttachmentModelsOnly: boolean;
};

export function ModelSelector({
  value,
  onChange,
  showAttachmentModelsOnly,
}: Props) {
  return (
    <StyledSelectContainer>
      <StyledSelect
        value={value}
        onChange={(e) => onChange(e.target.value as ModelKey)}
      >
        {Object.entries(models)
          .filter(([_, { supportsAttachments }]) =>
            showAttachmentModelsOnly ? supportsAttachments : true,
          )
          .map(([id, { name, input, output }]) => (
            <option key={id} value={id}>
              {name} (in: ${input}/out: ${output} per 1Mt)
            </option>
          ))}
      </StyledSelect>
      {models[value].supportsAttachments && <StyledImageIcon />}
    </StyledSelectContainer>
  );
}
