export type Side = 'tark' | 'vitark';

export interface Argument {
  id: number;
  side: Side;
  text: string;
}

export interface Debate {
  topic: string;
  arguments: Argument[];
}
