import { useLocalStorage } from "react-use";

export default function Settings() {
  const [value, setValue] = useLocalStorage("apiKey", "");

  return (
    <main>
      API key:{" "}
      <input
        onChange={(event) => {
          setValue(event.target.value);
        }}
        value={value}
      />
    </main>
  );
}
