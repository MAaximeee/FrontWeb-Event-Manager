const Scoreboard = () => {
  return (
    <div className="w-full bg-zinc-800 rounded-lg flex items-center justify-between px-6 sm:px-10 py-8 sm:py-12 text-white">
      {/* Équipe 1 */}
      <div className="flex-1 text-center">
        <p className="text-sm sm:text-base lg:text-lg font-semibold">
          Équipe A
        </p>
      </div>

      {/* Score */}
      <div className="flex items-center gap-3 text-xl sm:text-2xl font-bold">
        <span>2</span>
        <span className="text-gray-500">-</span>
        <span>1</span>
      </div>

      {/* Équipe 2 */}
      <div className="flex-1 text-center">
        <p className="text-sm sm:text-base lg:text-lg font-semibold">
          Équipe B
        </p>
      </div>
    </div>
  );
};

export default Scoreboard;
