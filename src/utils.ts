export type Cluster = "voice" | "move" | "mind" | "heart";

export type CounterId = Cluster | "heart,move" | "heart,voice";

export const getCounterColor = (counterId: CounterId) => {
  switch (counterId) {
    case "heart,move":
      return "from-red-700 to-green-700";
    case "heart,voice":
      return "from-red-700 to-yellow-700";
    case "voice":
      return "from-yellow-700 via-yellow-800 to-yellow-700";
    case "move":
      return "from-green-700 via-green-800 to-green-700";
    case "mind":
      return "from-blue-700 via-blue-800 to-blue-700";
    case "heart":
      return "from-red-700 via-red-800 to-red-700";
  }
};

export const getCounterColorLight = (counterId: CounterId) => {
  switch (counterId) {
    case "voice":
      return "from-yellow-300 via-yellow-250 to-yellow-300";
    case "move":
      return "from-green-300 via-green-250 to-green-300";
    case "mind":
      return "from-blue-300 via-blue-250 to-blue-300";
    case "heart":
      return "from-red-300 via-red-250 to-red-300";
  }
};

export const getButtonColor = (counterId: CounterId) => {
  switch (counterId) {
    case "voice":
      return "bg-yellow-500";
    case "move":
      return "bg-green-500";
    case "mind":
      return "bg-blue-500";
    case "heart":
      return "bg-red-500";
  }
};
