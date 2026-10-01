export function Avatar({
  name,
  size = "md",
  color,
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  color?: string;
}) {
  const dim =
    size === "sm"
      ? "h-5 w-5 text-[9px]"
      : size === "lg"
        ? "h-14 w-14 text-lg"
        : "h-9 w-9 text-xs";

  return (
    <div
      className={`${dim} flex shrink-0 items-center justify-center rounded-md font-semibold text-white`}
      style={{ backgroundColor: color ?? stringToColor(name) }}
    >
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}

function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const colors = ["#0b1c2c", "#ff4a1c", "#0f9f6e", "#1a6b9c", "#c98500", "#5a3d8a"];
  return colors[Math.abs(hash) % colors.length];
}
