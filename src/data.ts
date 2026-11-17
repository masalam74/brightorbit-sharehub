export type Person = {
  id: string;
  name: string;
  email: string;
  attended: boolean;
};
export type Workshop = {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  time: string;
  location: string;
  host: string;
  capacity: number;
  color: string;
  participants: Person[];
  resources: { id: string; title: string; url: string }[];
  feedback: { name: string; rating: number; comment: string }[];
};
export type Workspace = {
  workshops: Workshop[];
  events: { action: string; at: string }[];
};
export const uid = () => crypto.randomUUID();
const people = (names: string[], attended = 0): Person[] =>
  names.map((name, i) => ({
    id: `p-${i}`,
    name,
    email: `${name.toLowerCase().replaceAll(" ", ".")}@example.com`,
    attended: i < attended,
  }));
export function examples(): Workshop[] {
  return [
    {
      id: "creative",
      title: "Creative Thinking Lab",
      category: "DESIGN & CREATIVITY",
      description:
        "Turn everyday challenges into fresh ideas. A hands-on session in creative confidence, playful experiments, and better problem-solving.",
      date: "2026-12-04",
      time: "10:00",
      location: "The Studio · Helsinki",
      host: "Maya Chen",
      capacity: 24,
      color: "peach",
      participants: people(
        [
          "Alex Morgan",
          "Sam Rivera",
          "Jordan Lee",
          "Taylor Reed",
          "Priya Shah",
          "Noah Brooks",
          "Ava Patel",
          "Liam Chen",
        ],
        5,
      ),
      resources: [
        {
          id: "r1",
          title: "Creative thinking field guide",
          url: "https://www.designkit.org/methods.html",
        },
      ],
      feedback: [
        { name: "Alex", rating: 5, comment: "Loved the practical exercises!" },
      ],
    },
    {
      id: "pottery",
      title: "A Little Clay, A Lot of Joy",
      category: "ARTS & CRAFTS",
      description:
        "Slow down, get your hands messy, and shape your very first ceramic piece. All materials and a good cup of tea included.",
      date: "2026-12-08",
      time: "14:00",
      location: "Clay House · Helsinki",
      host: "Sofia Laine",
      capacity: 12,
      color: "sage",
      participants: people(
        [
          "Emma Wilson",
          "Oliver Kim",
          "Isla Brown",
          "Leo Davis",
          "Mia Garcia",
          "Finn White",
        ],
        0,
      ),
      resources: [],
      feedback: [],
    },
    {
      id: "story",
      title: "Tell Your Brand Story",
      category: "BUSINESS & GROWTH",
      description:
        "Find the story only you can tell. Build a clear, authentic brand narrative that connects with the people who matter.",
      date: "2026-11-12",
      time: "09:30",
      location: "Online · Demo meeting room",
      host: "Daniel Okafor",
      capacity: 20,
      color: "lavender",
      participants: people(
        ["Amelia Scott", "Ethan Moore", "Harper Jones", "Lucas Hill"],
        4,
      ),
      resources: [
        {
          id: "r2",
          title: "Storytelling workbook",
          url: "https://www.ideo.com/",
        },
      ],
      feedback: [
        { name: "Harper", rating: 5, comment: "I finally found my voice." },
        {
          name: "Lucas",
          rating: 4,
          comment: "Useful frameworks and thoughtful facilitation.",
        },
      ],
    },
  ];
}
export const KEY = "brightorbit-sharehub-v1";
export const empty = (): Workspace => ({ workshops: [], events: [] });
export function load(): Workspace {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "null");
    if (
      v &&
      Array.isArray(v.workshops) &&
      Array.isArray(v.events) &&
      v.workshops.every(
        (w: Workshop) =>
          typeof w.id === "string" &&
          Array.isArray(w.participants) &&
          Array.isArray(w.resources) &&
          Array.isArray(w.feedback),
      )
    )
      return v;
  } catch {}
  return { workshops: examples(), events: [] };
}
export function stats(ws: Workshop[]) {
  const p = ws.flatMap((w) => w.participants),
    f = ws.flatMap((w) => w.feedback);
  return {
    workshops: ws.length,
    participants: p.length,
    attendance: p.length
      ? Math.round((p.filter((p) => p.attended).length / p.length) * 100)
      : 0,
    rating: f.length
      ? (f.reduce((s, f) => s + f.rating, 0) / f.length).toFixed(1)
      : "—",
  };
}
export function register(w: Workshop, name: string, email: string): Workshop {
  if (w.participants.length >= w.capacity)
    throw Error("This workshop is full.");
  if (w.participants.some((p) => p.email.toLowerCase() === email.toLowerCase()))
    throw Error("This email is already registered.");
  return {
    ...w,
    participants: [
      ...w.participants,
      { id: uid(), name, email, attended: false },
    ],
  };
}
