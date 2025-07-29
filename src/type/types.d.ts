interface BotController {
  start: () => Promise<void>;
  stop: () => void;
  status: () => boolean;
}

interface Bot {
  id: string;
  name: string;
  status: boolean;
}