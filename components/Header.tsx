"use client";

interface HeaderProps {
  clientName: string;
}

export default function Header({ clientName }: HeaderProps) {
  return (
    <header className="bg-gray-900 text-white px-6 py-4 flex items-center gap-3 shadow-lg">
      {/* Ad Pilot Logo - Blue Diamond */}
      <div className="flex items-center justify-center w-10 h-10">
        <svg
          viewBox="0 0 40 40"
          className="w-10 h-10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Diamond shape */}
          <path
            d="M20 2L38 20L20 38L2 20L20 2Z"
            fill="#3B82F6"
            stroke="#60A5FA"
            strokeWidth="1"
          />
          {/* Inner highlight */}
          <path
            d="M20 8L32 20L20 32L8 20L20 8Z"
            fill="#60A5FA"
            opacity="0.5"
          />
          {/* Play button triangle */}
          <path
            d="M16 13L28 20L16 27V13Z"
            fill="white"
          />
        </svg>
      </div>

      {/* Title */}
      <div className="flex flex-col">
        <h1 className="text-xl font-bold tracking-tight">
          Ad Pilot
          <span className="text-primary-400 font-normal"> for {clientName}</span>
        </h1>
        <p className="text-xs text-gray-400">Reach your community — where they are.</p>
      </div>
    </header>
  );
}
