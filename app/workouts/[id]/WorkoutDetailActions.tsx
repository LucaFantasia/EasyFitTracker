import Link from "next/link";
import { deleteWorkout } from "./actions";
import { Row, Button } from "@/app/_components/ui";

export default function WorkoutDetailActions({
  workoutId,
}: {
  workoutId: string;
}) {
  return (
    <Row gap={12}>
      <Link href={`/workouts/${workoutId}/edit`}>
        <Button variant="ghost">Edit name</Button>
      </Link>

      <form action={deleteWorkout}>
        <input type="hidden" name="id" value={workoutId} />
        <Button variant="danger">Delete</Button>
      </form>
    </Row>
  );
}
