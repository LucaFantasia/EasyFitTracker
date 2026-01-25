import { WorkoutDraftProvider } from "./WorkoutDraftProvider";

export default function WorkoutNewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkoutDraftProvider>{children}</WorkoutDraftProvider>;
}
