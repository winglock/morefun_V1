interface TileProps {
  isMine: boolean;
  onClick: () => void;
}

export default function Tile({ isMine, onClick }: TileProps) {
  return (
    <button
      onClick={onClick}
      className={`w-16 h-16 rounded text-2xl font-bold transition ${
        isMine ? "bg-red-600" : "bg-gray-400"
      }`}
    >
      {isMine ? "💣" : ""}
    </button>
  );
}
